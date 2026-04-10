// ============================================
// OWNER PAGE JAVASCRIPT
// Handles apartment posting and management
// ============================================

let currentUser = null;
let myPostedFlats = [];
let mapInstance = null;

// Load user's posted flats
function loadMyFlats() {
    const stored = localStorage.getItem('my_posted_flats');
    if (stored) {
        myPostedFlats = JSON.parse(stored);
    }
    renderMyFlats();
}

// Render my flats list
function renderMyFlats() {
    const container = document.getElementById('my-flats-list');
    if (!container) return;
    
    container.innerHTML = '';
    document.getElementById('my-flats-count').textContent = `(${myPostedFlats.length})`;
    
    if (myPostedFlats.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12 text-slate-400">
                <div class="text-6xl mb-4">🏠</div>
                <p>No apartments posted yet</p>
                <p class="text-sm">Fill out the form on the left to list your property</p>
            </div>
        `;
        return;
    }
    
    myPostedFlats.forEach(flat => {
        const card = document.createElement('div');
        card.className = 'bg-white border border-slate-200 rounded-3xl p-5 hover:shadow-md transition';
        card.style.cursor = 'default';
        card.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <h4 class="font-semibold text-lg" style="cursor: default;">${flat.location}</h4>
                    <p class="text-xs text-slate-500 mt-1" style="cursor: default;">Posted ${new Date(flat.createdAt).toLocaleDateString()}</p>
                </div>
                <div class="text-right">
                    <div class="text-2xl font-bold text-emerald-600" style="cursor: default;">${flat.rent}৳</div>
                    <div class="text-xs text-slate-400" style="cursor: default;">/month</div>
                </div>
            </div>
            
            <div class="flex flex-wrap gap-2 mt-4">
                <span class="bg-slate-100 px-3 py-1 rounded-2xl text-xs" style="cursor: default;">${flat.rooms} rooms</span>
                <span class="bg-slate-100 px-3 py-1 rounded-2xl text-xs" style="cursor: default;">${flat.gas} gas</span>
                <span class="bg-slate-100 px-3 py-1 rounded-2xl text-xs" style="cursor: default;">${flat.electricity}</span>
                ${flat.lift ? '<span class="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-2xl text-xs" style="cursor: default;">Lift ✓</span>' : ''}
                ${flat.garage ? '<span class="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-2xl text-xs" style="cursor: default;">Garage ✓</span>' : ''}
            </div>
            
            ${flat.preferredTenants ? `
                <div class="mt-3 p-3 bg-amber-50 rounded-2xl">
                    <p class="text-xs text-amber-700" style="cursor: default;">👥 ${flat.preferredTenants}</p>
                </div>
            ` : ''}
            
            <div class="mt-4 pt-4 border-t flex justify-between items-center">
                <div class="flex items-center gap-1">
                    <span class="text-yellow-500" style="cursor: default;">⭐</span>
                    <span class="text-sm" style="cursor: default;">${flat.rating || 'New'}</span>
                </div>
                <button onclick="deleteFlat(${flat.id})" class="text-red-500 text-sm hover:text-red-700 cursor-pointer" style="cursor: pointer;">Delete</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// Post new apartment
function postApartment(event) {
    event.preventDefault();
    
    // Check login
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
        alert('Please login first! Click the avatar in the top right corner.');
        return;
    }
    
    currentUser = JSON.parse(storedUser);
    
    const newFlat = {
        id: Date.now(),
        ownerName: currentUser.name,
        ownerPhone: currentUser.phone,
        location: document.getElementById('location-input').value || "Dhanmondi",
        address: `${document.getElementById('location-input').value || "Dhanmondi"}, Dhaka`,
        lat: parseFloat(document.getElementById('lat-input').value) || 23.7461,
        lng: parseFloat(document.getElementById('lng-input').value) || 90.3743,
        rent: parseInt(document.getElementById('rent-input').value) || 18000,
        rooms: parseInt(document.getElementById('rooms-input').value) || 2,
        size: Math.floor(600 + Math.random() * 500),
        floor: Math.floor(Math.random() * 10) + 1,
        gas: document.getElementById('gas-input').value,
        electricity: document.getElementById('electricity-input').value,
        lift: document.querySelector('input[name="lift"]:checked').value === 'Yes',
        liftCharge: document.getElementById('lift-charge-input').value ? parseInt(document.getElementById('lift-charge-input').value) : null,
        garage: document.querySelector('input[name="garage"]:checked').value === 'Yes',
        garageCharge: document.getElementById('garage-charge-input').value ? parseInt(document.getElementById('garage-charge-input').value) : null,
        nearby: ["Mosque", "Market", "Bus Stop"],
        rating: 0,
        reviewCount: 0,
        description: "Newly listed apartment",
        preferredTenants: document.getElementById('preferences-input').value || "All welcome",
        images: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Add to database
    if (window.DhakaNestDB) {
        window.DhakaNestDB.addFlat(newFlat);
    }
    
    // Add to user's list
    myPostedFlats.unshift(newFlat);
    localStorage.setItem('my_posted_flats', JSON.stringify(myPostedFlats));
    
    alert('✅ Apartment published successfully! AI will now match it with tenants.');
    
    // Reset form
    event.target.reset();
    document.getElementById('owner-map').classList.add('hidden');
    if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
    }
    
    // Refresh display
    renderMyFlats();
    
    // Show success message
    const successMsg = document.createElement('div');
    successMsg.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-3xl shadow-lg z-50';
    successMsg.innerHTML = '🎉 Apartment posted! AI matching active.';
    document.body.appendChild(successMsg);
    setTimeout(() => successMsg.remove(), 3000);
}

// Delete flat
function deleteFlat(flatId) {
    if (confirm('Are you sure you want to delete this listing?')) {
        myPostedFlats = myPostedFlats.filter(flat => flat.id !== flatId);
        localStorage.setItem('my_posted_flats', JSON.stringify(myPostedFlats));
        if (window.DhakaNestDB) {
            window.DhakaNestDB.deleteFlat(flatId);
        }
        renderMyFlats();
        alert('Apartment deleted successfully.');
    }
}

// Get current location and show map
function getCurrentLocation() {
    if (navigator.geolocation) {
        // Show loading indicator
        const btn = event.target;
        const originalText = btn.innerHTML;
        btn.innerHTML = '📍 Getting location...';
        btn.disabled = true;
        
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            document.getElementById('lat-input').value = lat;
            document.getElementById('lng-input').value = lng;
            
            // Show and render map
            const mapContainer = document.getElementById('owner-map');
            mapContainer.classList.remove('hidden');
            mapContainer.innerHTML = '<div id="leaflet-map-owner" class="leaflet-container" style="height: 300px; border-radius: 16px;"></div>';
            
            // Initialize map
            if (mapInstance) {
                mapInstance.remove();
            }
            
            mapInstance = L.map('leaflet-map-owner').setView([lat, lng], 16);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapInstance);
            
            // Add marker with popup
            const marker = L.marker([lat, lng]).addTo(mapInstance);
            marker.bindPopup(`
                <b>Your Apartment Location</b><br>
                Latitude: ${lat.toFixed(6)}<br>
                Longitude: ${lng.toFixed(6)}<br>
                <i>Click to confirm location</i>
            `).openPopup();
            
            // Add circle to show area
            L.circle([lat, lng], {
                color: '#10b981',
                fillColor: '#10b981',
                fillOpacity: 0.1,
                radius: 100
            }).addTo(mapInstance);
            
            // Update location input
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
                .then(response => response.json())
                .then(data => {
                    const address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                    document.getElementById('location-input').value = address.split(',')[0] || "Dhaka Location";
                })
                .catch(() => {
                    document.getElementById('location-input').value = `Dhaka (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
                });
            
            btn.innerHTML = originalText;
            btn.disabled = false;
            
            // Success message
            const successMsg = document.createElement('div');
            successMsg.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-3xl shadow-lg z-50';
            successMsg.innerHTML = '📍 Location captured! Map updated.';
            document.body.appendChild(successMsg);
            setTimeout(() => successMsg.remove(), 2000);
            
        }, error => {
            btn.innerHTML = originalText;
            btn.disabled = false;
            
            let errorMsg = 'Unable to get location. ';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMsg += 'Please allow location access.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMsg += 'Location information unavailable.';
                    break;
                case error.TIMEOUT:
                    errorMsg += 'Location request timed out.';
                    break;
            }
            alert(errorMsg + ' Using Dhanmondi as default.');
            
            // Set default Dhanmondi location
            const defaultLat = 23.7461;
            const defaultLng = 90.3743;
            document.getElementById('lat-input').value = defaultLat;
            document.getElementById('lng-input').value = defaultLng;
            showMapPreview(defaultLat, defaultLng, "Dhanmondi (Default)");
        });
    } else {
        alert('Geolocation is not supported by your browser. Using Dhanmondi as default.');
        const defaultLat = 23.7461;
        const defaultLng = 90.3743;
        document.getElementById('lat-input').value = defaultLat;
        document.getElementById('lng-input').value = defaultLng;
        showMapPreview(defaultLat, defaultLng, "Dhanmondi (Default)");
    }
}

// Show map preview function
function showMapPreview(lat, lng, locationName) {
    const mapContainer = document.getElementById('owner-map');
    mapContainer.classList.remove('hidden');
    mapContainer.innerHTML = '<div id="leaflet-map-owner" class="leaflet-container" style="height: 300px; border-radius: 16px;"></div>';
    
    if (mapInstance) {
        mapInstance.remove();
    }
    
    mapInstance = L.map('leaflet-map-owner').setView([lat, lng], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
    }).addTo(mapInstance);
    
    L.marker([lat, lng]).addTo(mapInstance)
        .bindPopup(`📍 ${locationName}`).openPopup();
    
    L.circle([lat, lng], {
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.1,
        radius: 100
    }).addTo(mapInstance);
    
    document.getElementById('location-input').value = locationName;
}

// Refresh flats list
function refreshMyFlats() {
    renderMyFlats();
}

// Initialize owner page
document.addEventListener('DOMContentLoaded', function() {
    loadMyFlats();
    
    // Check for logged in user
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
    }
});

// Make functions global
window.renderMyFlats = renderMyFlats;
window.refreshMyFlats = refreshMyFlats;
window.postApartment = postApartment;
window.getCurrentLocation = getCurrentLocation;
window.deleteFlat = deleteFlat;