/**
 * Content Renderer - 内容渲染脚本
 * 用于从 JSON 数据动态渲染页面内容
 * 支持多种页面类型：list（列表页）、home（首页）
 */

/**
 * 加载 JSON 数据
 * @param {string} pageType - 页面类型 (courses, products, index)
 * @returns {Promise<Object>} 页面数据
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
 * 渲染完整页面
 * @param {string} pageType - 页面类型 (courses, products, index)
 * @param {string} containerId - 主容器 ID
 */
async function renderPage(pageType, containerId = 'main-content') {
  // 加载共享组件
  loadSharedComponents();

  // 加载页面数据
  const data = await loadPageData(pageType);
  if (!data) return;

  // 设置页面标题
  document.title = data.pageTitle;

  // 根据页面类型渲染
  const container = document.getElementById(containerId);
  if (!container) return;

  // 添加进入动画初始状态
  container.classList.add('page-enter');

  if (data.pageType === 'home') {
    container.innerHTML = renderHomePage(data);
    initHomeFeatures(data);
  } else {
    // 默认列表页
    container.innerHTML = renderListPage(data);
  }

  // 触发动画
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      container.classList.add('page-enter-active');
      // 动画结束后清理类
      setTimeout(() => {
        container.classList.remove('page-enter', 'page-enter-active');
      }, 500);
    });
  });

  // 卡片依次进入动画
  animateCardsSequentially(container);
}

/**
 * 渲染列表页
 * @param {Object} data - 页面数据
 * @returns {string} HTML 字符串
 */
function renderListPage(data) {
  return `
    <div class="layer content-layer">
      <div class="container">
        <h2 class="section-title">${data.sectionTitle}</h2>
        <div class="module-grid">
          ${data.items.map(item => renderListCard(item)).join('')}
        </div>
      </div>
    </div>
    ${data.showContact !== false ? '<div id="contact-container"></div>' : ''}
  `;
}

/**
 * 渲染列表卡片
 * @param {Object} item - 模块数据
 * @param {string} buttonText - 按钮文本
 * @returns {string} 卡片 HTML
 */
function renderListCard(item) {
  // 检查是否有available属性
  const hasAvailable = 'available' in item;
  
  // 只有当有available属性时才显示按钮
  let buttonHtml = '';
  if (hasAvailable) {
    const isAvailable = item.available && item.link;
    const link = isAvailable
      ? `href="${item.link}" target="_blank"`
      : 'href="javascript:void(0);"';
    const buttonText = isAvailable ? '进入' : '即将上线...';
    const disabledClass = isAvailable ? '' : ' disabled';
    
    buttonHtml = `<a ${link} class="${disabledClass}">${buttonText}</a>`;
  }

  return `
    <div class="module-card" id="${item.id}">
      <h3>${item.title}</h3>
      ${buttonHtml}
    </div>
  `;
}

/**
 * 渲染首页
 * @param {Object} data - 页面数据
 * @returns {string} HTML 字符串
 */
function renderHomePage(data) {
  let html = '';

  // Hero Layer
  if (data.hero) {
    html += `
      <div class="layer hero-layer">
        <div class="container">
          <h1>${data.hero.title}</h1>
          ${data.hero.showTime ? '<div class="current-time">当前时间: <span id="current-time"></span></div>' : ''}
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
 * 渲染概览区块
 * @param {Object} section - 区块数据
 * @returns {string} HTML 字符串
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
 * 渲染概览卡片
 * @param {Object} item - 卡片数据
 * @returns {string} HTML 字符串
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
 * 解析重点标注标签
 * @param {string} text - 原始文本
 * @returns {string} 转换后的 HTML
 * 
 * 支持标签：
 * <z>文本</z>   → <span class="status">文本</span>
 * <zi>文本</zi> → <span class="status"><em>文本</em></span>
 */
function parseHighlightTags(text) {
  if (!text) return '';
  
  return text
    .replace(/<zi>(.*?)<\/zi>/g, '<span class="status"><em>$1</em></span>')
    .replace(/<z>(.*?)<\/z>/g, '<span class="status">$1</span>');
}

/**
 * 卡片依次进入动画
 * @param {HTMLElement} container - 容器元素
 */
function animateCardsSequentially(container) {
  const cards = container.querySelectorAll('.module-card');
  cards.forEach((card, index) => {
    card.classList.add('card-enter');
    // 依次延迟 100ms
    setTimeout(() => {
      card.classList.add('card-enter-active');
      // 动画结束后清理类
      setTimeout(() => {
        card.classList.remove('card-enter', 'card-enter-active');
      }, 500);
    }, 100 + (index * 100));
  });
}

/**
 * 渲染愿景区块
 * @param {Object} section - 区块数据
 * @returns {string} HTML 字符串
 */
function renderVisionSection(section) {
  const mottoLines = section.motto.lines.map(line => 
    `<span class="highlight">${line.highlight}</span>${line.text}`
  ).join('</p><p>');

  const content = section.content.map(p => `<p>${p}</p>`).join('');

  return `
    <div class="layer content-layer">
      <div class="container">
        <h2 class="section-title">${section.title}</h2>
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
 * 初始化首页特性
 * @param {Object} data - 页面数据
 */
function initHomeFeatures(data) {
  if (data.hero && data.hero.showTime) {
    // 加载时间脚本
    const script = document.createElement('script');
    script.src = 'src/current_time.js';
    document.body.appendChild(script);
  }
}

/**
 * 加载共享组件 (navbar, contact, footer)
 */
function loadSharedComponents() {
  // Load navbar
  fetch('src/navbar.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('navbar-container').innerHTML = data;
      // Update language switch link
      const currentFilename = window.location.pathname.split('/').pop();
      const enLink = document.querySelector('a[href="../en/"]');
      if (enLink) {
        enLink.href = '../en/' + currentFilename;
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
      // 更新版权年份
      const yearSpan = document.getElementById('current-year');
      if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
      }
    })
    .catch(error => console.error('Error loading footer:', error));
}

// 导出函数供外部使用
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
