// ============================================
// DHAKANEST AI SEARCH ALGORITHM
// Natural Language Processing + Weighted Matching
// ============================================

class DhakaNestSearchEngine {
    constructor(database) {
        this.db = database;
        this.locationKeywords = {
            'dhanmondi': 'Dhanmondi',
            'gulshan': 'Gulshan',
            'banani': 'Banani',
            'uttara': 'Uttara',
            'mirpur': 'Mirpur',
            'mohammadpur': 'Mohammadpur',
            'tejgaon': 'Tejgaon',
            'khilgaon': 'Khilgaon',
            'bashundhara': 'Bashundhara',
            'baridhara': 'Baridhara'
        };
        
        this.amenityKeywords = {
            'mosque': 'Mosque',
            'masjid': 'Mosque',
            'market': 'Market',
            'shopping': 'Market',
            'bus': 'Bus Stop',
            'bus stop': 'Bus Stop',
            'metro': 'Metro Station',
            'subway': 'Metro Station',
            'hospital': 'Hospital',
            'clinic': 'Hospital',
            'park': 'Park',
            'school': 'School',
            'college': 'School',
            'university': 'School',
            'bank': 'Bank'
        };
        
        this.weights = {
            location: 35,
            rent: 25,
            rooms: 20,
            amenities: 15,
            preferences: 5
        };
    }

    // Main search function
    search(query, filters = {}) {
        const parsedQuery = this.parseNaturalLanguage(query);
        const combinedFilters = { ...parsedQuery, ...filters };
        const results = this.calculateMatches(combinedFilters);
        
        // Save search to history
        this.db.saveSearch(query, results);
        
        return {
            query: query,
            parsed: combinedFilters,
            results: results,
            total: results.length,
            timestamp: new Date().toISOString()
        };
    }

    // Parse natural language query
    parseNaturalLanguage(query) {
        const lowerQuery = query.toLowerCase();
        const parsed = {
            locations: [],
            maxRent: null,
            minRent: null,
            rooms: null,
            amenities: [],
            hasLift: null,
            hasGarage: null,
            gasType: null,
            electricityType: null,
            keywords: []
        };

        // Extract locations
        for (const [keyword, location] of Object.entries(this.locationKeywords)) {
            if (lowerQuery.includes(keyword)) {
                parsed.locations.push(location);
            }
        }

        // Extract rent (multiple patterns)
        const rentPatterns = [
            /(?:under|below|less than|max|maximum)\s*(\d+)\s*(?:taka|tk|bdt)?/i,
            /(\d+)\s*(?:taka|tk|bdt)?\s*(?:per month|monthly)?/i,
            /(?:between)\s*(\d+)\s*(?:and|to|-)\s*(\d+)/i
        ];
        
        for (const pattern of rentPatterns) {
            const match = lowerQuery.match(pattern);
            if (match) {
                if (match[2]) {
                    parsed.minRent = parseInt(match[1]);
                    parsed.maxRent = parseInt(match[2]);
                } else {
                    parsed.maxRent = parseInt(match[1]);
                }
                break;
            }
        }

        // Extract rooms
        const roomPatterns = [
            /(\d+)\s*(?:bedroom|room|bed|br|bhk)/i,
            /(?:studio|single)\s*(?:room)?/i
        ];
        
        for (const pattern of roomPatterns) {
            const match = lowerQuery.match(pattern);
            if (match) {
                if (match[1]) {
                    parsed.rooms = parseInt(match[1]);
                } else if (lowerQuery.includes('studio')) {
                    parsed.rooms = 1;
                }
                break;
            }
        }

        // Extract amenities
        for (const [keyword, amenity] of Object.entries(this.amenityKeywords)) {
            if (lowerQuery.includes(keyword)) {
                parsed.amenities.push(amenity);
            }
        }

        // Extract features
        parsed.hasLift = lowerQuery.includes('lift') || lowerQuery.includes('elevator');
        parsed.hasGarage = lowerQuery.includes('garage') || lowerQuery.includes('parking');
        
        if (lowerQuery.includes('line') || lowerQuery.includes('piped')) {
            parsed.gasType = 'Line';
        } else if (lowerQuery.includes('cylinder')) {
            parsed.gasType = 'Cylinder';
        }
        
        if (lowerQuery.includes('prepaid')) {
            parsed.electricityType = 'Prepaid';
        } else if (lowerQuery.includes('postpaid')) {
            parsed.electricityType = 'Postpaid';
        }

        // Extract preferences
        const preferenceKeywords = ['family', 'bachelor', 'professional', 'student', 'shared'];
        for (const keyword of preferenceKeywords) {
            if (lowerQuery.includes(keyword)) {
                parsed.keywords.push(keyword);
            }
        }

        return parsed;
    }

    // Calculate matches with weighted scoring
    calculateMatches(filters) {
        const flats = this.db.getAllFlats();
        const scoredFlats = flats.map(flat => {
            let score = 0;
            const matchDetails = [];

            // Location match (35%)
            const locationScore = this.calculateLocationScore(flat, filters);
            score += locationScore.score;
            if (locationScore.details) matchDetails.push(locationScore.details);

            // Rent match (25%)
            const rentScore = this.calculateRentScore(flat, filters);
            score += rentScore.score;
            if (rentScore.details) matchDetails.push(rentScore.details);

            // Rooms match (20%)
            const roomsScore = this.calculateRoomsScore(flat, filters);
            score += roomsScore.score;
            if (roomsScore.details) matchDetails.push(roomsScore.details);

            // Amenities match (15%)
            const amenitiesScore = this.calculateAmenitiesScore(flat, filters);
            score += amenitiesScore.score;
            if (amenitiesScore.details) matchDetails.push(amenitiesScore.details);

            // Preferences match (5%)
            const preferencesScore = this.calculatePreferencesScore(flat, filters);
            score += preferencesScore.score;
            if (preferencesScore.details) matchDetails.push(preferencesScore.details);

            // Bonus for high ratings
            if (flat.rating >= 4.5) {
                score += 5;
                matchDetails.push(`⭐ High-rated (${flat.rating} stars)`);
            }

            return {
                ...flat,
                matchScore: Math.min(100, Math.round(score)),
                matchDetails: matchDetails,
                matchHighlights: this.generateHighlights(flat, filters)
            };
        });

        // Sort by match score
        scoredFlats.sort((a, b) => b.matchScore - a.matchScore);
        
        // Add rank
        scoredFlats.forEach((flat, index) => {
            flat.rank = index + 1;
        });

        return scoredFlats;
    }

    calculateLocationScore(flat, filters) {
        if (filters.locations && filters.locations.length > 0) {
            const match = filters.locations.some(loc => 
                flat.location.toLowerCase().includes(loc.toLowerCase())
            );
            if (match) {
                return { score: this.weights.location, details: `📍 Matches your preferred location (${flat.location})` };
            } else {
                return { score: 0, details: `📍 Location doesn't match preferred areas` };
            }
        }
        return { score: this.weights.location * 0.6, details: `📍 Located in ${flat.location}` };
    }

    calculateRentScore(flat, filters) {
        let score = 0;
        if (filters.maxRent && flat.rent <= filters.maxRent) {
            score = this.weights.rent;
            const savings = filters.maxRent - flat.rent;
            if (savings > 5000) {
                score += 5;
                return { score: score, details: `💰 Rent ৳${flat.rent} (Save ৳${savings}/month vs budget)` };
            }
            return { score: score, details: `💰 Within budget: ৳${flat.rent} ≤ ৳${filters.maxRent}` };
        } else if (filters.minRent && filters.maxRent && flat.rent >= filters.minRent && flat.rent <= filters.maxRent) {
            score = this.weights.rent;
            return { score: score, details: `💰 Rent ৳${flat.rent} within your range` };
        } else if (filters.maxRent && flat.rent > filters.maxRent) {
            const over = flat.rent - filters.maxRent;
            const penalty = Math.min(15, Math.floor(over / 1000) * 3);
            return { score: Math.max(0, this.weights.rent - penalty), details: `💰 Over budget by ৳${over}` };
        }
        return { score: this.weights.rent * 0.5, details: `💰 Rent: ৳${flat.rent}/month` };
    }

    calculateRoomsScore(flat, filters) {
        if (filters.rooms) {
            if (flat.rooms === filters.rooms) {
                return { score: this.weights.rooms, details: `🛏️ Exactly ${flat.rooms} rooms as requested` };
            } else if (flat.rooms > filters.rooms) {
                return { score: this.weights.rooms * 0.8, details: `🛏️ ${flat.rooms} rooms (${flat.rooms - filters.rooms} extra)` };
            } else {
                return { score: this.weights.rooms * 0.6, details: `🛏️ ${flat.rooms} rooms (needs ${filters.rooms - flat.rooms} more)` };
            }
        }
        return { score: this.weights.rooms * 0.5, details: `🛏️ ${flat.rooms} bedrooms` };
    }

    calculateAmenitiesScore(flat, filters) {
        if (filters.amenities && filters.amenities.length > 0) {
            let matched = 0;
            filters.amenities.forEach(amenity => {
                if (flat.nearby.includes(amenity)) matched++;
            });
            const score = (matched / filters.amenities.length) * this.weights.amenities;
            if (matched > 0) {
                return { 
                    score: score, 
                    details: `📍 Nearby: ${flat.nearby.filter(n => filters.amenities.includes(n)).join(', ')}` 
                };
            }
            return { score: 0, details: `📍 No requested amenities nearby` };
        }
        return { score: this.weights.amenities * 0.5, details: `📍 Nearby: ${flat.nearby.slice(0, 3).join(', ')}` };
    }

    calculatePreferencesScore(flat, filters) {
        if (filters.keywords && filters.keywords.length > 0) {
            let score = 0;
            const prefLower = flat.preferredTenants.toLowerCase();
            
            for (const keyword of filters.keywords) {
                if (prefLower.includes(keyword)) {
                    score += this.weights.preferences;
                }
            }
            
            if (score > 0) {
                return { score: Math.min(this.weights.preferences, score), details: `🤝 Owner preferences match your needs` };
            }
        }
        return { score: this.weights.preferences * 0.5, details: `🏠 Owner: ${flat.preferredTenants.substring(0, 40)}...` };
    }

    generateHighlights(flat, filters) {
        const highlights = [];
        
        if (filters.maxRent && flat.rent <= filters.maxRent) {
            highlights.push(`Under ৳${filters.maxRent}`);
        }
        
        if (filters.rooms && flat.rooms === filters.rooms) {
            highlights.push(`${flat.rooms} BR`);
        }
        
        if (filters.locations && filters.locations.some(loc => flat.location.includes(loc))) {
            highlights.push(`In ${flat.location}`);
        }
        
        if (flat.rating >= 4.5) {
            highlights.push(`⭐ ${flat.rating} Stars`);
        }
        
        if (highlights.length === 0) {
            highlights.push(`Great value in ${flat.location}`);
        }
        
        return highlights;
    }

    // Advanced search with multiple filters
    advancedSearch(filters) {
        const parsed = {
            locations: filters.locations || [],
            maxRent: filters.maxRent || null,
            minRent: filters.minRent || null,
            rooms: filters.rooms || null,
            amenities: filters.amenities || [],
            hasLift: filters.hasLift || null,
            hasGarage: filters.hasGarage || null,
            minRating: filters.minRating || null
        };
        
        return this.calculateMatches(parsed);
    }

    // Get similar apartments
    getSimilarApartments(flatId, limit = 5) {
        const flat = this.db.getFlatById(flatId);
        if (!flat) return [];
        
        const filters = {
            locations: [flat.location],
            maxRent: flat.rent + 5000,
            minRent: flat.rent - 5000,
            rooms: flat.rooms,
            amenities: flat.nearby.slice(0, 2)
        };
        
        const results = this.calculateMatches(filters);
        return results.filter(f => f.id !== flatId).slice(0, limit);
    }

    // Get search suggestions
    getSuggestions(partialQuery) {
        const suggestions = [];
        const lower = partialQuery.toLowerCase();
        
        // Location suggestions
        for (const [keyword, location] of Object.entries(this.locationKeywords)) {
            if (keyword.includes(lower) && !suggestions.includes(location)) {
                suggestions.push(`${location} area`);
            }
        }
        
        // Price suggestions
        if (lower.includes('under')) {
            [15000, 20000, 25000, 30000, 40000].forEach(price => {
                suggestions.push(`under ${price} taka`);
            });
        }
        
        // Room suggestions
        if (lower.includes('room') || lower.includes('bed')) {
            [1, 2, 3, 4].forEach(rooms => {
                suggestions.push(`${rooms} bedroom flat`);
            });
        }
        
        return suggestions.slice(0, 5);
    }
}

// Initialize search engine
const searchEngine = new DhakaNestSearchEngine(window.DhakaNestDB);

// Export for use in other files
window.DhakaNestSearch = searchEngine;