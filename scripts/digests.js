// digests.js - 合并了 generate-digests.js 和 es-digests-section.js

// 检查是否在 Node.js 环境中
if (typeof process !== 'undefined' && process.versions != null && process.versions.node != null) {
  // Node.js 环境 - 用于生成 digests 数据
  const fs = require('fs');
  const path = require('path');

  const baseDataZh = {
    pageTitle: "文摘 - 远行工作室 测试版",
    hero: {
      title: "远行工作室 - 文摘系列",
      description: "敬请期待远行工作室即将推出的<strong>《论文导读》</strong>和<strong>《论文速递》</strong>系列栏目！"
    },
    teaser: {
      title: "精彩预告",
      description: "我们正在准备更多精彩内容，包括更多论文导读和速递，敬请期待！",
      expectedLaunch: "2026 年 3 月",
      features: [
        "更多高质量论文解读",
        "前沿研究快速上手",
        "专家深度点评"
      ],
      updatedLabel: "更新于",
      enabled: true
    },
    ui: {
      showMore: "展开更多",
      showLess: "收起",
      readMore: "阅读全文",
      publishedOn: "发布于"
    }
  };

  const baseDataEn = {
    pageTitle: "Digests - Excursion Studio BETA",
    hero: {
      title: "Excursion Studio - Digests",
      description: "Stay tuned for Excursion Studio's upcoming <strong>Paper Guide</strong> and <strong>Paper Express</strong> series columns!"
    },
    teaser: {
      title: "Coming Soon",
      description: "We are preparing more exciting content, including more paper guides and express, stay tuned!",
      expectedLaunch: "March 2026",
      features: [
        "More high-quality paper interpretations",
        "Quick access to cutting-edge research",
        "Expert in-depth commentary"
      ],
      updatedLabel: "Updated on",
      enabled: true
    },
    ui: {
      showMore: "Show More",
      showLess: "Show Less",
      readMore: "Read More",
      publishedOn: "Published on"
    }
  };

  function parseFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return {};
    
    const frontmatter = {};
    const lines = match[1].split('\n');
    let currentKey = null;
    let isArray = false;
    let arrayContent = [];
    
    for (const line of lines) {
      // 单行数组格式: key: ["value1", "value2"]
      if (line.match(/^(\w+):\s*\["(.*)"\s*\]$/)) {
        const key = RegExp.$1;
        const valuesStr = RegExp.$2;
        const values = valuesStr.split('", "').map(v => v.trim()).filter(v => v);
        frontmatter[key] = values;
        isArray = false;
        currentKey = null;
      } else if (line.match(/^(\w+):\s*\[$/)) {
        currentKey = RegExp.$1;
        isArray = true;
        arrayContent = [];
      } else if (isArray && line === ']') {
        frontmatter[currentKey] = arrayContent;
        isArray = false;
        currentKey = null;
      } else if (isArray && line.match(/^\s*"(.*)"\s*,?\s*$/)) {
        arrayContent.push(RegExp.$1);
      } else if (line.match(/^(\w+):\s*$/)) {
        currentKey = RegExp.$1;
        isArray = true;
        arrayContent = [];
      } else if (line.match(/^\s+-\s+"?(.+?)"?\s*$/)) {
        if (isArray && currentKey) {
          arrayContent.push(RegExp.$1);
        }
      } else if (line.match(/^(\w+):\s*"(.*)"$/)) {
        if (isArray && currentKey && arrayContent.length > 0) {
          frontmatter[currentKey] = arrayContent;
        }
        isArray = false;
        currentKey = null;
        frontmatter[RegExp.$1] = RegExp.$2;
      } else if (line.match(/^(\w+):\s*(.+)$/)) {
        if (isArray && currentKey && arrayContent.length > 0) {
          frontmatter[currentKey] = arrayContent;
        }
        isArray = false;
        currentKey = null;
        frontmatter[RegExp.$1] = RegExp.$2;
      }
    }
    
    if (isArray && currentKey && arrayContent.length > 0) {
      frontmatter[currentKey] = arrayContent;
    }
    
    return frontmatter;
  }

  function generateDigestsData() {
    const papersDir = path.join(__dirname, '..', 'es-digests');
    const sections = [
      { id: 'paper-guide', path: 'paper-guide/papers', title: { zh: '论文导读', en: 'Paper Guide' } },
      { id: 'paper-express', path: 'paper-express/papers', title: { zh: '论文速递', en: 'Paper Express' } }
    ];
    
    const zhData = JSON.parse(JSON.stringify(baseDataZh));
    const enData = JSON.parse(JSON.stringify(baseDataEn));
    
    const allZhItems = [];
    const allEnItems = [];
    
    // 收集所有 items 并添加分类信息
    for (const section of sections) {
      const papersPath = path.join(papersDir, section.path);
      
      if (!fs.existsSync(papersPath)) {
        console.log(`Directory not found: ${papersPath}`);
        continue;
      }
      
      const paperFolders = fs.readdirSync(papersPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      for (const folderName of paperFolders) {
        const folderPath = path.join(papersPath, folderName);
        const mdFile = `${folderName}.md`;
        const mdPath = path.join(folderPath, mdFile);
        
        if (fs.existsSync(mdPath)) {
          const content = fs.readFileSync(mdPath, 'utf-8');
          const fm = parseFrontmatter(content);
          
          // 添加分类信息
          const zhItem = {
            category: section.id,
            categoryName: section.title.zh,
            title: fm.title || folderName,
            date: fm.date || '1970-01-01',
            digestPubTime: fm.digest_pub_time || '1970-01-01',
            editor_note: fm.editor_note || [],
            authors: fm.authors || [],
            tags: fm.tags || [],
            venue: fm.venue || '',
            pdfUrl: fm.pdf_url || '',
            sourcePath: `${section.path}/${folderName}/${mdFile}`
          };
          
          const enItem = {
            category: section.id,
            categoryName: section.title.en,
            title: fm.title || folderName,
            date: fm.date || '1970-01-01',
            digestPubTime: fm.digest_pub_time || '1970-01-01',
            editor_note: fm.editor_note || [],
            authors: fm.authors || [],
            tags: fm.tags || [],
            venue: fm.venue || '',
            pdfUrl: fm.pdf_url || '',
            sourcePath: `${section.path}/${folderName}/${mdFile}`
          };
          
          allZhItems.push(zhItem);
          allEnItems.push(enItem);
        }
      }
    }
    
    // 按 digestPubTime 降序排序
    allZhItems.sort((a, b) => new Date(b.digestPubTime) - new Date(a.digestPubTime));
    allEnItems.sort((a, b) => new Date(b.digestPubTime) - new Date(a.digestPubTime));
    
    // 为每个分类独立计算 number
    const categoryCountsZh = {};
    const categoryCountsEn = {};
    
    sections.forEach(section => {
      categoryCountsZh[section.id] = 0;
      categoryCountsEn[section.id] = 0;
    });
    
    // 计算每个分类的 items 数量
    allZhItems.forEach(item => {
      categoryCountsZh[item.category]++;
    });
    
    allEnItems.forEach(item => {
      categoryCountsEn[item.category]++;
    });
    
    // 为每个 item 分配 number（按分类独立编号）
    const categoryCurrentNumbersZh = {};
    const categoryCurrentNumbersEn = {};
    
    sections.forEach(section => {
      categoryCurrentNumbersZh[section.id] = categoryCountsZh[section.id];
      categoryCurrentNumbersEn[section.id] = categoryCountsEn[section.id];
    });
    
    // 按时间顺序分配 number（最新的 number 最大）
    allZhItems.forEach(item => {
      item.number = categoryCurrentNumbersZh[item.category];
      categoryCurrentNumbersZh[item.category]--;
    });
    
    allEnItems.forEach(item => {
      item.number = categoryCurrentNumbersEn[item.category];
      categoryCurrentNumbersEn[item.category]--;
    });
    
    // 构建最终的 items 列表
    const finalZhItems = allZhItems.map(item => {
      const editorNote = Array.isArray(item.editor_note) && item.editor_note.length > 0 
        ? item.editor_note[0] 
        : '';
      return {
        category: item.category,
        categoryName: item.categoryName,
        number: item.number,
        title: `${item.categoryName} ${item.number} - ${item.title}`,
        description: editorNote,
        date: item.date,
        digestPubTime: item.digestPubTime,
        authors: Array.isArray(item.authors) ? item.authors : [],
        tags: Array.isArray(item.tags) ? item.tags : [],
        venue: item.venue || '',
        pdfUrl: item.pdfUrl || '',
        sourcePath: item.sourcePath
      };
    });
    
    const finalEnItems = allEnItems.map(item => {
      const editorNote = Array.isArray(item.editor_note) && item.editor_note.length > 0 
        ? item.editor_note[0] 
        : '';
      return {
        category: item.category,
        categoryName: item.categoryName,
        number: item.number,
        title: `${item.categoryName} ${item.number} - ${item.title}`,
        description: editorNote,
        date: item.date,
        digestPubTime: item.digestPubTime,
        authors: Array.isArray(item.authors) ? item.authors : [],
        tags: Array.isArray(item.tags) ? item.tags : [],
        venue: item.venue || '',
        pdfUrl: item.pdfUrl || '',
        sourcePath: item.sourcePath
      };
    });
    
    // 创建单一的 sections
    zhData.sections = [{ type: 'digests', id: 'all-digests', title: '全部文摘', items: finalZhItems }];
    enData.sections = [{ type: 'digests', id: 'all-digests', title: 'All Digests', items: finalEnItems }];
    
    fs.writeFileSync(path.join(__dirname, '..', 'data', 'zh', 'digests.json'), JSON.stringify(zhData, null, 2));
    fs.writeFileSync(path.join(__dirname, '..', 'data', 'en', 'digests.json'), JSON.stringify(enData, null, 2));
    
    console.log('Digests JSON generated successfully!');
  }

  // 执行生成数据的函数
  generateDigestsData();
} else {
  // 浏览器环境 - 用于显示 digests 内容
  class ESDigestsSection extends HTMLElement {
    constructor() {
      super();
      this.expanded = false;
      this.initialShowCount = 3;
    }

    connectedCallback() {
      // 当元素插入到 DOM 中时自动调用 render
      this.render();
    }

    setData(data) {
      // 兼容旧的调用方式，实际数据从 I18n 获取
      this.render();
    }

    render() {
      const ui = I18n.getDigests('ui') || {};
      const sections = I18n.getDigests('sections') || [];
      const digestsSections = sections.filter(section => section.type === 'digests');

      if (digestsSections.length === 0) {
        this.innerHTML = `<p class="digests-empty">暂无内容</p>`;
        return;
      }

      // 获取所有 items
      const allItems = digestsSections.flatMap(section => section.items || []);
      const sectionTitle = digestsSections[0].title || '';

      if (allItems.length === 0) {
        this.innerHTML = `<p class="digests-empty">暂无内容</p>`;
        return;
      }

      const hasMoreItems = allItems.length > this.initialShowCount;
      const showMoreText = ui.showMore || '展开更多';
      const showLessText = ui.showLess || '收起';

      let html = `
        <div class="digests-section">
          ${sectionTitle ? `<h2 class="section-title">${sectionTitle}</h2>` : ''}
          <div class="digests-list">
      `;

      allItems.forEach((item, index) => {
        const hidden = index >= this.initialShowCount && !this.expanded;
        // 第一个卡片使用 ESLatestDigestsCard，其余使用 ESDigestsCard
        if (index === 0) {
          html += `<es-latest-digests-card id="digest-${index}" class="${hidden ? 'hidden' : ''}"></es-latest-digests-card>`;
        } else {
          html += `<es-digests-card id="digest-${index}" class="${hidden ? 'hidden' : ''}"></es-digests-card>`;
        }
      });

      html += `
          </div>
      `;

      if (hasMoreItems) {
        html += `
          <button class="digests-show-more-btn" data-expanded="${this.expanded}">
            <span class="btn-text">${this.expanded ? showLessText : showMoreText}</span>
            <span class="btn-icon">▼</span>
          </button>
        `;
      }

      html += `
        </div>
      `;

      this.innerHTML = html;

      // 设置卡片数据
      allItems.forEach((item, index) => {
        const card = this.querySelector(`#digest-${index}`);
        if (card) card.setData(item);
      });

      this.bindEvents();

      // 触发动画
      if (window.App && typeof window.App.animateLatestDigestCards === 'function') {
        window.App.animateLatestDigestCards();
      }
    }

    bindEvents() {
      const showMoreBtn = this.querySelector('.digests-show-more-btn');
      if (showMoreBtn) {
        showMoreBtn.addEventListener('click', () => this.toggleShowMore());
      }
    }

    toggleShowMore() {
      this.expanded = !this.expanded;
      
      const cards = this.querySelectorAll('es-digests-card, es-latest-digests-card');
      cards.forEach((card, index) => {
        if (index >= this.initialShowCount) {
          card.classList.toggle('hidden', !this.expanded);
        }
      });
      
      const btn = this.querySelector('.digests-show-more-btn');
      if (btn) {
        const btnText = btn.querySelector('.btn-text');
        const showMoreText = I18n.getDigests('ui.showMore') || '展开更多';
        const showLessText = I18n.getDigests('ui.showLess') || '收起';
        btnText.textContent = this.expanded ? showLessText : showMoreText;
        btn.dataset.expanded = this.expanded;
      }
    }
  }

  // 最新文摘卡片组件 - 与 ESDigestsCard 内容一致，仅样式不同
  class ESLatestDigestsCard extends HTMLElement {
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

      let categoryPath = '';
      if (category === 'paper-guide') {
        categoryPath = 'paper-guide';
      } else if (category === 'paper-express') {
        categoryPath = 'paper-express';
      }
      
      const paperName = sourcePath.split('/').slice(-2)[0];
      const url = `https://excursion-studio.github.io/ES-digests/${categoryPath}/index.html?paper=${paperName}`;

      let html = `
        <div class="digest-card latest">
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

  // 预告版块组件
  class ESTeaserSection extends HTMLElement {
    connectedCallback() {
      this.render();
    }

    render() {
      const teaser = I18n.getDigests('teaser');
      
      if (!teaser || !teaser.enabled) {
        this.innerHTML = '';
        return;
      }

      const { title, description, expectedLaunch, features, updatedLabel } = teaser;

      let html = `
        <div class="teaser-section">
          <div class="teaser-card">
            <div class="teaser-header">
              <h2 class="teaser-title">${title || ''}</h2>
            </div>
            <p class="teaser-description">${description || ''}</p>
            ${features && features.length > 0 ? `
              <ul class="teaser-features-list">
                ${features.map(feature => `<li>- ${feature}</li>`).join('')}
              </ul>
            ` : ''}
            <div class="teaser-footer">
              <span class="teaser-launch-time">${expectedLaunch ? `${updatedLabel || '更新于'} ${expectedLaunch}` : ''}</span>
            </div>
          </div>
        </div>
      `;

      this.innerHTML = html;
    }
  }

  // 定义 Web Component
  customElements.define('es-teaser-section', ESTeaserSection);
  customElements.define('es-digests-section', ESDigestsSection);
  customElements.define('es-latest-digests-card', ESLatestDigestsCard);
  console.log('es-teaser-section, es-digests-section and es-latest-digests-card defined');
  
  // 导出重新渲染函数供外部调用
  window.renderDigestsComponents = function() {
    setTimeout(() => {
      const teaserSections = document.querySelectorAll('es-teaser-section');
      teaserSections.forEach(section => {
        section.render();
      });
      
      const digestSections = document.querySelectorAll('es-digests-section');
      digestSections.forEach(section => {
        section.render();
      });
    }, 50);
  };
  
  // 监听 I18n 初始化完成事件
  if (window.I18n) {
    window.renderDigestsComponents();
  }
  
  // 监听 App 初始化完成事件
  if (window.App && window.App.init) {
    const originalInit = window.App.init;
    window.App.init = async function(...args) {
      const result = await originalInit.apply(this, args);
      window.renderDigestsComponents();
      return result;
    };
  }
}
