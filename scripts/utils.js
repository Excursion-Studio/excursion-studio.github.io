console.log('utils.js loading...');

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

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

console.log('Utils defined:', Utils);
window.Utils = Utils;
