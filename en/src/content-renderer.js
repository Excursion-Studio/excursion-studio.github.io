/**
 * Content Renderer - Content Rendering Script
 * Dynamically renders page content from JSON data
 * Supports multiple page types: list, home
 */

/**
 * Load JSON data
 * @param {string} pageType - Page type (courses, products, index)
 * @returns {Promise<Object>} Page data
 */
async function loadPageData(pageType) {
  try {
    const response = await fetch(`data/${pageType}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load ${pageType}.json: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading page data:', error);
    return null;
  }
}

/**
 * Render full page
 * @param {string} pageType - Page type (courses, products, index)
 * @param {string} containerId - Main container ID
 */
async function renderPage(pageType, containerId = 'main-content') {
  // Load shared components
  loadSharedComponents();

  // Load page data
  const data = await loadPageData(pageType);
  if (!data) return;

  // Set page title
  document.title = data.pageTitle;

  // Render based on page type
  const container = document.getElementById(containerId);
  if (!container) return;

  // Add enter animation initial state
  container.classList.add('page-enter');

  if (data.pageType === 'home') {
    container.innerHTML = renderHomePage(data);
    initHomeFeatures(data);
  } else {
    // Default list page
    container.innerHTML = renderListPage(data);
  }

  // Trigger animation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      container.classList.add('page-enter-active');
      // Clean up classes after animation
      setTimeout(() => {
        container.classList.remove('page-enter', 'page-enter-active');
      }, 500);
    });
  });

  // Card stagger animation
  animateCardsSequentially(container);
}

/**
 * Render list page
 * @param {Object} data - Page data
 * @returns {string} HTML string
 */
function renderListPage(data) {
  return `
    <div class="layer content-layer">
      <div class="container">
        <h2 class="section-title">${parseHighlightTags(data.sectionTitle)}</h2>
        <div class="module-grid">
          ${data.items.map(item => renderListCard(item)).join('')}
        </div>
      </div>
    </div>
    ${data.showContact !== false ? '<div id="contact-container"></div>' : ''}
  `;
}

/**
 * Render list card
 * @param {Object} item - Module data
 * @param {string} buttonText - Button text
 * @returns {string} Card HTML
 */
function renderListCard(item) {
  // Check if available property exists
  const hasAvailable = 'available' in item;
  
  // Only show button when available property exists
  let buttonHtml = '';
  if (hasAvailable) {
    const isAvailable = item.available && item.link;
    const link = isAvailable
      ? `href="${item.link}" target="_blank"`
      : 'href="javascript:void(0);"';
    const buttonText = isAvailable ? 'Access' : 'Coming...';
    const disabledClass = isAvailable ? '' : ' disabled';
    
    buttonHtml = `<a ${link} class="${disabledClass}">${buttonText}</a>`;
  }

  return `
    <div class="module-card" id="${item.id}">
      <h3>${parseHighlightTags(item.title)}</h3>
      ${buttonHtml}
    </div>
  `;
}

/**
 * Render home page
 * @param {Object} data - Page data
 * @returns {string} HTML string
 */
function renderHomePage(data) {
  let html = '';

  // Hero Layer
  if (data.hero) {
    html += `
      <div class="layer hero-layer">
        <div class="container">
          <h1>${parseHighlightTags(data.hero.title)}</h1>
          ${data.hero.showTime ? '<div class="current-time">Current Time: <span id="current-time"></span></div>' : ''}
        </div>
      </div>
    `;
  }

  // Sections
  if (data.sections) {
    data.sections.forEach(section => {
      if (section.type === 'overview') {
        html += renderOverviewSection(section);
      } else if (section.type === 'vision') {
        html += renderVisionSection(section);
      }
    });
  }

  // Contact
  if (data.showContact) {
    html += '<div id="contact-container"></div>';
  }

  return html;
}

/**
 * Render overview section
 * @param {Object} section - Section data
 * @returns {string} HTML string
 */
function renderOverviewSection(section) {
  return `
    <div class="layer content-layer">
      <div class="container">
        <h2 class="section-title">${section.title}</h2>
        <div class="module-grid">
          ${section.items.map(item => renderOverviewCard(item)).join('')}
        </div>
      </div>
    </div>
  `;
}

/**
 * Render overview card
 * @param {Object} item - Card data
 * @returns {string} HTML string
 */
function renderOverviewCard(item) {
  const content = parseHighlightTags(item.text);

  return `
    <div class="module-card" id="${item.id}">
      <h3>${item.title}</h3>
      <p>${content}</p>
    </div>
  `;
}

/**
 * Parse highlight tags
 * @param {string} text - Raw text
 * @returns {string} Converted HTML
 * 
 * Supported tags:
 * <z>text</z>   → <span class="status">text</span>
 * <zi>text</zi> → <span class="status"><em>text</em></span>
 */
function parseHighlightTags(text) {
  if (!text) return '';

  return text
    .replace(/<zi>(.*?)<\/zi>/g, '<span class="status"><em>$1</em></span>')
    .replace(/<z>(.*?)<\/z>/g, '<span class="status">$1</span>');
}

/**
 * Card stagger animation
 * @param {HTMLElement} container - Container element
 */
function animateCardsSequentially(container) {
  const cards = container.querySelectorAll('.module-card');
  cards.forEach((card, index) => {
    card.classList.add('card-enter');
    // Stagger delay 100ms
    setTimeout(() => {
      card.classList.add('card-enter-active');
      // Clean up classes after animation
      setTimeout(() => {
        card.classList.remove('card-enter', 'card-enter-active');
      }, 500);
    }, 100 + (index * 100));
  });
}

/**
 * Render vision section
 * @param {Object} section - Section data
 * @returns {string} HTML string
 */
function renderVisionSection(section) {
  const mottoLines = section.motto.lines.map(line => 
    `<span class="highlight">${parseHighlightTags(line.highlight)}</span>${parseHighlightTags(line.text)}`
  ).join('</p><p>');

  const content = section.content.map(p => `<p>${parseHighlightTags(p)}</p>`).join('');

  return `
    <div class="layer content-layer">
      <div class="container">
        <h2 class="section-title">${parseHighlightTags(section.title)}</h2>
        <div class="motto">
          <p>${mottoLines}</p>
        </div>
        <div class="about-content">
          ${content}
        </div>
      </div>
    </div>
  `;
}

/**
 * Initialize home page features
 * @param {Object} data - Page data
 */
function initHomeFeatures(data) {
  if (data.hero && data.hero.showTime) {
    // Load time script
    const script = document.createElement('script');
    script.src = 'src/current_time.js';
    document.body.appendChild(script);
  }
}

/**
 * Load shared components (navbar, contact, footer)
 */
function loadSharedComponents() {
  // Load navbar
  fetch('src/navbar.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('navbar-container').innerHTML = data;
      // Update language switch link
      const currentFilename = window.location.pathname.split('/').pop();
      const zhLink = document.querySelector('a[href="../zh/"]');
      if (zhLink) {
        zhLink.href = '../zh/' + currentFilename;
      }
    })
    .catch(error => console.error('Error loading navbar:', error));

  // Load contact section (if container exists)
  const contactContainer = document.getElementById('contact-container');
  if (contactContainer) {
    fetch('src/contact.html')
      .then(response => response.text())
      .then(data => {
        contactContainer.innerHTML = data;
      })
      .catch(error => console.error('Error loading contact:', error));
  }

  // Load footer
  fetch('src/footer.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('footer-container').innerHTML = data;
      // Update copyright year
      const yearSpan = document.getElementById('current-year');
      if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
      }
    })
    .catch(error => console.error('Error loading footer:', error));
}

// Export functions for external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    loadPageData, 
    renderPage, 
    renderListPage, 
    renderHomePage,
    renderListCard,
    renderOverviewCard,
    loadSharedComponents 
  };
}
