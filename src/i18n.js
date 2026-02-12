/**
 * i18n.js - 国际化语言管理模块
 * 负责语言检测、数据加载、URL 管理
 */

let currentLang = 'zh';
let langData = null;

/**
 * 检测并设置当前语言
 * @returns {string} 当前语言代码
 */
function detectLanguage() {
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get('lang');
  
  if (langParam === 'en' || langParam === 'zh') {
    currentLang = langParam;
    localStorage.setItem('preferredLang', currentLang);
    return currentLang;
  }
  
  const storedLang = localStorage.getItem('preferredLang');
  if (storedLang === 'en' || storedLang === 'zh') {
    currentLang = storedLang;
    return currentLang;
  }
  
  const browserLang = navigator.language || navigator.userLanguage;
  if (browserLang && browserLang.toLowerCase().startsWith('zh')) {
    currentLang = 'zh';
  } else {
    currentLang = 'en';
  }
  
  return currentLang;
}

/**
 * 更新 URL 语言参数
 * @param {string} lang - 语言代码
 */
function updateLangInUrl(lang) {
  const url = new URL(window.location.href);
  url.searchParams.set('lang', lang);
  window.history.replaceState({}, '', url.toString());
}

/**
 * 加载语言数据
 * @param {string} lang - 语言代码
 * @returns {Promise<Object>} 语言数据
 */
async function loadLangData(lang) {
  try {
    const response = await fetch(`data/${lang}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load ${lang}.json: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading language data:', error);
    return null;
  }
}

/**
 * 加载 HTML 模板
 * @param {string} templatePath - 模板路径
 * @returns {Promise<string>} HTML 模板
 */
async function loadTemplate(templatePath) {
  try {
    const response = await fetch(templatePath);
    if (!response.ok) {
      throw new Error(`Failed to load template: ${templatePath}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error loading template:', error);
    return '';
  }
}

/**
 * 获取当前语言
 * @returns {string} 当前语言代码
 */
function getCurrentLang() {
  return currentLang;
}

/**
 * 获取当前语言数据
 * @returns {Object} 当前语言数据
 */
function getLangData() {
  return langData;
}

/**
 * 设置语言数据
 * @param {Object} data - 语言数据
 */
function setLangData(data) {
  langData = data;
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    detectLanguage,
    updateLangInUrl,
    loadLangData,
    loadTemplate,
    getCurrentLang,
    getLangData,
    setLangData
  };
}
