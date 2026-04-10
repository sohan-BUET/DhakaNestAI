// ============================================
// DHAKANEST AI DATABASE MODULE
// Handles all data storage, retrieval, and persistence
// ============================================

class DhakaNestDatabase {
    constructor() {
        this.flats = [];
        this.users = [];
        this.matches = [];
        this.searchHistory = [];
        this.initializeDatabase();
    }

    // Initialize database with sample data (50+ apartments)
    initializeDatabase() {
        // Check if data already exists in localStorage
        const storedFlats = localStorage.getItem('dhakanest_flats');
        if (storedFlats) {
            this.flats = JSON.parse(storedFlats);
        } else {
            this.generateSampleData();
        }

        const storedUsers = localStorage.getItem('dhakanest_users');
        if (storedUsers) {
            this.users = JSON.parse(storedUsers);
        } else {
            this.generateSampleUsers();
        }
    }

    // Generate 50+ sample apartments across Dhaka
    generateSampleData() {
        const areas = [
            { name: "Dhanmondi", lat: 23.7461, lng: 90.3743, avgRent: 25000 },
            { name: "Gulshan", lat: 23.7925, lng: 90.4153, avgRent: 35000 },
            { name: "Banani", lat: 23.7937, lng: 90.4043, avgRent: 32000 },
            { name: "Uttara", lat: 23.8765, lng: 90.3677, avgRent: 18000 },
            { name: "Mirpur", lat: 23.8223, lng: 90.3663, avgRent: 15000 },
            { name: "Mohammadpur", lat: 23.7678, lng: 90.3654, avgRent: 14000 },
            { name: "Tejgaon", lat: 23.7612, lng: 90.3945, avgRent: 16000 },
            { name: "Khilgaon", lat: 23.7428, lng: 90.4248, avgRent: 13000 },
            { name: "Bashundhara", lat: 23.8167, lng: 90.4333, avgRent: 22000 },
            { name: "Baridhara", lat: 23.8096, lng: 90.4217, avgRent: 40000 }
        ];

        const amenities = ["Mosque", "Market", "Bus Stop", "Metro Station", "Hospital", "Park", "School", "Bank"];
        const ownerNames = [
            "Rahman Khan", "Fatema Begum", "Karim Miah", "Nusrat Jahan", "Sabbir Ahmed",
            "Ayesha Siddiqua", "Tariqul Islam", "Mahmudul Haque", "Rina Parveen", "Shakil Ahmed",
            "Nadia Khan", "Jahangir Alam", "Morsheda Akter", "Kamal Hossain", "Sharmin Sultana"
        ];

        this.flats = [];

        for (let i = 1; i <= 50; i++) {
            const area = areas[Math.floor(Math.random() * areas.length)];
            const rentVariation = 0.7 + Math.random() * 0.8;
            const rent = Math.floor(area.avgRent * rentVariation / 500) * 500;
            const rooms = Math.floor(Math.random() * 4) + 1;
            
            // Randomly select 2-4 nearby amenities
            const nearbyCount = Math.floor(Math.random() * 3) + 2;
            const shuffled = [...amenities];
            for (let j = shuffled.length - 1; j > 0; j--) {
                const k = Math.floor(Math.random() * (j + 1));
                [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
            }
            const nearby = shuffled.slice(0, nearbyCount);

            this.flats.push({
                id: i,
                ownerName: ownerNames[Math.floor(Math.random() * ownerNames.length)],
                ownerPhone: `01${Math.floor(10000000 + Math.random() * 90000000)}`,
                location: area.name,
                address: `${Math.floor(Math.random() * 100) + 1}, Road ${Math.floor(Math.random() * 20) + 1}, ${area.name}, Dhaka`,
                lat: area.lat + (Math.random() - 0.5) * 0.01,
                lng: area.lng + (Math.random() - 0.5) * 0.01,
                rent: rent,
                rooms: rooms,
                size: Math.floor(600 + Math.random() * 1000), // sq ft
                floor: Math.floor(Math.random() * 10) + 1,
                gas: Math.random() > 0.3 ? "Line" : "Cylinder",
                electricity: Math.random() > 0.4 ? "Prepaid" : "Postpaid",
                lift: Math.random() > 0.3,
                liftCharge: Math.random() > 0.5 ? Math.floor(500 + Math.random() * 1500) : null,
                garage: Math.random() > 0.6,
                garageCharge: Math.random() > 0.5 ? Math.floor(1000 + Math.random() * 3000) : null,
                nearby: nearby,
                rating: (3.5 + Math.random() * 1.5).toFixed(1),
                reviewCount: Math.floor(Math.random() * 50),
                description: this.generateDescription(rooms, area.name),
                preferredTenants: this.generatePreferences(),
                images: [`/api/placeholder/400/300`],
                availableFrom: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }

        // Sort by ID and save
        this.flats.sort((a, b) => a.id - b.id);
        this.saveToLocalStorage();
    }

    generateDescription(rooms, area) {
        const adjectives = ["beautiful", "spacious", "modern", "cozy", "elegant", "well-maintained"];
        const features = ["fully furnished", "semi-furnished", "unfurnished", "newly renovated", "family-friendly"];
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const feature = features[Math.floor(Math.random() * features.length)];
        return `${adj} ${rooms}-bedroom apartment in ${area}. ${feature}. Perfect for ${rooms > 2 ? 'family' : 'small family or professionals'}.`;
    }

    generatePreferences() {
        const preferences = [
            "Family preferred, no bachelors",
            "Professionals only",
            "Family and professionals welcome",
            "Bachelors allowed with references",
            "Family preferred, bachelors with conditions",
            "No shared rooms, family preferred"
        ];
        return preferences[Math.floor(Math.random() * preferences.length)];
    }

    generateSampleUsers() {
        this.users = [
            { id: 1, name: "Ismail Rahman", phone: "01711223344", nid: "1234567890", verified: true, rating: 4.8 },
            { id: 2, name: "Fatema Khatun", phone: "01822334455", nid: "2345678901", verified: true, rating: 4.9 },
            { id: 3, name: "Rafiqul Islam", phone: "01933445566", nid: "3456789012", verified: true, rating: 4.7 }
        ];
        localStorage.setItem('dhakanest_users', JSON.stringify(this.users));
    }

    // CRUD Operations
    getAllFlats() {
        return this.flats;
    }

    getFlatById(id) {
        return this.flats.find(flat => flat.id === parseInt(id));
    }

    addFlat(flat) {
        flat.id = this.flats.length + 1;
        flat.createdAt = new Date().toISOString();
        flat.updatedAt = new Date().toISOString();
        this.flats.unshift(flat);
        this.saveToLocalStorage();
        return flat;
    }

    updateFlat(id, updatedData) {
        const index = this.flats.findIndex(flat => flat.id === parseInt(id));
        if (index !== -1) {
            this.flats[index] = { ...this.flats[index], ...updatedData, updatedAt: new Date().toISOString() };
            this.saveToLocalStorage();
            return this.flats[index];
        }
        return null;
    }

    deleteFlat(id) {
        const index = this.flats.findIndex(flat => flat.id === parseInt(id));
        if (index !== -1) {
            this.flats.splice(index, 1);
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }

    // Search history
    saveSearch(query, results) {
        this.searchHistory.unshift({
            id: Date.now(),
            query: query,
            resultsCount: results.length,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 50 searches
        if (this.searchHistory.length > 50) {
            this.searchHistory = this.searchHistory.slice(0, 50);
        }
        
        localStorage.setItem('dhakanest_search_history', JSON.stringify(this.searchHistory));
    }

    getSearchHistory() {
        return this.searchHistory;
    }

    // User operations
    registerUser(userData) {
        const newUser = {
            id: this.users.length + 1,
            ...userData,
            verified: true,
            rating: 0,
            createdAt: new Date().toISOString()
        };
        this.users.push(newUser);
        localStorage.setItem('dhakanest_users', JSON.stringify(this.users));
        return newUser;
    }

    getUserById(id) {
        return this.users.find(user => user.id === parseInt(id));
    }

    // Save all data to localStorage
    saveToLocalStorage() {
        localStorage.setItem('dhakanest_flats', JSON.stringify(this.flats));
    }

    // Get statistics
    getStatistics() {
        const totalFlats = this.flats.length;
        const avgRent = this.flats.reduce((sum, flat) => sum + flat.rent, 0) / totalFlats;
        const avgRating = this.flats.reduce((sum, flat) => sum + parseFloat(flat.rating), 0) / totalFlats;
        
        const areaDistribution = {};
        this.flats.forEach(flat => {
            areaDistribution[flat.location] = (areaDistribution[flat.location] || 0) + 1;
        });

        return {
            totalFlats,
            avgRent: Math.round(avgRent),
            avgRating: avgRating.toFixed(1),
            areaDistribution,
            totalUsers: this.users.length
        };
    }
}

// Initialize global database instance
const db = new DhakaNestDatabase();

// Export for use in other files
window.DhakaNestDB = db;