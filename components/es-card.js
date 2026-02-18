class ESOverviewCard extends HTMLElement {
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

    const { id, title, text } = this.data;

    let html = '';

    if (title) {
      html += `<h3 class="card-title">${Utils.parseZTags(title)}</h3>`;
    }

    if (text) {
      html += `<p class="card-text">${Utils.parseZTags(text)}</p>`;
    }

    this.innerHTML = html;
  }
}

customElements.define('es-overview-card', ESOverviewCard);

class ESCoursesCard extends HTMLElement {
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
      text,
      topics,
      tags,
      link,
      available,
      continueText,
      futureTags
    } = this.data;

    if (continueText) {
      this.renderContinueCard(continueText, futureTags);
      return;
    }

    let html = '';

    if (title) {
      html += `<h3 class="card-title">${Utils.parseZTags(title)}</h3>`;
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

customElements.define('es-courses-card', ESCoursesCard);

class ESProductCard extends HTMLElement {
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
            <div class="placeholder-text">${I18n.getCommon('ui.clickToPreview') || '点击预览'}</div>
          </div>
          <div class="preview-overlay">
            <span class="preview-hint">${I18n.getCommon('ui.viewFullPage') || '查看完整页面'}</span>
          </div>
        </div>
      `;
    }

    html += `<div class="product-info">`;

    if (title) {
      html += `<h3 class="product-title">${Utils.parseZTags(title)}</h3>`;
    }

    if (text) {
      html += `<p class="product-text">${Utils.parseZTags(text)}</p>`;
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
        ? I18n.getCommon('ui.buttonAccess')
        : I18n.getCommon('ui.buttonComing');

      if (isAvailable) {
        html += `<a href="${link}" class="${linkClass}" target="_blank">${linkText}</a>`;
      } else {
        html += `<span class="${linkClass}">${linkText}</span>`;
      }
    }

    html += `</div>`;

    this.innerHTML = html;

    this.bindEvents();
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
            <span>${I18n.getCommon('ui.loading') || '加载中...'}</span>
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

class ESDigestsCard extends HTMLElement {
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
      number,
      title,
      description,
      date,
      digestPubTime,
      authors,
      tags,
      venue,
      pdfUrl,
      sourcePath,
      category
    } = this.data;

    // 生成正确的地址
    let categoryPath = '';
    if (category === 'paper-guide') {
      categoryPath = 'paper-guide';
    } else if (category === 'paper-express') {
      categoryPath = 'paper-express';
    }
    
    const paperName = sourcePath.split('/').slice(-2)[0];
    const url = `https://excursion-studio.github.io/ES-digests/${categoryPath}/index.html?paper=${paperName}`;

    let html = `
      <div class="digest-card">
        <div class="digest-number">#${number}</div>
        <div class="digest-content">
    `;

    if (title) {
      html += `<h3 class="digest-title">${Utils.parseZTags(title)}</h3>`;
    }

    if (description) {
      html += `<p class="digest-description">${description.replace(/\n/g, '<br>')}</p>`;
    }

    html += `<div class="digest-meta">`;
    if (date) {
      html += `<span class="digest-date">${date}</span>`;
    }
    if (venue) {
      html += `<span class="digest-venue">${venue}</span>`;
    }
    html += `</div>`;

    if (tags && tags.length > 0) {
      html += `
        <div class="digest-tags">
          ${tags.map(tag => `<span class="digest-tag">${tag}</span>`).join('')}
        </div>
      `;
    }

    html += `<div class="digest-footer">`;
    html += `<a href="${url}" class="digest-link" target="_blank">${I18n.getDigests('ui.readMore') || '阅读全文'}</a>`;
    if (digestPubTime) {
      const publishedOn = I18n.getDigests('ui.publishedOn') || '发布于';
      html += `<span class="digest-pub-time">${publishedOn} ${digestPubTime}</span>`;
    }
    html += `</div>`;

    html += `
        </div>
      </div>
    `;

    this.innerHTML = html;
  }
}

customElements.define('es-digests-card', ESDigestsCard);

console.log('es-card components loaded: ESOverviewCard, ESCoursesCard, ESProductCard, ESDigestsCard');
