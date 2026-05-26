class ESCard extends HTMLElement {
  constructor() {
    super();
    this.data = null;
  }

  setData(data) {
    this.data = data;
    this.render();
    this.bindEvents();
  }

  render() {
    if (!this.data) return;
    this.innerHTML = this.generateContent();
  }

  generateContent() {
    return '';
  }

  bindEvents() {
  }

  parseZTags(text) {
    return Utils.parseZTags(text);
  }

  getUIText(key) {
    return I18n.getCommon(`ui.${key}`) || key;
  }
}

class ESProductCard extends ESCard {
  generateContent() {
    const {
      title,
      text,
      features,
      techStack,
      link,
      available
    } = this.data;

    let html = '';

    if (link) {
      html += `
        <div class="product-preview" data-preview="${link}">
          <div class="preview-placeholder">
            <div class="placeholder-icon">🌐</div>
            <div class="placeholder-text">${this.getUIText('clickToPreview')}</div>
          </div>
          <div class="preview-overlay">
            <span class="preview-hint">${this.getUIText('viewFullPage')}</span>
          </div>
        </div>
      `;
    }

    html += `<div class="product-info">`;

    if (title) {
      html += `<h3 class="product-title">${this.parseZTags(title)}</h3>`;
    }

    if (text) {
      html += `<p class="product-text">${this.parseZTags(text)}</p>`;
    }

    if (techStack && techStack.length > 0) {
      html += `
        <div class="product-tech">
          ${techStack.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
        </div>
      `;
    }

    if (features && features.length > 0) {
      html += `
        <ul class="product-features">
          ${features.map(feature => `<li>${feature}</li>`).join('')}
        </ul>
      `;
    }

    if (link) {
      const isAvailable = available !== false;
      const linkClass = isAvailable ? 'product-link' : 'product-link disabled';
      const linkText = isAvailable
        ? this.getUIText('buttonAccess')
        : this.getUIText('buttonComing');

      if (isAvailable) {
        html += `<a href="${link}" class="${linkClass}" target="_blank">${linkText}</a>`;
      } else {
        html += `<span class="${linkClass}">${linkText}</span>`;
      }
    }

    html += `</div>`;

    return html;
  }

  bindEvents() {
    const previewEl = this.querySelector('.product-preview');
    if (previewEl) {
      previewEl.addEventListener('click', (e) => {
        if (e.target.closest('.product-link')) return;
        this.openLightbox(previewEl.dataset.preview);
      });
    }
  }

  openLightbox(src) {
    let lightbox = document.getElementById('product-lightbox');
    
    if (!lightbox) {
      lightbox = document.createElement('div');
      lightbox.id = 'product-lightbox';
      lightbox.className = 'lightbox';
      lightbox.innerHTML = `
        <div class="lightbox-content lightbox-iframe-container">
          <button class="lightbox-close" aria-label="Close">&times;</button>
          <div class="lightbox-loading">
            <div class="preview-spinner"></div>
            <span>${this.getUIText('loading')}</span>
          </div>
          <iframe class="lightbox-iframe" src="" title="Preview" frameborder="0"></iframe>
        </div>
      `;
      document.body.appendChild(lightbox);

      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
          this.closeLightbox();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeLightbox();
        }
      });
    }

    const iframe = lightbox.querySelector('.lightbox-iframe');
    const loading = lightbox.querySelector('.lightbox-loading');
    
    if (loading) loading.style.display = 'flex';
    iframe.src = src;
    
    iframe.onload = () => {
      if (loading) loading.style.display = 'none';
    };
    
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeLightbox() {
    const lightbox = document.getElementById('product-lightbox');
    if (lightbox) {
      lightbox.classList.remove('active');
      const iframe = lightbox.querySelector('.lightbox-iframe');
      if (iframe) {
        iframe.src = '';
      }
      document.body.style.overflow = '';
    }
  }
}

customElements.define('es-product-card', ESProductCard);

console.log('es-card components loaded: ESCard, ESProductCard');
