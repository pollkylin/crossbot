/**
 * CrossBot Widget v1.0 — Vanilla JS Web Component (< 30KB)
 * 使用方法: 在 Shopify 后台 → 在线商店 → 编辑主题代码 → theme.liquid → 贴到 </body> 前
 *
 * <script src="https://your-domain.com/api/widget"></script>
 * <cross-bot server="https://your-domain.com"></cross-bot>
 *
 * API 端口通过 server 属性配置，无需改代码。
 */

(function () {
  // ============================================================
  // 样式 (Shadow DOM 内，不污染店铺)
  // ============================================================
  const STYLES = `
    :host {
      --cb-primary: #6C5CE7;
      --cb-primary-light: #A29BFE;
      --cb-bg: #FFFFFF;
      --cb-text: #2D3436;
      --cb-text-light: #636E72;
      --cb-border: #DFE6E9;
      --cb-bubble-user: #6C5CE7;
      --cb-bubble-bot: #F1F0FF;
      --cb-shadow: 0 8px 32px rgba(0,0,0,0.12);
      --cb-radius: 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .cb-trigger {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--cb-primary);
      border: none;
      cursor: pointer;
      box-shadow: var(--cb-shadow);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
      z-index: 999999;
    }
    .cb-trigger:hover {
      transform: scale(1.08);
      box-shadow: 0 12px 40px rgba(108, 92, 231, 0.35);
    }
    .cb-trigger svg { width: 26px; height: 26px; fill: white; }
    .cb-trigger .cb-dot {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 12px;
      height: 12px;
      background: #00B894;
      border-radius: 50%;
      border: 2px solid white;
    }

    .cb-panel {
      position: fixed;
      bottom: 96px;
      right: 24px;
      width: 380px;
      max-width: calc(100vw - 32px);
      height: 560px;
      max-height: calc(100vh - 120px);
      border-radius: var(--cb-radius);
      background: var(--cb-bg);
      box-shadow: var(--cb-shadow);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      z-index: 999998;
      transform-origin: bottom right;
      transition: opacity 0.25s, transform 0.25s;
    }
    .cb-panel.cb-hidden {
      opacity: 0;
      transform: scale(0.9) translateY(16px);
      pointer-events: none;
    }
    .cb-panel.cb-visible {
      opacity: 1;
      transform: scale(1) translateY(0);
    }

    .cb-header {
      padding: 16px 18px;
      background: linear-gradient(135deg, var(--cb-primary), #5B4CC4);
      color: white;
    }
    .cb-header-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .cb-header-title {
      font-size: 16px;
      font-weight: 700;
      letter-spacing: -0.2px;
    }
    .cb-header-subtitle {
      font-size: 12px;
      opacity: 0.85;
      margin-top: 2px;
    }
    .cb-close-btn {
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;
    }
    .cb-close-btn:hover { background: rgba(255,255,255,0.35); }

    .cb-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      background: #F8F9FA;
      display: flex;
      flex-direction: column;
      gap: 10px;
      scroll-behavior: smooth;
    }

    .cb-msg {
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 14px;
      font-size: 14px;
      line-height: 1.55;
      white-space: pre-line;
      word-break: break-word;
      animation: cbSlideIn 0.3s ease;
    }
    @keyframes cbSlideIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .cb-msg-bot {
      align-self: flex-start;
      background: var(--cb-bubble-bot);
      color: var(--cb-text);
      border-bottom-left-radius: 4px;
    }
    .cb-msg-user {
      align-self: flex-end;
      background: var(--cb-bubble-user);
      color: white;
      border-bottom-right-radius: 4px;
    }

    .cb-typing {
      align-self: flex-start;
      padding: 12px 16px;
      background: var(--cb-bubble-bot);
      border-radius: 14px;
      border-bottom-left-radius: 4px;
      display: none;
    }
    .cb-typing.cb-visible { display: flex; gap: 5px; }
    .cb-typing span {
      width: 7px;
      height: 7px;
      background: var(--cb-primary-light);
      border-radius: 50%;
      animation: cbBounce 1.2s infinite;
    }
    .cb-typing span:nth-child(2) { animation-delay: 0.2s; }
    .cb-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes cbBounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-6px); }
    }

    .cb-input-area {
      padding: 12px 14px;
      border-top: 1px solid var(--cb-border);
      background: white;
      display: flex;
      gap: 8px;
    }
    .cb-input {
      flex: 1;
      border: 1px solid var(--cb-border);
      border-radius: 24px;
      padding: 10px 16px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.15s;
      font-family: inherit;
    }
    .cb-input:focus { border-color: var(--cb-primary); }
    .cb-send-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--cb-primary);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;
      flex-shrink: 0;
    }
    .cb-send-btn:hover { background: #5B4CC4; }
    .cb-send-btn svg { width: 18px; height: 18px; fill: white; }

    @media (max-width: 480px) {
      .cb-panel {
        bottom: 0; right: 0;
        width: 100vw; max-width: 100vw;
        height: 100vh; max-height: 100vh;
        border-radius: 0;
      }
    }
  `;

  // ============================================================
  // 组件
  // ============================================================
  class CrossBot extends HTMLElement {
    constructor() {
      super();
      this.server = '';
      this.sessionId = '';
      this.isOpen = false;
      this.messages = [];
      this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
      this.server = this.getAttribute('server') || 'http://localhost:3456';
      this.brand = this.getAttribute('brand') || 'Obi Pet Hall';
      this.sessionId = 'cb_' + Math.random().toString(36).slice(2, 10);
      this.render();
      this.bindEvents();
    }

    render() {
      this.shadowRoot.innerHTML = `
        <style>${STYLES}</style>

        <button class="cb-trigger" id="cbTrigger">
          <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/><circle cx="9" cy="10" r="1.5"/><circle cx="15" cy="10" r="1.5"/></svg>
          <span class="cb-dot" id="cbDot" style="display:none"></span>
        </button>

        <div class="cb-panel cb-hidden" id="cbPanel">
          <div class="cb-header">
            <div class="cb-header-top">
              <div>
                <div class="cb-header-title">🐾 ${this.brand}</div>
                <div class="cb-header-subtitle">We reply in seconds ✨</div>
              </div>
              <button class="cb-close-btn" id="cbClose">✕</button>
            </div>
          </div>
          <div class="cb-messages" id="cbMessages"></div>
          <div class="cb-typing" id="cbTyping">
            <span></span><span></span><span></span>
          </div>
          <div class="cb-input-area">
            <input class="cb-input" id="cbInput" type="text" placeholder="Type your message..." maxlength="500" />
            <button class="cb-send-btn" id="cbSend">
              <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>
        </div>
      `;
    }

    bindEvents() {
      const trigger = this.shadowRoot.getElementById('cbTrigger');
      const close = this.shadowRoot.getElementById('cbClose');
      const send = this.shadowRoot.getElementById('cbSend');
      const input = this.shadowRoot.getElementById('cbInput');

      trigger.addEventListener('click', () => this.toggle());
      close.addEventListener('click', () => this.toggle());
      send.addEventListener('click', () => this.sendMessage());
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }

    toggle() {
      this.isOpen = !this.isOpen;
      const panel = this.shadowRoot.getElementById('cbPanel');
      const dot = this.shadowRoot.getElementById('cbDot');
      panel.classList.toggle('cb-hidden', !this.isOpen);
      panel.classList.toggle('cb-visible', this.isOpen);

      if (this.isOpen) {
        // 首次打开显示欢迎消息
        if (this.messages.length === 0) {
          this.addMessage('bot', `🐾 **Welcome to Obi Pet Hall!**\n\nI'm your pet care assistant. Ask me about:\n📦 Shipping & tracking\n🔄 Returns & refunds\n📏 Product details & sizing\n💳 Payment questions\n\nHow can I help you today? 😊`);
        }
        this.shadowRoot.getElementById('cbInput').focus();
        dot.style.display = 'none';
      }
    }

    async sendMessage() {
      const input = this.shadowRoot.getElementById('cbInput');
      const text = input.value.trim();
      if (!text) return;

      input.value = '';
      this.addMessage('user', text);
      this.showTyping(true);

      try {
        const res = await fetch(`${this.server}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, sessionId: this.sessionId }),
        });

        const data = await res.json();
        this.showTyping(false);
        this.addMessage('bot', data.reply);
      } catch (err) {
        this.showTyping(false);
        this.addMessage('bot', "I'm having trouble connecting right now. Please try again in a moment, or email support@obipethall.com 💛");
        console.error('CrossBot error:', err);
      }
    }

    addMessage(role, text) {
      this.messages.push({ role, text });
      const msgsEl = this.shadowRoot.getElementById('cbMessages');

      const div = document.createElement('div');
      div.className = `cb-msg cb-msg-${role}`;

      // 简单 Markdown 渲染 (粗体 / 换行)
      div.innerHTML = text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');

      msgsEl.appendChild(div);
      msgsEl.scrollTop = msgsEl.scrollHeight;
    }

    showTyping(show) {
      const typing = this.shadowRoot.getElementById('cbTyping');
      typing.classList.toggle('cb-visible', show);
      const msgsEl = this.shadowRoot.getElementById('cbMessages');
      msgsEl.scrollTop = msgsEl.scrollHeight;
    }
  }

  customElements.define('cross-bot', CrossBot);
})();
