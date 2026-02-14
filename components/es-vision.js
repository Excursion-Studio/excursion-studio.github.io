class ESVision extends HTMLElement {
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

    const { title, motto, content } = this.data;

    let mottoHtml = '';
    if (motto && motto.lines) {
      mottoHtml = `
        <div class="motto">
          ${motto.lines.map(line => `
            <p class="motto-line">${Utils.parseZTags(line.text)}</p>
          `).join('')}
        </div>
      `;
    }

    let contentHtml = '';
    if (content && content.length > 0) {
      contentHtml = `
        <div class="vision-content">
          ${content.map(para => `<p>${Utils.parseZTags(para)}</p>`).join('')}
        </div>
      `;
    }

    this.innerHTML = `
      <div class="vision-container">
        ${title ? `<h2 class="section-title">${title}</h2>` : ''}
        ${mottoHtml}
        ${contentHtml}
      </div>
    `;
  }
}

customElements.define('es-vision', ESVision);
