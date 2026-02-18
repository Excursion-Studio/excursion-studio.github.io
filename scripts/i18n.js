console.log('i18n.js loading...');

class I18n {
  constructor() {
    console.log('I18n constructor called');
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

    console.log('Loading data from:', commonPath, pagePath, digestsPath);

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

console.log('I18n class defined, creating instance...');
window.I18n = new I18n();
console.log('I18n instance created:', window.I18n);
console.log('I18n.init:', window.I18n.init);
