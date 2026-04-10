// ============================================
// AUTHENTICATION MODULE
// Handles user login, registration, and profile
// ============================================

let currentUser = null;

// Login/Signup flow
function loginDemo() {
    const name = prompt("Enter your full name", "Ismail Rahman");
    if (!name) return;
    
    const phone = prompt("Enter phone number (e.g., 01711223344)", "01711223344");
    if (!phone) return;
    
    // Simulate OTP
    const otp = prompt(`📱 OTP sent to ${phone}\nEnter verification code`, "1234");
    if (otp !== "1234" && otp) {
        alert("Invalid OTP. Using demo mode.");
    }
    
    // Simulate NID verification
    const nid = prompt("Enter NID number (10-17 digits)", "12345678901234567");
    if (!nid) return;
    
    currentUser = {
        id: Date.now(),
        name: name,
        phone: phone,
        nid: nid,
        verified: true,
        rating: 0,
        joinedAt: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update UI
    document.getElementById('user-name-display').textContent = name.split(' ')[0];
    document.getElementById('user-avatar').innerHTML = '✅';
    
    alert("✅ Account verified!\nPhone OTP + NID verification complete.\nWelcome to DhakaNest AI!");
    
    // Redirect to tenant page
    navigateTo('tenant');
}

// Show user profile
function showProfile() {
    if (!currentUser) {
        loginDemo();
        return;
    }
    
    const modal = document.getElementById('profile-modal');
    const content = document.getElementById('profile-content');
    
    content.innerHTML = `
        <div class="text-center">
            <div class="w-24 h-24 bg-emerald-100 rounded-3xl flex items-center justify-center text-5xl mx-auto">
                ${currentUser.name.charAt(0)}
            </div>
            <h3 class="text-2xl font-semibold mt-4">${currentUser.name}</h3>
            <p class="text-emerald-600 text-sm">${currentUser.phone}</p>
            <div class="flex justify-center gap-2 mt-2">
                <span class="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">✓ Phone Verified</span>
                <span class="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">✓ NID Verified</span>
            </div>
        </div>
        
        <div class="border-t pt-6 mt-6">
            <div class="flex justify-between items-center">
                <span class="text-slate-600">Member since</span>
                <span class="font-medium">${new Date(currentUser.joinedAt).toLocaleDateString()}</span>
            </div>
            <div class="flex justify-between items-center mt-3">
                <span class="text-slate-600">User Rating</span>
                <div class="flex items-center gap-1">
                    <span class="text-amber-400">⭐</span>
                    <span class="font-medium">${currentUser.rating || 'New'}</span>
                </div>
            </div>
        </div>
        
        <div class="bg-amber-50 rounded-2xl p-4 mt-6">
            <p class="text-sm text-amber-800">
                🔒 Your data is secure and end-to-end encrypted.<br>
                All communications are monitored for safety.
            </p>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

// Hide profile modal
function hideProfile() {
    document.getElementById('profile-modal').classList.add('hidden');
}

// Logout user
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById('user-name-display').textContent = 'Guest';
    document.getElementById('user-avatar').innerHTML = '👤';
    alert("Logged out successfully");
    navigateTo('home');
}

// Simulate rating flow
function simulateRatingFlow() {
    hideProfile();
    alert("🎉 Rating Demo\n\nYou rated your landlord 4.8⭐\nThey rated you 5.0⭐\n\nBoth profiles updated with new ratings!");
    
    if (currentUser) {
        currentUser.rating = 4.9;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
}

// Load user on page load
document.addEventListener('DOMContentLoaded', function() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        document.getElementById('user-name-display').textContent = currentUser.name.split(' ')[0];
        document.getElementById('user-avatar').innerHTML = '✅';
    }
});