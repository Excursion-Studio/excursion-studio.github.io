class ESCard extends HTMLElement {
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

    const {
      id,
      title,
      subtitle,
      text,
      topics,
      tags,
      link,
      available,
      icon,
      continueText,
      futureTags
    } = this.data;

    if (continueText) {
      this.renderContinueCard(continueText, futureTags);
      return;
    }

    let html = '';

    if (icon) {
      html += `<div class="card-icon">${icon}</div>`;
    }

    if (title) {
      html += `<h3 class="card-title">${title}</h3>`;
    }

    if (subtitle) {
      html += `<div class="card-subtitle">${subtitle}</div>`;
    }

    if (text) {
      html += `<p class="card-text">${Utils.parseZTags(text)}</p>`;
    }

    if (topics && topics.length > 0) {
      html += `
        <ul class="card-topics">
          ${topics.map(topic => `<li>${topic}</li>`).join('')}
        </ul>
      `;
    }

    if (tags && tags.length > 0) {
      html += `
        <div class="card-tags">
          ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      `;
    }

    if (link) {
      const isAvailable = available !== false;
      const linkClass = isAvailable ? 'card-link' : 'card-link disabled';
      const linkText = isAvailable
        ? I18n.getCommon('ui.buttonAccess')
        : I18n.getCommon('ui.buttonComing');

      if (isAvailable) {
        html += `<a href="${link}" class="${linkClass}" target="_blank">${linkText}</a>`;
      } else {
        html += `<span class="${linkClass}">${linkText}</span>`;
      }
    }

    this.innerHTML = html;
  }

  renderContinueCard(continueText, futureTags) {
    let html = `<p class="continue-text">${continueText}</p>`;

    if (futureTags && futureTags.length > 0) {
      html += `
        <div class="future-tags">
          ${futureTags.map(tag => `<span class="future-tag">${tag}</span>`).join('')}
        </div>
      `;
    }

    this.classList.add('continue-card');
    this.innerHTML = html;
  }
}

customElements.define('es-card', ESCard);
