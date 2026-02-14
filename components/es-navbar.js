class ESNavbar extends HTMLElement {
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

    const { logo, logoAlt, links, langSwitch } = this.data;

    this.innerHTML = `
      <nav class="navbar">
        <div class="navbar-logo">
          <a href="index.html">
            <img src="${logo}" alt="${logoAlt}">
          </a>
        </div>
        <button class="mobile-menu-btn" aria-label="Menu">
          ☰
        </button>
        <div class="navbar-links">
          ${links.map(link => `
            <a href="${link.href}">${link.text}</a>
          `).join('')}
          <button class="lang-switch" onclick="I18n.switchLanguage()">
            ${langSwitch.text}
          </button>
        </div>
      </nav>
    `;

    this.querySelector('.mobile-menu-btn').addEventListener('click', () => {
      this.querySelector('.navbar-links').classList.toggle('active');
    });
  }
}

customElements.define('es-navbar', ESNavbar);
