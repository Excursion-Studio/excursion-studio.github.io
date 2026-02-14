class ESFooter extends HTMLElement {
  constructor() {
    super();
    this.data = null;
  }

  setData(data) {
    this.data = data;
    this.render();
  }

  render() {
    const copyright = this.data?.copyright || 'Excursion Studio. All rights reserved.';
    const year = new Date().getFullYear();

    this.innerHTML = `
      <div class="footer-content">
        <p class="copyright">&copy; ${year} ${copyright}</p>
      </div>
    `;
  }
}

customElements.define('es-footer', ESFooter);
