console.log('app.js loading...');

class App {
  constructor() {
    console.log('App constructor called');
    this.pageName = 'index';
  }

  async init(pageName) {
    console.log('App.init called with:', pageName);
    this.pageName = pageName;
    await I18n.init(pageName);
    this.renderPage();
  }

  renderPage() {
    console.log('renderPage called');
    this.renderNavbar();
    this.renderHero();
    this.renderSections();
    this.renderContact();
    this.renderFooter();
    this.updatePageTitle();
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

    let heroData = null;

    if (this.pageName === 'index') {
      heroData = I18n.getPage('index.hero');
    } else if (this.pageName === 'products') {
      heroData = I18n.getPage('products.hero');
    }

    if (heroData) {
      hero.setData(heroData);
    }
  }

  renderSections() {
    const sectionsContainer = document.querySelector('.sections-container');
    if (!sectionsContainer) return;

    if (this.pageName === 'index') {
      const sections = I18n.getPage('index.sections');
      if (sections) {
        this.renderIndexSections(sectionsContainer, sections);
      }
    } else if (this.pageName === 'products') {
      const items = I18n.getPage('products.items');
      const sectionTitle = I18n.getPage('products.sectionTitle');
      if (items) {
        this.renderProductsSection(sectionsContainer, items, sectionTitle);
      }
    }
  }

  renderIndexSections(container, sections) {
    sections.forEach(section => {
      const sectionEl = document.createElement('section');
      sectionEl.className = 'container';

      let sectionHtml = `<h2 class="section-title">${section.title}</h2>`;

      if (section.type === 'overview') {
        sectionHtml += '<div class="overview-grid">';
        section.items.forEach(item => {
          sectionHtml += `<es-card id="card-${item.id}"></es-card>`;
        });
        sectionHtml += '</div>';
      } else if (section.type === 'vision') {
        sectionHtml += '<es-vision id="vision-section"></es-vision>';
      }

      sectionEl.innerHTML = sectionHtml;
      container.appendChild(sectionEl);

      if (section.type === 'overview') {
        section.items.forEach(item => {
          const card = sectionEl.querySelector(`#card-${item.id}`);
          if (card) {
            card.setData(item);
          }
        });
      } else if (section.type === 'vision') {
        const vision = sectionEl.querySelector('#vision-section');
        if (vision) {
          vision.setData(section);
        }
      }
    });
  }

  renderProductsSection(container, items, sectionTitle) {
    let html = `<h2 class="section-title">${sectionTitle}</h2>`;
    html += '<div class="products-grid">';

    items.forEach(item => {
      html += `<es-product-card id="product-${item.id}"></es-product-card>`;
    });

    html += '</div>';

    container.innerHTML = html;

    items.forEach(item => {
      const card = container.querySelector(`#product-${item.id}`);
      if (card) {
        card.setData(item);
      }
    });
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
    let pageTitle = null;

    if (this.pageName === 'index') {
      pageTitle = I18n.getPage('index.pageTitle');
    } else if (this.pageName === 'products') {
      pageTitle = I18n.getPage('products.pageTitle');
    }

    if (pageTitle) {
      document.title = pageTitle;
    }
  }
}

console.log('App class defined, creating instance...');
window.App = new App();
console.log('App instance created:', window.App);
console.log('App.init:', window.App.init);
