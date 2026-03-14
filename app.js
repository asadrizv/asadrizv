// === RajaAI - Secure LLM Chat Mockup ===

(() => {
  'use strict';

  // --- DOM Elements ---
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const newChatBtn = document.getElementById('new-chat-btn');
  const searchInput = document.getElementById('search-chats');
  const chatList = document.getElementById('chat-list');
  const modelBtn = document.getElementById('model-btn');
  const modelDropdown = document.getElementById('model-dropdown');
  const currentModelSpan = document.getElementById('current-model');
  const welcome = document.getElementById('welcome');
  const messagesEl = document.getElementById('messages');
  const typingIndicator = document.getElementById('typing-indicator');
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-btn');
  const settingsBtn = document.getElementById('settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const themeToggle = document.getElementById('theme-toggle');
  const langToggle = document.getElementById('lang-toggle');

  // --- State ---
  let conversations = [];
  let activeConvId = null;
  let currentModel = 'RajaAI-4';
  let isRTL = false;

  // --- Mock Responses ---
  const mockResponses = {
    'islamic': [
      `The Five Pillars of Islam are the foundational acts of worship:\n\n1. **Shahada** (Declaration of Faith) — Testifying that there is no god but Allah, and Muhammad (PBUH) is His messenger.\n\n2. **Salah** (Prayer) — Performing the five daily prayers facing the Qiblah.\n\n3. **Zakat** (Charity) — Giving 2.5% of one's savings annually to those in need.\n\n4. **Sawm** (Fasting) — Fasting during the holy month of Ramadan from dawn to sunset.\n\n5. **Hajj** (Pilgrimage) — Making the pilgrimage to Makkah at least once in a lifetime, if able.\n\nEach pillar strengthens the believer's connection with Allah and the Muslim community.`,
    ],
    'arabic': [
      `Here's a professional email template in Arabic:\n\n\`\`\`\nبسم الله الرحمن الرحيم\n\nالسيد/السيدة [الاسم] المحترم/ة،\n\nالسلام عليكم ورحمة الله وبركاته،\n\nأتمنى أن تصلكم رسالتي وأنتم بخير وعافية.\n\nأكتب إليكم بخصوص [الموضوع]...\n\nوتفضلوا بقبول فائق الاحترام والتقدير،\n[اسمك]\n[المنصب]\n[معلومات الاتصال]\n\`\`\`\n\nThis follows standard Arabic business correspondence etiquette, starting with Bismillah and the Islamic greeting.`,
    ],
    'finance': [
      `Here are key best practices for **Halal Fintech** applications:\n\n**Core Principles:**\n- No **Riba** (interest) — Use profit-sharing (Mudarabah) or cost-plus (Murabaha) models\n- No **Gharar** (excessive uncertainty) — Ensure transparent terms\n- No **Maysir** (gambling) — Avoid speculative instruments\n\n**Technical Implementation:**\n- Integrate Sharia-compliant screening APIs\n- Implement real-time halal portfolio filtering\n- Build zakat calculation engines\n- Use smart contracts for Islamic finance agreements\n\n**Compliance:**\n- Obtain AAOIFI certification\n- Engage a Sharia advisory board\n- Regular audits by Islamic finance scholars\n- Comply with OIC member state regulations\n\n**Data Security:**\n- All financial data encrypted at rest (AES-256)\n- Data sovereignty within OIC nations\n- GDPR + local data protection compliance`,
    ],
    'code': [
      `Here's a Python script to analyze prayer time data:\n\n\`\`\`python\nimport json\nfrom datetime import datetime, timedelta\nfrom collections import defaultdict\n\nclass PrayerTimeAnalyzer:\n    PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']\n    \n    def __init__(self, data_file):\n        with open(data_file, 'r') as f:\n            self.data = json.load(f)\n    \n    def avg_duration_between_prayers(self):\n        \"\"\"Calculate average gap between consecutive prayers.\"\"\"\n        gaps = defaultdict(list)\n        \n        for day in self.data['days']:\n            times = day['prayers']\n            for i in range(len(self.PRAYERS) - 1):\n                t1 = datetime.strptime(times[self.PRAYERS[i]], '%H:%M')\n                t2 = datetime.strptime(times[self.PRAYERS[i+1]], '%H:%M')\n                gap = (t2 - t1).seconds / 60\n                pair = f\"{self.PRAYERS[i]} → {self.PRAYERS[i+1]}\"\n                gaps[pair].append(gap)\n        \n        return {\n            pair: round(sum(mins)/len(mins), 1)\n            for pair, mins in gaps.items()\n        }\n    \n    def fajr_trend(self, month):\n        \"\"\"Track Fajr time changes across a month.\"\"\"\n        fajr_times = []\n        for day in self.data['days']:\n            if day['date'].startswith(month):\n                fajr_times.append({\n                    'date': day['date'],\n                    'time': day['prayers']['Fajr']\n                })\n        return fajr_times\n\n# Usage\nanalyzer = PrayerTimeAnalyzer('prayer_times.json')\nprint(analyzer.avg_duration_between_prayers())\n\`\`\`\n\nThis analyzer loads prayer time JSON data and provides methods for gap analysis and Fajr time trending. You can extend it with visualization using matplotlib.`,
    ],
    'default': [
      `Jazak Allah Khair for your question! I'm happy to help.\n\nAs RajaAI, I'm designed to serve the Muslim Ummah with:\n\n- **Islamic Knowledge** — Quran, Hadith, Fiqh references\n- **Arabic & Multilingual** — Full support for Arabic, Urdu, Malay, Turkish, and more\n- **Halal Finance** — Sharia-compliant financial guidance\n- **Coding & Tech** — Full programming assistance\n- **Education** — Research, writing, and academic support\n\nAll conversations are **end-to-end encrypted** and your data stays within **sovereign Muslim-nation servers**.\n\nHow can I assist you further?`,
      `That's a great question! Let me break it down for you.\n\nRajaAI processes your request using advanced language models trained with cultural sensitivity and Islamic values in mind. Here are some key points:\n\n1. **Privacy First** — We never store your conversations on third-party servers\n2. **Cultural Context** — Our models understand Islamic terminology and cultural nuances\n3. **Multilingual** — Native support for languages spoken across the Muslim world\n4. **Verified Sources** — Islamic content is cross-referenced with authenticated scholarly sources\n\nIs there anything specific you'd like to explore?`,
      `Bismillah, let me help you with that.\n\nI can assist with a wide range of topics. Here's what I found relevant to your query:\n\n**Key Points:**\n- The topic you've raised is well-documented in Islamic scholarship\n- Modern applications of these principles continue to evolve\n- Several OIC nations have implemented frameworks around this\n\n**Recommendation:**\nI'd suggest exploring this topic further through authenticated Islamic sources. Would you like me to provide more detailed references or dive deeper into any specific aspect?\n\nRemember: All our interactions are secured with AES-256 encryption and your data remains sovereign.`,
    ]
  };

  // --- Seed conversations ---
  function initConversations() {
    conversations = [
      {
        id: 'conv-1',
        title: 'Five Pillars of Islam explained',
        model: 'RajaAI-4',
        messages: [
          { role: 'user', text: 'Explain the five pillars of Islam in detail' },
          { role: 'assistant', text: mockResponses.islamic[0] }
        ],
        group: 'Today'
      },
      {
        id: 'conv-2',
        title: 'Arabic business email template',
        model: 'RajaAI-4',
        messages: [
          { role: 'user', text: 'Help me write a professional email in Arabic' },
          { role: 'assistant', text: mockResponses.arabic[0] }
        ],
        group: 'Today'
      },
      {
        id: 'conv-3',
        title: 'Halal fintech best practices',
        model: 'RajaAI-4-mini',
        messages: [
          { role: 'user', text: 'What are the best practices for halal fintech applications?' },
          { role: 'assistant', text: mockResponses.finance[0] }
        ],
        group: 'Yesterday'
      },
      {
        id: 'conv-4',
        title: 'Prayer time Python analyzer',
        model: 'RajaAI-Code',
        messages: [
          { role: 'user', text: 'Write a Python script to analyze prayer time data' },
          { role: 'assistant', text: mockResponses.code[0] }
        ],
        group: 'Previous 7 Days'
      },
      {
        id: 'conv-5',
        title: 'Zakat calculation guide',
        model: 'RajaAI-Scholar',
        messages: [
          { role: 'user', text: 'How do I calculate Zakat on my savings and gold?' },
          { role: 'assistant', text: 'Zakat is calculated at **2.5%** of your total qualifying wealth that has been held for one lunar year (Hawl).\n\n**Savings:**\nIf your savings exceed the Nisab threshold (equivalent to 85g of gold or 595g of silver), you pay 2.5% of the total.\n\n**Gold:**\n- Nisab for gold: **85 grams**\n- If you own ≥ 85g of gold, calculate 2.5% of its current market value\n- Include all gold jewelry intended for investment (scholars differ on personal-use jewelry)\n\n**Example Calculation:**\n```\nSavings: $50,000\nGold (100g at $60/g): $6,000\nTotal: $56,000\nZakat due: $56,000 × 2.5% = $1,400\n```\n\n**Note:** Consult a qualified Islamic scholar for your specific situation, as different madhabs have varying rulings on certain assets.' }
        ],
        group: 'Previous 7 Days'
      }
    ];
  }

  // --- Render sidebar ---
  function renderChatList(filter = '') {
    chatList.innerHTML = '';
    const groups = {};

    conversations.forEach(conv => {
      if (filter && !conv.title.toLowerCase().includes(filter.toLowerCase())) return;
      if (!groups[conv.group]) groups[conv.group] = [];
      groups[conv.group].push(conv);
    });

    Object.entries(groups).forEach(([group, convs]) => {
      const label = document.createElement('div');
      label.className = 'chat-group-label';
      label.textContent = group;
      chatList.appendChild(label);

      convs.forEach(conv => {
        const item = document.createElement('div');
        item.className = 'chat-item' + (conv.id === activeConvId ? ' active' : '');
        item.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="flex-shrink:0;opacity:0.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span class="chat-title">${escapeHtml(conv.title)}</span>
          <button class="chat-delete" title="Delete">&times;</button>
        `;

        item.addEventListener('click', (e) => {
          if (e.target.closest('.chat-delete')) {
            conversations = conversations.filter(c => c.id !== conv.id);
            if (activeConvId === conv.id) {
              activeConvId = null;
              showWelcome();
            }
            renderChatList();
            return;
          }
          openConversation(conv.id);
        });

        chatList.appendChild(item);
      });
    });
  }

  // --- Open a conversation ---
  function openConversation(id) {
    activeConvId = id;
    const conv = conversations.find(c => c.id === id);
    if (!conv) return;

    currentModel = conv.model;
    currentModelSpan.textContent = conv.model;
    updateModelDropdown();

    welcome.classList.add('hidden');
    messagesEl.classList.add('active');
    messagesEl.innerHTML = '';

    conv.messages.forEach(msg => {
      messagesEl.appendChild(createMessageEl(msg.role, msg.text));
    });

    messagesEl.scrollTop = messagesEl.scrollHeight;
    renderChatList();
    closeSidebarMobile();
  }

  // --- Create message element ---
  function createMessageEl(role, text) {
    const div = document.createElement('div');
    div.className = `message ${role}`;

    const avatarLabel = role === 'user' ? 'U' : 'R';

    div.innerHTML = `
      <div class="message-inner">
        <div class="message-avatar">${avatarLabel}</div>
        <div class="message-content">
          <div class="message-role">${role === 'user' ? 'You' : 'RajaAI'}</div>
          <div class="message-text">${formatMessage(text)}</div>
          ${role === 'assistant' ? `
          <div class="message-actions">
            <button class="msg-action-btn copy-btn" title="Copy">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              Copy
            </button>
            <button class="msg-action-btn" title="Regenerate">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              Regenerate
            </button>
            <button class="msg-action-btn" title="Good response">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
              </svg>
            </button>
            <button class="msg-action-btn" title="Bad response">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
              </svg>
            </button>
          </div>` : ''}
        </div>
      </div>
    `;

    // Copy button handler
    const copyBtn = div.querySelector('.copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(text).then(() => {
          copyBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Copied!`;
          setTimeout(() => {
            copyBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy`;
          }, 2000);
        });
      });
    }

    return div;
  }

  // --- Format message text (basic markdown) ---
  function formatMessage(text) {
    let html = escapeHtml(text);

    // Code blocks
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      return `<pre><code>${code.trim()}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Line breaks into paragraphs
    html = html.split('\n\n').map(p => `<p>${p}</p>`).join('');
    html = html.replace(/\n/g, '<br>');

    return html;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // --- Show welcome ---
  function showWelcome() {
    welcome.classList.remove('hidden');
    messagesEl.classList.remove('active');
    messagesEl.innerHTML = '';
  }

  // --- Send message ---
  async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    // If no active conversation, create one
    if (!activeConvId) {
      const id = 'conv-' + Date.now();
      const title = text.length > 50 ? text.substring(0, 50) + '...' : text;
      conversations.unshift({
        id,
        title,
        model: currentModel,
        messages: [],
        group: 'Today'
      });
      activeConvId = id;
      welcome.classList.add('hidden');
      messagesEl.classList.add('active');
      messagesEl.innerHTML = '';
      renderChatList();
    }

    const conv = conversations.find(c => c.id === activeConvId);

    // Add user message
    conv.messages.push({ role: 'user', text });
    messagesEl.appendChild(createMessageEl('user', text));

    chatInput.value = '';
    chatInput.style.height = 'auto';
    sendBtn.disabled = true;

    // Scroll to bottom
    messagesEl.scrollTop = messagesEl.scrollHeight;

    // Show typing indicator
    typingIndicator.classList.remove('hidden');
    messagesEl.scrollTop = messagesEl.scrollHeight;

    // Simulate response delay
    const delay = 1000 + Math.random() * 2000;
    await new Promise(r => setTimeout(r, delay));

    // Pick a mock response
    const response = pickResponse(text);

    typingIndicator.classList.add('hidden');

    conv.messages.push({ role: 'assistant', text: response });
    messagesEl.appendChild(createMessageEl('assistant', response));
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function pickResponse(text) {
    const lower = text.toLowerCase();
    if (lower.includes('pillar') || lower.includes('islam') || lower.includes('quran') || lower.includes('hadith') || lower.includes('prayer') || lower.includes('ramadan')) {
      return mockResponses.islamic[0];
    }
    if (lower.includes('arabic') || lower.includes('email') || lower.includes('letter') || lower.includes('عربي')) {
      return mockResponses.arabic[0];
    }
    if (lower.includes('halal') || lower.includes('finance') || lower.includes('zakat') || lower.includes('bank') || lower.includes('fintech')) {
      return mockResponses.finance[0];
    }
    if (lower.includes('code') || lower.includes('python') || lower.includes('script') || lower.includes('program') || lower.includes('function')) {
      return mockResponses.code[0];
    }
    return mockResponses.default[Math.floor(Math.random() * mockResponses.default.length)];
  }

  // --- Model selector ---
  function updateModelDropdown() {
    document.querySelectorAll('.model-option').forEach(opt => {
      opt.classList.toggle('selected', opt.dataset.model === currentModel);
    });
  }

  modelBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    modelDropdown.classList.toggle('hidden');
  });

  document.querySelectorAll('.model-option').forEach(opt => {
    opt.addEventListener('click', () => {
      currentModel = opt.dataset.model;
      currentModelSpan.textContent = currentModel;
      modelDropdown.classList.add('hidden');
      updateModelDropdown();
    });
  });

  document.addEventListener('click', () => {
    modelDropdown.classList.add('hidden');
  });

  // --- Quick actions ---
  document.querySelectorAll('.quick-action').forEach(btn => {
    btn.addEventListener('click', () => {
      chatInput.value = btn.dataset.prompt;
      sendBtn.disabled = false;
      sendMessage();
    });
  });

  // --- Input handling ---
  chatInput.addEventListener('input', () => {
    sendBtn.disabled = !chatInput.value.trim();
    // Auto-resize
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 200) + 'px';
  });

  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (chatInput.value.trim()) sendMessage();
    }
  });

  sendBtn.addEventListener('click', sendMessage);

  // --- New chat ---
  newChatBtn.addEventListener('click', () => {
    activeConvId = null;
    showWelcome();
    renderChatList();
    closeSidebarMobile();
  });

  // --- Search ---
  searchInput.addEventListener('input', () => {
    renderChatList(searchInput.value);
  });

  // --- Theme toggle ---
  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  });

  // --- RTL/Language toggle ---
  langToggle.addEventListener('click', () => {
    isRTL = !isRTL;
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    langToggle.querySelector('span').textContent = isRTL ? 'EN' : 'AR';
  });

  // --- Settings modal ---
  settingsBtn.addEventListener('click', () => {
    settingsModal.classList.remove('hidden');
  });

  settingsModal.querySelector('.modal-overlay').addEventListener('click', () => {
    settingsModal.classList.add('hidden');
  });

  settingsModal.querySelector('.modal-close').addEventListener('click', () => {
    settingsModal.classList.add('hidden');
  });

  // --- Mobile sidebar ---
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  function closeSidebarMobile() {
    if (window.innerWidth <= 768) {
      sidebar.classList.remove('open');
    }
  }

  // --- Attach button (mock) ---
  document.getElementById('attach-btn').addEventListener('click', () => {
    alert('File attachment is available in RajaAI Pro.\n\nSupported: PDF, DOCX, images, code files.\nAll uploads are encrypted and scanned.');
  });

  // --- Init ---
  initConversations();
  renderChatList();
  showWelcome();

})();
