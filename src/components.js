/**
 * components.js - 组件渲染模块
 * 负责渲染各种 UI 组件
 */

/**
 * 渲染导航栏
 */
async function renderNavbar() {
  const navbarData = getLangData().navbar;
  if (!navbarData) return;

  const navbarContainer = document.getElementById('navbar-container');
  if (!navbarContainer) return;

  const template = await loadTemplate('src/navbar.html');
  navbarContainer.innerHTML = template;

  const logoLink = document.getElementById('nav-logo-link');
  const logo = document.getElementById('nav-logo');
  const linksContainer = document.getElementById('nav-links');

  if (logoLink) logoLink.href = `index.html?lang=${getCurrentLang()}`;
  if (logo) {
    logo.src = navbarData.logo;
    logo.alt = navbarData.logoAlt;
  }

  if (linksContainer) {
    let linksHtml = navbarData.links.map(link => {
      let href;
      if (link.href.startsWith('javascript:')) {
        href = link.href;
      } else if (link.href.endsWith('.html')) {
        href = `${link.href}?lang=${getCurrentLang()}`;
      } else {
        href = `${link.href}&lang=${getCurrentLang()}`;
      }
      return `<li><a href="${href}">${link.text}</a></li>`;
    }).join('');
    
    linksHtml += `<li><a href="${navbarData.langSwitch.href}">${navbarData.langSwitch.text}</a></li>`;
    linksContainer.innerHTML = linksHtml;
  }
}

/**
 * 渲染页脚
 */
function renderFooter() {
  const footerData = getLangData().footer;
  if (!footerData) return;

  const footerHtml = `
    <footer>
      <p>&copy; <span id="current-year"></span> ${footerData.copyright}</p>
    </footer>
  `;

  document.getElementById('footer-container').innerHTML = footerHtml;
  
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
}

/**
 * 渲染联系区块
 * @returns {Promise<string>} HTML 字符串
 */
async function renderContactSection() {
  const contactData = getLangData().contact;
  if (!contactData) return '';

  const template = await loadTemplate('src/contact.html');
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = template;

  const title = tempDiv.querySelector('#contact-title');
  const description = tempDiv.querySelector('#contact-description');
  const wechat = tempDiv.querySelector('#contact-wechat');

  if (title) title.textContent = contactData.title;
  if (description) description.innerHTML = contactData.description.replace(/\n/g, '<br>');
  if (wechat) wechat.innerHTML = `${contactData.wechat.text} <strong>${contactData.wechat.name}</strong>`;
  
  if (contactData.social) {
    const socialEmail = tempDiv.querySelector('#social-email');
    const socialGithub = tempDiv.querySelector('#social-github');
    const socialBilibili = tempDiv.querySelector('#social-bilibili');
    const socialYoutube = tempDiv.querySelector('#social-youtube');
    const socialZhihu = tempDiv.querySelector('#social-zhihu');
    
    if (socialEmail && contactData.social.email) socialEmail.href = `mailto:${contactData.social.email}`;
    if (socialGithub && contactData.social.github) socialGithub.href = contactData.social.github;
    if (socialBilibili && contactData.social.bilibili) socialBilibili.href = contactData.social.bilibili;
    if (socialYoutube && contactData.social.youtube) socialYoutube.href = contactData.social.youtube;
    if (socialZhihu && contactData.social.zhihu) socialZhihu.href = contactData.social.zhihu;
  }

  return tempDiv.innerHTML;
}

/**
 * 渲染通用卡片
 * @param {Object} item - 卡片数据
 * @returns {string} 卡片 HTML
 * 
 * 支持属性：
 * - id: 卡片唯一标识符
 * - title: 卡片标题（支持 <z> <zi> 高亮标签）
 * - text: 卡片描述文本（可选，支持 <z> <zi> 高亮标签）
 * - link: 跳转链接（可选）
 * - available: 是否可用（可选，控制按钮状态）
 */
function renderCard(item) {
  const uiData = getLangData().ui;
  
  let textHtml = '';
  if (item.text) {
    textHtml = `<p>${parseHighlightTags(item.text)}</p>`;
  }
  
  let buttonHtml = '';
  if ('available' in item) {
    const isAvailable = item.available && item.link;
    const link = isAvailable
      ? `href="${item.link}" target="_blank"`
      : 'href="javascript:void(0);"';
    const buttonText = isAvailable ? uiData.buttonAccess : uiData.buttonComing;
    const disabledClass = isAvailable ? '' : ' disabled';
    
    buttonHtml = `<a ${link} class="${disabledClass}">${buttonText}</a>`;
  }

  return `
    <div class="module-card" id="${item.id}">
      <h3>${parseHighlightTags(item.title)}</h3>
      ${textHtml}
      ${buttonHtml}
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
    setTimeout(() => {
      card.classList.add('card-enter-active');
      setTimeout(() => {
        card.classList.remove('card-enter', 'card-enter-active');
      }, 500);
    }, 100 + (index * 100));
  });
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    renderNavbar,
    renderFooter,
    renderContactSection,
    renderCard,
    parseHighlightTags,
    animateCardsSequentially
  };
}
