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
        card.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <h4 class="font-semibold text-lg">${flat.location}</h4>
                    <p class="text-xs text-slate-500 mt-1">Posted ${new Date(flat.createdAt).toLocaleDateString()}</p>
                </div>
                <div class="text-right">
                    <div class="text-2xl font-bold text-emerald-600">${flat.rent}৳</div>
                    <div class="text-xs text-slate-400">/month</div>
                </div>
            </div>
            
            <div class="flex flex-wrap gap-2 mt-4">
                <span class="bg-slate-100 px-3 py-1 rounded-2xl text-xs">${flat.rooms} rooms</span>
                <span class="bg-slate-100 px-3 py-1 rounded-2xl text-xs">${flat.gas} gas</span>
                <span class="bg-slate-100 px-3 py-1 rounded-2xl text-xs">${flat.electricity}</span>
                ${flat.lift ? '<span class="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-2xl text-xs">Lift ✓</span>' : ''}
                ${flat.garage ? '<span class="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-2xl text-xs">Garage ✓</span>' : ''}
            </div>
            
            ${flat.preferredTenants ? `
                <div class="mt-3 p-3 bg-amber-50 rounded-2xl">
                    <p class="text-xs text-amber-700">👥 ${flat.preferredTenants}</p>
                </div>
            ` : ''}
            
            <div class="mt-4 pt-4 border-t flex justify-between items-center">
                <div class="flex items-center gap-1">
                    <span class="text-yellow-500">⭐</span>
                    <span class="text-sm">${flat.rating || 'New'}</span>
                </div>
                <button onclick="deleteFlat(${flat.id})" class="text-red-500 text-sm hover:text-red-700">Delete</button>
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
    window.DhakaNestDB.addFlat(newFlat);
    
    // Add to user's list
    myPostedFlats.unshift(newFlat);
    localStorage.setItem('my_posted_flats', JSON.stringify(myPostedFlats));
    
    alert('✅ Apartment published successfully! AI will now match it with tenants.');
    
    // Reset form
    event.target.reset();
    document.getElementById('owner-map').classList.add('hidden');
    
    // Refresh display
    renderMyFlats();
    
    // Show success message
    const successMsg = document.createElement('div');
    successMsg.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-3xl shadow-lg z-50 animate-bounce';
    successMsg.innerHTML = '🎉 Apartment posted! AI matching active.';
    document.body.appendChild(successMsg);
    setTimeout(() => successMsg.remove(), 3000);
}

// Delete flat
function deleteFlat(flatId) {
    if (confirm('Are you sure you want to delete this listing?')) {
        myPostedFlats = myPostedFlats.filter(flat => flat.id !== flatId);
        localStorage.setItem('my_posted_flats', JSON.stringify(myPostedFlats));
        window.DhakaNestDB.deleteFlat(flatId);
        renderMyFlats();
        alert('Apartment deleted successfully.');
    }
}

// Get current location for map
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            document.getElementById('lat-input').value = lat;
            document.getElementById('lng-input').value = lng;
            
            const mapContainer = document.getElementById('owner-map');
            mapContainer.classList.remove('hidden');
            mapContainer.innerHTML = '<div id="leaflet-map-owner" class="leaflet-container"></div>';
            
            if (mapInstance) mapInstance.remove();
            mapInstance = L.map('leaflet-map-owner').setView([lat, lng], 16);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap'
            }).addTo(mapInstance);
            
            L.marker([lat, lng]).addTo(mapInstance)
                .bindPopup('Your apartment location').openPopup();
            
            document.getElementById('location-input').value = "Current location";
        }, () => {
            alert('Unable to get location. Using Dhanmondi as default.');
        });
    } else {
        alert('Geolocation not supported');
    }
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