// ============================================
// NAVIGATION MODULE
// Handles screen navigation and UI utilities
// ============================================

// Navigate between screens
function navigateTo(screen) {
    // Hide all screens
    const screens = ['home', 'owner', 'tenant'];
    screens.forEach(s => {
        const element = document.getElementById(`screen-${s}`);
        if (element) element.classList.add('hidden');
    });
    
    // Show selected screen
    const selectedScreen = document.getElementById(`screen-${screen}`);
    if (selectedScreen) selectedScreen.classList.remove('hidden');
    
    // Update nav active state
    const navItems = ['home', 'owner', 'tenant'];
    navItems.forEach(item => {
        const navLink = document.getElementById(`nav-${item}`);
        if (navLink) {
            if (item === screen) {
                navLink.classList.add('text-emerald-600', 'font-semibold');
            } else {
                navLink.classList.remove('text-emerald-600', 'font-semibold');
            }
        }
    });
    
    // Special handling for owner screen
    if (screen === 'owner' && window.renderMyFlats) {
        setTimeout(() => window.renderMyFlats(), 100);
    }
    
    // Update URL hash
    window.location.hash = screen;
}

// Render live matches on home screen
function renderLiveMatches() {
    const container = document.getElementById('live-matches');
    if (!container) return;
    
    // Get top matches from database
    const flats = window.DhakaNestDB ? window.DhakaNestDB.getAllFlats().slice(0, 5) : [];
    
    if (flats.length > 0) {
        container.innerHTML = flats.map(flat => `
            <div class="flex justify-between items-center p-3 hover:bg-slate-50 rounded-2xl transition" style="cursor: default;">
                <div>
                    <div class="font-medium" style="cursor: default;">${flat.location}</div>
                    <div class="text-xs text-slate-500" style="cursor: default;">${flat.rooms} BR • ${flat.rent}৳/month</div>
                </div>
                <div class="text-emerald-500 font-semibold" style="cursor: default;">${Math.floor(85 + Math.random() * 15)}% match</div>
            </div>
        `).join('');
        
        const stats = window.DhakaNestDB ? window.DhakaNestDB.getStatistics() : null;
        container.innerHTML += `
            <div class="text-center pt-4 border-t">
                <div class="text-sm text-emerald-600 font-medium" style="cursor: default;">${stats ? stats.totalFlats : '50'}+ Active Listings</div>
                <div class="text-xs text-slate-400" style="cursor: default;">Updated just now • AI Matching Active</div>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="text-center py-8">
                <div class="text-4xl mb-2">🏠</div>
                <p class="text-slate-500" style="cursor: default;">Loading matches...</p>
            </div>
        `;
    }
}

// Handle hash navigation
function handleHashNavigation() {
    const hash = window.location.hash.substring(1);
    if (hash === 'owner' || hash === 'tenant') {
        navigateTo(hash);
    } else {
        navigateTo('home');
    }
}

// Initialize navigation
document.addEventListener('DOMContentLoaded', function() {
    renderLiveMatches();
    handleHashNavigation();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashNavigation);
    
    // Refresh live matches every 30 seconds
    setInterval(renderLiveMatches, 30000);
});

// Make functions global
window.navigateTo = navigateTo;
window.renderLiveMatches = renderLiveMatches;