// ============================================
// TENANT PAGE JAVASCRIPT
// Handles UI interactions for tenant search
// ============================================

let currentMatchResults = [];
let viewMode = 'cards';
let currentContactFlat = null;

// Send chat message to AI
function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;
    
    // Add user message to chat
    const chatContainer = document.getElementById('chat-messages');
    const userMsgHTML = `
        <div class="flex justify-end">
            <div class="chat-bubble bg-emerald-500 text-white px-6 py-4 rounded-3xl rounded-tr-none max-w-[75%]">
                ${message}
            </div>
        </div>
    `;
    chatContainer.innerHTML += userMsgHTML;
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    input.value = '';
    
    // Show AI thinking
    setTimeout(() => {
        const thinking = document.createElement('div');
        thinking.innerHTML = `
            <div class="flex gap-4">
                <div class="w-8 h-8 bg-emerald-500 text-white rounded-2xl flex-shrink-0 flex items-center justify-center text-xl">🤖</div>
                <div class="chat-bubble bg-white px-6 py-4 rounded-3xl rounded-tl-none text-slate-700">
                    Analyzing your request with AI matching engine...
                </div>
            </div>
        `;
        chatContainer.appendChild(thinking.firstElementChild);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        // Run search
        setTimeout(() => {
            thinking.remove();
            const searchResults = window.DhakaNestSearch.search(message);
            currentMatchResults = searchResults.results;
            
            // Show results
            document.getElementById('results-section').classList.remove('hidden');
            document.getElementById('results-title').innerHTML = `Best AI Matches <span class="text-emerald-500 font-normal text-base">(${searchResults.total} found)</span>`;
            
            renderResults(currentMatchResults);
            
            // Add AI response to chat
            const aiResponse = `
                <div class="flex gap-4">
                    <div class="w-8 h-8 bg-emerald-500 text-white rounded-2xl flex-shrink-0 flex items-center justify-center text-xl">🤖</div>
                    <div class="chat-bubble bg-white px-6 py-4 rounded-3xl rounded-tl-none text-slate-700">
                        I found ${searchResults.total} apartments matching your criteria!<br>
                        ${searchResults.results[0] ? `Top match: ${searchResults.results[0].location} - ${searchResults.results[0].rent}৳/month (${searchResults.results[0].matchScore}% match)` : 'Try adjusting your search criteria.'}
                    </div>
                </div>
            `;
            chatContainer.innerHTML += aiResponse;
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }, 1200);
    }, 500);
}

// Render search results
function renderResults(results) {
    // Cards view
    const cardsContainer = document.getElementById('results-cards');
    cardsContainer.innerHTML = '';
    
    results.slice(0, 12).forEach(flat => {
        const cardHTML = `
            <div onclick="openContactModal(${flat.id})" class="card-hover bg-white border border-slate-100 rounded-3xl p-6 cursor-pointer">
                <div class="flex justify-between items-start">
                    <div>
                        <div class="font-semibold text-lg">${flat.location}</div>
                        <div class="text-xs text-slate-500 mt-1">${flat.address || flat.location}</div>
                    </div>
                    <div class="text-right">
                        <div class="text-2xl font-semibold text-emerald-500">${flat.rent}<span class="text-xs font-normal">৳</span></div>
                        <div class="text-xs text-slate-400">/month</div>
                    </div>
                </div>
                
                <div class="flex flex-wrap gap-2 mt-4">
                    <div class="bg-slate-100 px-3 py-1 rounded-3xl text-xs">${flat.rooms} rooms</div>
                    <div class="bg-slate-100 px-3 py-1 rounded-3xl text-xs">${flat.size} sqft</div>
                    <div class="bg-slate-100 px-3 py-1 rounded-3xl text-xs">Floor ${flat.floor}</div>
                    ${flat.lift ? '<div class="bg-emerald-100 px-3 py-1 rounded-3xl text-xs text-emerald-700">Lift ✓</div>' : ''}
                </div>
                
                <div class="flex flex-wrap gap-1 mt-3">
                    ${flat.nearby.slice(0, 3).map(n => `<span class="text-xs text-slate-500">📍 ${n}</span>`).join('')}
                </div>
                
                <div class="mt-4 flex items-center justify-between">
                    <div class="flex items-center gap-1">
                        <span class="text-amber-400">⭐</span>
                        <span class="text-sm font-medium">${flat.rating}</span>
                        <span class="text-xs text-slate-400">(${flat.reviewCount} reviews)</span>
                    </div>
                    <div class="text-right">
                        <div class="text-3xl font-bold text-emerald-500">${flat.matchScore}<span class="text-base">%</span></div>
                        <div class="text-xs text-slate-400">match</div>
                    </div>
                </div>
                
                <div class="mt-3 pt-3 border-t">
                    <div class="flex flex-wrap gap-1">
                        ${flat.matchHighlights.map(h => `<span class="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full">${h}</span>`).join('')}
                    </div>
                </div>
                
                <button class="mt-4 w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-sm font-medium transition">
                    Contact Owner →
                </button>
            </div>
        `;
        cardsContainer.innerHTML += cardHTML;
    });
    
    // Table view
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';
    results.slice(0, 20).forEach(flat => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-slate-50 cursor-pointer';
        row.onclick = () => openContactModal(flat.id);
        row.innerHTML = `
            <td class="px-8 py-5">
                <div class="font-medium">${flat.location}</div>
                <div class="text-xs text-slate-500">${flat.rooms} BR • ${flat.size} sqft</div>
            </td>
            <td class="px-8 py-5 font-semibold text-emerald-600">${flat.rent}৳</td>
            <td class="px-8 py-5">${flat.rooms}</td>
            <td class="px-8 py-5">
                <div class="inline-flex items-center justify-center bg-emerald-100 text-emerald-700 font-bold w-12 h-12 rounded-2xl">${flat.matchScore}%</div>
            </td>
            <td class="px-8 py-5 text-sm">${flat.nearby.slice(0, 2).join(', ')}</td>
            <td class="px-8 py-5 text-emerald-600">Message →</td>
        `;
        tbody.appendChild(row);
    });
}

// Toggle between card and table view
function toggleViewMode() {
    viewMode = viewMode === 'cards' ? 'table' : 'cards';
    const btn = document.getElementById('view-mode-btn');
    const cardsView = document.getElementById('results-cards');
    const tableView = document.getElementById('results-table');
    
    if (viewMode === 'cards') {
        btn.innerHTML = 'Cards view';
        cardsView.classList.remove('hidden');
        tableView.classList.add('hidden');
    } else {
        btn.innerHTML = 'Table view';
        cardsView.classList.add('hidden');
        tableView.classList.remove('hidden');
    }
}

// Clear search results
function clearResults() {
    document.getElementById('results-section').classList.add('hidden');
    document.getElementById('chat-messages').innerHTML = `
        <div class="flex gap-4">
            <div class="w-8 h-8 bg-emerald-500 text-white rounded-2xl flex-shrink-0 flex items-center justify-center text-xl">🤖</div>
            <div class="chat-bubble bg-white px-6 py-4 rounded-3xl rounded-tl-none text-slate-700">
                Search cleared! Try another query like "3 bedroom under 30000 taka near metro in Gulshan"
            </div>
        </div>
    `;
    currentMatchResults = [];
}

// Show example prompts
function showExamplePrompts() {
    const examples = [
        "2 bedroom under 20000 taka near mosque in Dhanmondi",
        "3 bedroom flat with lift and garage in Gulshan max 35000",
        "Single room for bachelor near bus stop in Mirpur under 12000",
        "Family apartment near market and metro in Uttara with high rating",
        "Studio apartment in Banani with prepaid electricity under 25000"
    ];
    const random = examples[Math.floor(Math.random() * examples.length)];
    document.getElementById('chat-input').value = random;
    sendChatMessage();
}

// Open contact modal
function openContactModal(flatId) {
    const flat = currentMatchResults.find(f => f.id === flatId);
    if (!flat) return;
    
    currentContactFlat = flat;
    
    document.getElementById('modal-owner-name').innerHTML = `${flat.ownerName} <span class="text-xs text-slate-400 ml-2">Owner</span>`;
    document.getElementById('modal-owner-phone').innerHTML = `📞 ${flat.ownerPhone} <span class="text-xs ml-2 bg-emerald-100 px-2 py-px rounded">OTP verified</span>`;
    
    const chatArea = document.getElementById('contact-chat-messages');
    chatArea.innerHTML = `
        <div class="flex gap-3">
            <div class="text-xs px-4 py-2 bg-slate-100 rounded-3xl rounded-bl-none">
                Hi, I'm interested in the ${flat.rooms}BR apartment in ${flat.location} for ${flat.rent}৳/month. Is it still available?
            </div>
        </div>
        <div class="flex justify-end">
            <div class="text-xs px-4 py-2 bg-emerald-100 text-emerald-700 rounded-3xl rounded-br-none">
                Yes! It's still available. When would you like to schedule a visit?
            </div>
        </div>
        <div class="text-center text-xs text-slate-400 pt-4">
            🔒 End-to-end encrypted • Owner verified by NID & Phone
        </div>
    `;
    
    document.getElementById('contact-modal').classList.remove('hidden');
}

// Send contact message
function sendContactMessage() {
    const input = document.getElementById('contact-input');
    const message = input.value.trim();
    if (!message || !currentContactFlat) return;
    
    const chatArea = document.getElementById('contact-chat-messages');
    chatArea.innerHTML += `
        <div class="flex justify-end">
            <div class="text-xs px-4 py-2 bg-emerald-100 text-emerald-700 rounded-3xl rounded-br-none">
                ${message}
            </div>
        </div>
    `;
    chatArea.scrollTop = chatArea.scrollHeight;
    input.value = '';
    
    // Simulate owner response after delay
    setTimeout(() => {
        chatArea.innerHTML += `
            <div class="flex gap-3">
                <div class="text-xs px-4 py-2 bg-slate-100 rounded-3xl rounded-bl-none">
                    Thanks for your interest! You can reach me at ${currentContactFlat.ownerPhone} for viewing. Available tomorrow 10 AM - 6 PM.
                </div>
            </div>
        `;
        chatArea.scrollTop = chatArea.scrollHeight;
    }, 1500);
}

// Hide contact modal
function hideContactModal() {
    document.getElementById('contact-modal').classList.add('hidden');
    currentContactFlat = null;
}