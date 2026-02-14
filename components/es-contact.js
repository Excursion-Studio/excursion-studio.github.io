class ESContact extends HTMLElement {
  constructor() {
    super();
    this.data = null;
  }

  setData(data) {
    this.data = data;
    this.render();
  }

  render() {
    if (!this.data) return;

    const { title, description, social, wechat } = this.data;

    const socialIcons = {
      email: '📧',
      github: '💻',
      bilibili: '📺',
      youtube: '▶️',
      zhihu: '💬'
    };

    const socialNames = {
      email: 'Email',
      github: 'GitHub',
      bilibili: 'Bilibili',
      youtube: 'YouTube',
      zhihu: '知乎'
    };

    let socialHtml = '';
    if (social) {
      socialHtml = `
        <div class="social-links">
          ${Object.entries(social).map(([key, value]) => {
            const href = key === 'email' ? `mailto:${value}` : value;
            return `
              <a href="${href}" class="social-link" target="_blank">
                <span>${socialIcons[key] || '🔗'}</span>
                <span>${socialNames[key] || key}</span>
              </a>
            `;
          }).join('')}
        </div>
      `;
    }

    let wechatHtml = '';
    if (wechat) {
      wechatHtml = `
        <div class="wechat-section">
          <div class="wechat-info">
            <p class="wechat-text">${wechat.text}</p>
            <p class="wechat-name">${wechat.name}</p>
          </div>
          <img src="decorations/QRCode.jpg" alt="WeChat QR Code" class="wechat-qrcode">
        </div>
      `;
    }

    this.innerHTML = `
      <div class="contact-container">
        <h2 class="contact-title">${title}</h2>
        <p class="contact-desc">${description.replace(/\n/g, '<br>')}</p>
        ${socialHtml}
        ${wechatHtml}
      </div>
    `;
  }
}

customElements.define('es-contact', ESContact);
