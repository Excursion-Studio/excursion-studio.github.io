/**
 * content-renderer.js - 页面渲染入口
 * 负责页面级别的渲染逻辑
 * 依赖: i18n.js, components.js
 */

/**
 * 渲染完整页面
 * @param {string} pageType - 页面类型 (courses, products, index)
 * @param {string} containerId - 主容器 ID
 */
async function renderPage(pageType, containerId = 'main-content') {
  detectLanguage();
  updateLangInUrl(getCurrentLang());
  
  const data = await loadLangData(getCurrentLang());
  if (!data) return;
  
  setLangData(data);

  const pageData = data[pageType];
  if (!pageData) {
    console.error(`Page type "${pageType}" not found in language data`);
    return;
  }

  document.documentElement.lang = getCurrentLang();
  document.title = pageData.pageTitle;

  await renderNavbar();
  renderFooter();

  const container = document.getElementById(containerId);
  if (!container) return;

  container.classList.add('page-enter');

  if (pageData.pageType === 'home') {
    container.innerHTML = await renderHomePage(pageData);
    initHomeFeatures(pageData);
  } else {
    container.innerHTML = await renderListPage(pageData);
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      container.classList.add('page-enter-active');
      setTimeout(() => {
        container.classList.remove('page-enter', 'page-enter-active');
      }, 500);
    });
  });

  animateCardsSequentially(container);
}

/**
 * 渲染列表页
 * @param {Object} data - 页面数据
 * @returns {Promise<string>} HTML 字符串
 */
async function renderListPage(data) {
  let html = `
    <div class="layer content-layer">
      <div class="container">
        <h2 class="section-title">${parseHighlightTags(data.sectionTitle)}</h2>
        <div class="module-grid">
          ${data.items.map(item => renderCard(item)).join('')}
        </div>
      </div>
    </div>
  `;
  
  if (data.showContact !== false) {
    html += await renderContactSection();
  }
  
  return html;
}

/**
 * 渲染首页
 * @param {Object} data - 页面数据
 * @returns {Promise<string>} HTML 字符串
 */
async function renderHomePage(data) {
  let html = '';
  const uiData = getLangData().ui;

  if (data.hero) {
    html += `
      <div class="layer hero-layer">
        <div class="container">
          <h1>${parseHighlightTags(data.hero.title)}</h1>
          ${data.hero.showTime ? `<div class="current-time">${uiData.currentTime} <span id="current-time"></span></div>` : ''}
        </div>
      </div>
    `;
  }

  if (data.sections) {
    data.sections.forEach(section => {
      if (section.type === 'overview') {
        html += renderOverviewSection(section);
      } else if (section.type === 'vision') {
        html += renderVisionSection(section);
      }
    });
  }

  if (data.showContact) {
    html += await renderContactSection();
  }

  return html;
}

/**
 * 渲染概览区块
 * @param {Object} section - 区块数据
 * @returns {string} HTML 字符串
 */
function renderOverviewSection(section) {
  return `
    <div class="layer content-layer">
      <div class="container">
        <h2 class="section-title">${parseHighlightTags(section.title)}</h2>
        <div class="module-grid">
          ${section.items.map(item => renderCard(item)).join('')}
        </div>
      </div>
    </div>
  `;
}

/**
 * 渲染愿景区块
 * @param {Object} section - 区块数据
 * @returns {string} HTML 字符串
 */
function renderVisionSection(section) {
  const mottoLines = section.motto.lines.map(line => 
    `<p>${parseHighlightTags(line.text)}</p>`
  ).join('');

  const content = section.content.map(p => `<p>${parseHighlightTags(p)}</p>`).join('');

  return `
    <div class="layer content-layer">
      <div class="container">
        <h2 class="section-title">${parseHighlightTags(section.title)}</h2>
        <div class="motto">
          ${mottoLines}
        </div>
        <div class="about-content">
          ${content}
        </div>
      </div>
    </div>
  `;
}

/**
 * 初始化首页特性
 * @param {Object} data - 页面数据
 */
function initHomeFeatures(data) {
  if (data.hero && data.hero.showTime) {
    const script = document.createElement('script');
    script.src = 'src/current_time.js';
    document.body.appendChild(script);
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    renderPage,
    renderListPage,
    renderHomePage,
    renderOverviewSection,
    renderVisionSection
  };
}
