class ESHero extends HTMLElement {
  constructor() {
    super();
    this.data = null;
    this.showTime = false;
    this.subtitle = '';
    this.description = '';
  }

  static get observedAttributes() {
    return ['show-time', 'subtitle', 'description'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'show-time') {
      this.showTime = newValue !== 'false';
    } else if (name === 'subtitle') {
      this.subtitle = newValue;
    } else if (name === 'description') {
      this.description = newValue;
    }
    this.render();
  }

  setData(data) {
    this.data = data;
    this.render();
  }

  render() {
    const title = this.data?.title || '';
    const showTime = this.data?.showTime ?? this.showTime;
    const subtitle = this.data?.subtitle ?? this.subtitle;
    const description = this.data?.description ?? this.description;

    let timeHtml = '';
    if (showTime) {
      timeHtml = `
        <div class="hero-time">
          <span class="time-label">${I18n.getCommon('ui.currentTime')}</span>
          <span class="time-value" id="current-time">${Utils.formatTime(new Date())}</span>
        </div>
      `;
    }

    let subtitleHtml = '';
    if (subtitle) {
      subtitleHtml = `<p class="subtitle">${subtitle}</p>`;
    }

    let descHtml = '';
    if (description) {
      descHtml = `<p class="hero-description">${Utils.parseZTags(description)}</p>`;
    }

    this.innerHTML = `
      <div class="hero-content">
        <h1>${title}</h1>
        ${subtitleHtml}
        ${timeHtml}
        ${descHtml}
      </div>
    `;

    if (showTime) {
      this.startTimeUpdate();
    }
  }

  startTimeUpdate() {
    const timeElement = this.querySelector('#current-time');
    if (timeElement) {
      setInterval(() => {
        timeElement.textContent = Utils.formatTime(new Date());
      }, 1000);
    }
  }
}

customElements.define('es-hero', ESHero);
