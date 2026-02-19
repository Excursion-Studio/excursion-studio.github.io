console.log('=== main.js loading ===');

const Utils = {
  parseZTags(text) {
    if (!text) return '';
    return text
      .replace(/<z>(.*?)<\/z>/g, '<z>$1</z>')
      .replace(/<zi>(.*?)<\/zi>/g, '<zi>$1</zi>');
  },

  formatTime(date) {
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };
    return date.toLocaleString('zh-CN', options);
  },

  getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  },

  setUrlParam(param, value) {
    const url = new URL(window.location.href);
    url.searchParams.set(param, value);
    window.history.replaceState({}, '', url);
  },

  detectLanguage() {
    const urlLang = this.getUrlParam('lang');
    if (urlLang === 'en' || urlLang === 'zh') {
      return urlLang;
    }
    const browserLang = navigator.language || navigator.userLanguage;
    return browserLang.startsWith('zh') ? 'zh' : 'en';
  },

  async fetchJSON(path) {
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch ${path}:`, error);
      return null;
    }
  },

  getLangUrl(href) {
    const currentLang = this.detectLanguage();
    const url = new URL(href, window.location.origin);
    url.searchParams.set('lang', currentLang);
    return url.toString();
  }
};

window.Utils = Utils;
console.log('Utils defined');

class I18nClass {
  constructor() {
    this.currentLang = 'zh';
    this.data = {
      common: {},
      page: {}
    };
  }

  async init(pageName) {
    console.log('I18n.init called with:', pageName);
    this.currentLang = Utils.detectLanguage();
    console.log('Detected language:', this.currentLang);
    await this.loadLanguageData(pageName);
    this.applyLanguage();
  }

  async loadLanguageData(pageName) {
    const commonPath = `data/${this.currentLang}/common.json`;
    const pagePath = `data/${this.currentLang}/${pageName}.json`;
    
    const digestsPath = `data/${this.currentLang}/digests.json`;

    console.log('Loading data from:', commonPath, pagePath);

    const [commonData, pageData, digestsData] = await Promise.all([
      Utils.fetchJSON(commonPath),
      Utils.fetchJSON(pagePath),
      Utils.fetchJSON(digestsPath)
    ]);

    this.data.common = commonData || {};
    this.data.page = pageData || {};
    this.data.digests = digestsData || {};

    console.log('Data loaded:', this.data);
  }

  get(path) {
    const keys = path.split('.');
    let value = this.data;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return path;
      }
    }

    return value;
  }

  getCommon(path) {
    return this.get(`common.${path}`);
  }

  getPage(path) {
    return this.get(`page.${path}`);
  }

  getDigests(path) {
    return this.get(`digests.${path}`);
  }

  switchLanguage() {
    const newLang = this.currentLang === 'zh' ? 'en' : 'zh';
    Utils.setUrlParam('lang', newLang);
    window.location.reload();
  }

  applyLanguage() {
    document.documentElement.lang = this.currentLang === 'zh' ? 'zh-CN' : 'en';
  }

  get currentLanguage() {
    return this.currentLang;
  }
}

window.I18n = new I18nClass();
console.log('I18n instance created:', window.I18n);

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
          <a href="${Utils.getLangUrl('index.html')}" class="logo-link">
            <img src="${logo}" alt="${logoAlt || 'Logo'}" class="logo-img">
          </a>
        </div>
        <button class="mobile-menu-btn" aria-label="Menu">
          ☰
        </button>
        <div class="navbar-links">
          ${links.map(link => `
            <a href="${Utils.getLangUrl(link.href)}">${link.text}</a>
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
console.log('es-navbar defined');

class ESHero extends HTMLElement {
  constructor() {
    super();
    this.data = null;
    this.showTime = false;
    this.subtitle = '';
    this.description = '';
  }

  setData(data) {
    this.data = data;
    this.render();
  }

  render() {
    const title = this.data?.title || '';
    const showTime = this.data?.showTime ?? false;
    const subtitle = this.data?.subtitle ?? '';
    const description = this.data?.description ?? '';

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
console.log('es-hero defined');

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

    const { motto, content } = this.data;

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
        ${mottoHtml}
        ${contentHtml}
      </div>
    `;
  }
}

customElements.define('es-vision', ESVision);
console.log('es-vision defined');

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
      email: '<svg viewBox="0 0 1024 1024" width="20" height="20"><path d="M853.333333 341.333333 512 554.666667 170.666667 341.333333 170.666667 256 512 469.333333 853.333333 256M853.333333 170.666667 170.666667 170.666667C123.306667 170.666667 85.333333 208.64 85.333333 256L85.333333 768C85.333333 814.933333 123.733333 853.333333 170.666667 853.333333L853.333333 853.333333C900.266667 853.333333 938.666667 814.933333 938.666667 768L938.666667 256C938.666667 208.64 900.266667 170.666667 853.333333 170.666667Z" fill="currentColor"></path></svg>',
      github: '<svg viewBox="0 0 1024 1024" width="20" height="20"><path d="M512 85.333333C276.266667 85.333333 85.333333 276.266667 85.333333 512a426.410667 426.410667 0 0 0 291.754667 404.821333c21.333333 3.712 29.312-9.088 29.312-20.309333 0-10.112-0.554667-43.690667-0.554667-79.445333-107.178667 19.754667-134.912-26.112-143.445333-50.133334-4.821333-12.288-25.6-50.133333-43.733333-60.288-14.933333-7.978667-36.266667-27.733333-0.554667-28.245333 33.621333-0.554667 57.6 30.933333 65.621333 43.733333 38.4 64.512 99.754667 46.378667 124.245334 35.2 3.754667-27.733333 14.933333-46.378667 27.221333-57.045333-94.933333-10.666667-194.133333-47.488-194.133333-210.688 0-46.421333 16.512-84.778667 43.733333-114.688-4.266667-10.666667-19.2-54.4 4.266667-113.066667 0 0 35.712-11.178667 117.333333 43.776a395.946667 395.946667 0 0 1 106.666667-14.421333c36.266667 0 72.533333 4.778667 106.666666 14.378667 81.578667-55.466667 117.333333-43.690667 117.333334-43.690667 23.466667 58.666667 8.533333 102.4 4.266666 113.066667 27.178667 29.866667 43.733333 67.712 43.733334 114.645333 0 163.754667-99.712 200.021333-194.645334 210.688 15.445333 13.312 28.8 38.912 28.8 78.933333 0 57.045333-0.554667 102.912-0.554666 117.333334 0 11.178667 8.021333 24.490667 29.354666 20.224A427.349333 427.349333 0 0 0 938.666667 512c0-235.733333-190.933333-426.666667-426.666667-426.666667z" fill="currentColor"></path></svg>',
      bilibili: '<svg viewBox="0 0 1024 1024" width="20" height="20"><path d="M777.514667 131.669333a53.333333 53.333333 0 0 1 0 75.434667L728.746667 255.829333h49.92A160 160 0 0 1 938.666667 415.872v320a160 160 0 0 1-160 160H245.333333A160 160 0 0 1 85.333333 735.872v-320a160 160 0 0 1 160-160h49.749334L246.4 207.146667a53.333333 53.333333 0 0 1 75.392-75.434667l113.152 113.152c3.370667 3.370667 6.186667 7.04 8.448 10.965333h137.088c2.261333-3.925333 5.12-7.68 8.490667-11.008l113.109333-113.152a53.333333 53.333333 0 0 1 75.434667 0z m1.152 231.253334H245.333333a53.333333 53.333333 0 0 0-53.205333 49.365333l-0.128 4.010667v320c0 28.117333 21.76 51.114667 49.365333 53.162666l3.968 0.170667h533.333334a53.333333 53.333333 0 0 0 53.205333-49.365333l0.128-3.968v-320c0-29.44-23.893333-53.333333-53.333333-53.333334z m-426.666667 106.666666c29.44 0 53.333333 23.893333 53.333333 53.333334v53.333333a53.333333 53.333333 0 1 1-106.666666 0v-53.333333c0-29.44 23.893333-53.333333 53.333333-53.333334z m320 0c29.44 0 53.333333 23.893333 53.333333 53.333334v53.333333a53.333333 53.333333 0 1 1-106.666666 0v-53.333333c0-29.44 23.893333-53.333333 53.333333-53.333334z" fill="currentColor"></path></svg>',
      youtube: '<svg viewBox="0 0 1024 1024" width="20" height="20"><path d="M1003.2 265.6c-11.2-44.8-46.4-78.4-91.2-91.2-80-20.8-400-20.8-400-20.8s-320 0-400 20.8c-44.8 11.2-78.4 46.4-91.2 91.2C0 345.6 0 512 0 512s0 166.4 20.8 246.4c11.2 44.8 46.4 78.4 91.2 91.2 80 20.8 400 20.8 400 20.8s320 0 400-20.8c44.8-11.2 78.4-46.4 91.2-91.2C1024 678.4 1024 512 1024 512s0-166.4-20.8-246.4z m-593.6 400V358.4L675.2 512l-265.6 153.6z" fill="currentColor"></path></svg>',
      zhihu: '<svg viewBox="0 0 1024 1024" width="20" height="20"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m-90.7 477.8l-0.1 1.5c-1.5 20.4-6.3 43.9-12.9 67.6l24-18.1 71 80.7c9.2 33-3.3 63.1-3.3 63.1l-95.7-111.9v-0.1c-8.9 29-20.1 57.3-33.3 84.7-22.6 45.7-55.2 54.7-89.5 57.7-34.4 3-23.3-5.3-23.3-5.3 68-55.5 78-87.8 96.8-123.1 11.9-22.3 20.4-64.3 25.3-96.8H264.1s4.8-31.2 19.2-41.7h101.6c0.6-15.3-1.3-102.8-2-131.4h-49.4c-9.2 45-41 56.7-48.1 60.1-7 3.4-23.6 7.1-21.1 0 2.6-7.1 27-46.2 43.2-110.7 16.3-64.6 63.9-62 63.9-62-12.8 22.5-22.4 73.6-22.4 73.6h159.7c10.1 0 10.6 39 10.6 39h-90.8c-0.7 22.7-2.8 83.8-5 131.4H519s12.2 15.4 12.2 41.7H421.3z m346.5 167h-87.6l-69.5 46.6-16.4-46.6h-40.1V321.5h213.6v387.3zM408.2 611s0-0.1 0 0z" fill="currentColor"></path><path d="M624.2 705.3l56.8-38.1h45.6-0.1V364.7H596.7v302.5h14.1z" fill="currentColor"></path></svg>'
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
                <span class="social-icon">${socialIcons[key] || '🔗'}</span>
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
console.log('es-contact defined');

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
console.log('es-footer defined');



class AppClass {
  constructor() {
    this.pageName = 'index';
  }

  detectPageName() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';
    const name = filename.replace('.html', '');
    return name === 'index' || name === '' ? 'index' : name;
  }

  async init(pageName) {
    this.pageName = pageName || this.detectPageName();
    console.log('App.init with pageName:', this.pageName);
    await I18n.init(this.pageName);
    this.renderPage();
  }

  renderPage() {
    console.log('renderPage called');
    this.renderNavbar();
    this.renderHero();
    this.renderDigestUpdate();
    this.renderSections();
    this.renderContact();
    this.renderFooter();
    this.updatePageTitle();
    this.setupAnimations();
  }

  setupAnimations() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      document.querySelectorAll('es-overview-card, es-courses-card, es-product-card, es-vision, es-contact, es-latest-digests-card').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    const latestDigestCard = document.querySelector('es-latest-digests-card');
    if (latestDigestCard) {
      setTimeout(() => {
        latestDigestCard.classList.add('animate-visible');
      }, 100);
    }

    document.querySelectorAll('es-overview-card, es-courses-card, es-product-card').forEach((card, index) => {
      const delay = index * 100;
      setTimeout(() => {
        card.classList.add('animate-visible');
      }, delay);
    });

    const visionEl = document.querySelector('es-vision');
    const contactEl = document.querySelector('es-contact');
    
    if (visionEl) {
      setTimeout(() => {
        visionEl.classList.add('animate-visible');
      }, 100);
    }
    
    if (contactEl) {
      setTimeout(() => {
        contactEl.classList.add('animate-visible');
      }, 200);
    }
  }

  renderNavbar() {
    const navbar = document.querySelector('es-navbar');
    if (navbar) {
      navbar.setData(I18n.getCommon('navbar'));
    }
  }

  renderHero() {
    const hero = document.querySelector('es-hero');
    if (!hero) return;

    const heroData = I18n.getPage('hero');
    if (heroData) {
      hero.setData(heroData);
    }
  }

  renderDigestUpdate() {
    const digestUpdateSection = document.getElementById('digest-update');
    if (!digestUpdateSection) return;

    const digestsSections = I18n.getDigests('sections') || [];
    const allItems = digestsSections.flatMap(section => section.items || []);
    
    if (allItems.length === 0) {
      digestUpdateSection.style.display = 'none';
      return;
    }

    const latestItem = allItems[0];
    const card = document.getElementById('latest-digest-card');
    if (card) {
      card.setData(latestItem);
    }

    const titleEl = document.getElementById('digest-update-title');
    if (titleEl) {
      const lang = I18n.currentLang || 'zh';
      titleEl.textContent = lang === 'zh' ? '文摘更新！' : 'Digest Update!';
    }
  }

  renderSections() {
    const sectionsContainer = document.querySelector('.sections-container');
    if (!sectionsContainer) return;

    const sections = I18n.getPage('sections');
    
    // 获取 digests 数据
    const digestsSections = I18n.getDigests('sections') || [];
    
    if (sections) {
      const nonDigestsSections = sections.filter(section => section.type !== 'digests');
      
      this.renderSectionsList(sectionsContainer, nonDigestsSections);
      
      if (digestsSections.length > 0 && this.pageName !== 'index') {
        const digestsSectionEl = document.createElement('section');
        digestsSectionEl.className = 'index-section';
        digestsSectionEl.innerHTML = '<es-digests-section id="digests-section"></es-digests-section>';
        sectionsContainer.appendChild(digestsSectionEl);
      }
    }

    const continueCard = I18n.getPage('continueCard');
    if (continueCard && typeof continueCard === 'object') {
      this.renderContinueCard(sectionsContainer, continueCard);
    }
  }

  renderSectionsList(container, sections) {
    sections.forEach(section => {
      const sectionEl = document.createElement('section');
      sectionEl.className = 'index-section';

      let sectionHtml = '';
      if (section.title) {
        sectionHtml += `<h2 class="section-title">${section.title}</h2>`;
      }

      if (section.type === 'overview') {
        sectionHtml += '<div class="overview-grid">';
        section.items.forEach(item => {
          sectionHtml += `<es-overview-card id="card-${item.id}"></es-overview-card>`;
        });
        sectionHtml += '</div>';
      } else if (section.type === 'vision') {
        sectionHtml += '<es-vision id="vision-section"></es-vision>';
      } else if (section.type === 'courses') {
        sectionHtml += '<div class="cards-grid">';
        section.items.forEach(item => {
          sectionHtml += `<es-courses-card id="course-${item.id}"></es-courses-card>`;
        });
        sectionHtml += '</div>';
      } else if (section.type === 'products') {
        sectionHtml += '<div class="products-grid">';
        section.items.forEach(item => {
          sectionHtml += `<es-product-card id="product-${item.id}"></es-product-card>`;
        });
        sectionHtml += '</div>';
      }

      sectionEl.innerHTML = sectionHtml;
      container.appendChild(sectionEl);

      if (section.type === 'overview') {
        section.items.forEach(item => {
          const card = sectionEl.querySelector(`#card-${item.id}`);
          if (card) card.setData(item);
        });
      } else if (section.type === 'vision') {
        const vision = sectionEl.querySelector('#vision-section');
        if (vision) vision.setData(section);
      } else if (section.type === 'courses') {
        section.items.forEach(item => {
          const card = sectionEl.querySelector(`#course-${item.id}`);
          if (card) card.setData(item);
        });
      } else if (section.type === 'products') {
        section.items.forEach(item => {
          const card = sectionEl.querySelector(`#product-${item.id}`);
          if (card) card.setData(item);
        });
      }

    });

    this.setupAnimations();
  }

  renderContinueCard(container, continueCardData) {
    const wrapper = document.createElement('div');
    wrapper.className = 'continue-card-wrapper';
    wrapper.innerHTML = `<es-courses-card id="page-continue-card"></es-courses-card>`;
    container.appendChild(wrapper);

    const card = wrapper.querySelector('#page-continue-card');
    if (card) {
      card.setData(continueCardData);
    }
  }

  renderContact() {
    const contact = document.querySelector('es-contact');
    if (contact) {
      contact.setData(I18n.getCommon('contact'));
    }
  }

  renderFooter() {
    const footer = document.querySelector('es-footer');
    if (footer) {
      footer.setData(I18n.getCommon('footer'));
    }
  }

  updatePageTitle() {
    const pageTitle = I18n.getPage('pageTitle');
    if (pageTitle) {
      document.title = pageTitle;
    }
  }
}

window.App = new AppClass();
console.log('App instance created:', window.App);

console.log('=== main.js loaded ===');
