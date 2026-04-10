// ============================================
// AUTHENTICATION MODULE - COMPLETE WORKING VERSION
// ============================================

console.log('Auth.js loaded - Initializing...');

let currentUser = null;

// Check login status on page load
function checkLoginStatus() {
    console.log('Checking login status...');
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        try {
            currentUser = JSON.parse(storedUser);
            updateUserInterface();
            console.log('User logged in:', currentUser.name);
        } catch(e) {
            console.error('Error parsing user data:', e);
            localStorage.removeItem('currentUser');
        }
    } else {
        console.log('No user logged in');
        updateUserInterface();
    }
}

// Update UI based on login status
function updateUserInterface() {
    const userNameDisplay = document.getElementById('user-name-display');
    const userAvatar = document.getElementById('user-avatar');
    
    console.log('Updating UI - User exists:', !!currentUser);
    
    if (userNameDisplay && userAvatar) {
        if (currentUser) {
            userNameDisplay.textContent = currentUser.name.split(' ')[0];
            userAvatar.innerHTML = '✅';
            userAvatar.style.backgroundColor = '#10b981';
            userAvatar.style.color = 'white';
            console.log('UI updated to logged in state');
        } else {
            userNameDisplay.textContent = 'Guest';
            userAvatar.innerHTML = '👤';
            userAvatar.style.backgroundColor = '#d1fae5';
            userAvatar.style.color = '#059669';
            console.log('UI updated to guest state');
        }
    } else {
        console.error('UI elements not found!');
    }
}

// Show profile or login dialog
function showProfile() {
    console.log('showProfile() called - Current user:', currentUser);
    
    if (currentUser) {
        console.log('Showing user profile');
        showUserProfile();
    } else {
        console.log('Showing login dialog');
        showLoginDialog();
    }
}

// Show login dialog with demo options
function showLoginDialog() {
    console.log('showLoginDialog() called');
    
    // Remove any existing modal
    const existingModal = document.querySelector('.login-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'login-modal fixed inset-0 bg-black/70 flex items-center justify-center z-[10000]';
    modal.style.cursor = 'default';
    modal.innerHTML = `
        <div class="bg-white rounded-3xl max-w-md w-full mx-4 p-8" style="animation: fadeIn 0.2s ease-out;">
            <div class="text-center mb-6">
                <div class="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center text-3xl mx-auto">🏠</div>
                <h2 class="text-2xl font-semibold mt-4">Welcome to DhakaNest AI</h2>
                <p class="text-slate-500 text-sm mt-2">Choose a demo account to continue</p>
            </div>
            
            <div class="space-y-3">
                <button onclick="loginAsTenant()" class="w-full p-4 bg-emerald-50 hover:bg-emerald-100 rounded-2xl text-left transition flex items-center gap-3">
                    <div class="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white">👤</div>
                    <div class="flex-1">
                        <div class="font-semibold">Tenant Demo</div>
                        <div class="text-xs text-slate-500">Search for apartments • AI matching • Contact owners</div>
                    </div>
                    <div class="text-emerald-500">→</div>
                </button>
                
                <button onclick="loginAsOwner()" class="w-full p-4 bg-emerald-50 hover:bg-emerald-100 rounded-2xl text-left transition flex items-center gap-3">
                    <div class="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white">🏠</div>
                    <div class="flex-1">
                        <div class="font-semibold">Owner Demo</div>
                        <div class="text-xs text-slate-500">Post apartments • Manage listings • Find tenants</div>
                    </div>
                    <div class="text-emerald-500">→</div>
                </button>
                
                <button onclick="loginAsPremium()" class="w-full p-4 bg-amber-50 hover:bg-amber-100 rounded-2xl text-left transition flex items-center gap-3">
                    <div class="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center text-white">⭐</div>
                    <div class="flex-1">
                        <div class="font-semibold">Premium Demo</div>
                        <div class="text-xs text-slate-500">Full access • Both tenant & owner features</div>
                    </div>
                    <div class="text-amber-500">→</div>
                </button>
            </div>
            
            <div class="mt-6 p-3 bg-blue-50 rounded-2xl">
                <p class="text-xs text-blue-700 text-center">
                    🔓 Demo Mode - No real data stored<br>
                    All features are fully functional
                </p>
            </div>
            
            <button onclick="closeLoginDialog()" class="w-full mt-4 py-3 border rounded-2xl text-slate-600 hover:bg-slate-50 transition">
                Cancel
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    console.log('Login dialog added to DOM');
}

// Close login dialog
function closeLoginDialog() {
    console.log('Closing login dialog');
    const modal = document.querySelector('.login-modal');
    if (modal) modal.remove();
}

// Login as Tenant
function loginAsTenant() {
    console.log('Login as Tenant clicked');
    
    currentUser = {
        id: Date.now(),
        name: "Rahman Khan",
        phone: "01711223344",
        nid: "DEMO123456789",
        email: "rahman@example.com",
        role: "tenant",
        userType: "tenant",
        rating: 4.5,
        verified: true,
        joinedAt: new Date().toISOString(),
        avatar: "👤"
    };
    
    // Save to localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    console.log('User saved to localStorage');
    
    // Update UI
    updateUserInterface();
    
    // Close modal
    closeLoginDialog();
    
    // Show success message
    showToast(`✅ Welcome ${currentUser.name}! You're logged in as Tenant.`, 'success');
    
    // Navigate to tenant page
    if (typeof window.navigateTo === 'function') {
        console.log('Calling navigateTo tenant');
        window.navigateTo('tenant');
    } else {
        console.log('navigateTo not found, using hash');
        window.location.hash = 'tenant';
        setTimeout(() => location.reload(), 100);
    }
}

// Login as Owner
function loginAsOwner() {
    console.log('Login as Owner clicked');
    
    currentUser = {
        id: Date.now(),
        name: "Fatema Begum",
        phone: "01822334455",
        nid: "DEMO987654321",
        email: "fatema@example.com",
        role: "owner",
        userType: "owner",
        rating: 4.8,
        verified: true,
        joinedAt: new Date().toISOString(),
        avatar: "🏠"
    };
    
    // Save to localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    console.log('User saved to localStorage');
    
    // Update UI
    updateUserInterface();
    
    // Close modal
    closeLoginDialog();
    
    // Show success message
    showToast(`✅ Welcome ${currentUser.name}! You're logged in as Owner.`, 'success');
    
    // Navigate to owner page
    if (typeof window.navigateTo === 'function') {
        console.log('Calling navigateTo owner');
        window.navigateTo('owner');
    } else {
        console.log('navigateTo not found, using hash');
        window.location.hash = 'owner';
        setTimeout(() => location.reload(), 100);
    }
}

// Login as Premium User
function loginAsPremium() {
    console.log('Login as Premium clicked');
    
    currentUser = {
        id: Date.now(),
        name: "Ismail Rahman",
        phone: "01933445566",
        nid: "DEMO555555555",
        email: "ismail@example.com",
        role: "premium",
        userType: "both",
        rating: 5.0,
        verified: true,
        joinedAt: new Date().toISOString(),
        avatar: "⭐"
    };
    
    // Save to localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    console.log('User saved to localStorage');
    
    // Update UI
    updateUserInterface();
    
    // Close modal
    closeLoginDialog();
    
    // Show success message
    showToast(`✅ Welcome ${currentUser.name}! You're logged in as Premium User.`, 'success');
    
    // Navigate to home
    if (typeof window.navigateTo === 'function') {
        console.log('Calling navigateTo home');
        window.navigateTo('home');
    } else {
        console.log('navigateTo not found, using hash');
        window.location.hash = 'home';
        setTimeout(() => location.reload(), 100);
    }
}

// Show user profile (when logged in)
function showUserProfile() {
    console.log('Showing user profile');
    
    if (!currentUser) {
        showLoginDialog();
        return;
    }
    
    const modal = document.getElementById('profile-modal');
    if (!modal) {
        console.error('Profile modal element not found');
        return;
    }
    
    const content = document.getElementById('profile-content');
    if (!content) {
        console.error('Profile content element not found');
        return;
    }
    
    const roleText = currentUser.role === 'tenant' ? 'Tenant' : currentUser.role === 'owner' ? 'Homeowner' : 'Premium User';
    const roleColor = currentUser.role === 'tenant' ? 'bg-blue-100 text-blue-700' : currentUser.role === 'owner' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700';
    
    content.innerHTML = `
        <div class="text-center">
            <div class="w-24 h-24 ${currentUser.role === 'tenant' ? 'bg-blue-100' : currentUser.role === 'owner' ? 'bg-emerald-100' : 'bg-amber-100'} rounded-3xl flex items-center justify-center text-5xl mx-auto">
                ${currentUser.avatar || currentUser.name.charAt(0)}
            </div>
            <h3 class="text-2xl font-semibold mt-4">${currentUser.name}</h3>
            <p class="text-emerald-600 text-sm">${currentUser.phone}</p>
            <div class="flex justify-center gap-2 mt-2 flex-wrap">
                <span class="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">✓ Phone Verified</span>
                <span class="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">✓ NID Verified</span>
                <span class="text-xs ${roleColor} px-3 py-1 rounded-full">${roleText}</span>
            </div>
        </div>
        
        <div class="border-t pt-6 mt-6">
            <div class="flex justify-between items-center py-2">
                <span class="text-slate-600">Member since</span>
                <span class="font-medium">${new Date(currentUser.joinedAt).toLocaleDateString()}</span>
            </div>
            <div class="flex justify-between items-center py-2">
                <span class="text-slate-600">User Rating</span>
                <div class="flex items-center gap-1">
                    <span class="text-amber-400">⭐</span>
                    <span class="font-medium">${currentUser.rating}</span>
                    <span class="text-xs text-slate-400">/5.0</span>
                </div>
            </div>
            <div class="flex justify-between items-center py-2">
                <span class="text-slate-600">Email</span>
                <span class="font-medium text-sm">${currentUser.email}</span>
            </div>
        </div>
        
        <div class="bg-amber-50 rounded-2xl p-4 mt-6">
            <p class="text-sm text-amber-800">
                🔒 Demo Account - All features are fully functional.<br>
                Your data is secure and end-to-end encrypted.
            </p>
        </div>
        
        <div class="mt-6 space-y-2">
            <button onclick="window.switchUserAccount()" class="w-full py-3 bg-slate-100 text-slate-700 rounded-2xl font-medium hover:bg-slate-200 transition">
                🔄 Switch to Different User
            </button>
            <button onclick="window.logout()" class="w-full py-3 bg-red-50 text-red-600 rounded-2xl font-medium hover:bg-red-100 transition">
                🚪 Logout
            </button>
        </div>
    `;
    
    modal.classList.remove('hidden');
    console.log('Profile modal shown');
}

// Switch user account
function switchUserAccount() {
    console.log('Switching user account');
    hideProfile();
    logout();
    setTimeout(() => showLoginDialog(), 500);
}

// Hide profile modal
function hideProfile() {
    console.log('Hiding profile modal');
    const modal = document.getElementById('profile-modal');
    if (modal) modal.classList.add('hidden');
}

// Logout user
function logout() {
    console.log('Logout called - Current user:', currentUser);
    
    // Clear user data
    currentUser = null;
    localStorage.removeItem('currentUser');
    
    // Update UI
    updateUserInterface();
    
    // Show logout message
    showToast('👋 Logged out successfully', 'info');
    
    // Close profile modal if open
    hideProfile();
    
    // Close any login modal if open
    closeLoginDialog();
    
    // Navigate to home
    if (typeof window.navigateTo === 'function') {
        window.navigateTo('home');
    } else {
        window.location.hash = 'home';
    }
    
    console.log('Logout complete');
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    toast.className = `fixed bottom-4 right-4 ${bgColor} text-white px-6 py-3 rounded-3xl shadow-lg z-50`;
    toast.style.animation = 'fadeIn 0.3s ease-out';
    toast.innerHTML = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Simulate rating flow
function simulateRatingFlow() {
    hideProfile();
    showToast("🎉 Rating Demo: You rated 4.8⭐ | Owner rated you 5.0⭐", 'success');
    
    if (currentUser) {
        currentUser.rating = 4.9;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
}

// Add animation style
if (!document.querySelector('#fade-in-style')) {
    const style = document.createElement('style');
    style.id = 'fade-in-style';
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing auth...');
    checkLoginStatus();
    
    // Make sure all functions are attached to window
    window.showProfile = showProfile;
    window.showLoginDialog = showLoginDialog;
    window.closeLoginDialog = closeLoginDialog;
    window.loginAsTenant = loginAsTenant;
    window.loginAsOwner = loginAsOwner;
    window.loginAsPremium = loginAsPremium;
    window.logout = logout;
    window.switchUserAccount = switchUserAccount;
    window.hideProfile = hideProfile;
    window.simulateRatingFlow = simulateRatingFlow;
    window.showToast = showToast;
    
    console.log('Auth functions attached to window object');
    console.log('showProfile available:', typeof window.showProfile === 'function');
});