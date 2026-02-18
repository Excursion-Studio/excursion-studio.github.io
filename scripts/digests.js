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
    ui: {
      showMore: "展开更多",
      showLess: "收起",
      readMore: "阅读全文"
    }
  };

  const baseDataEn = {
    pageTitle: "Digests - Excursion Studio BETA",
    hero: {
      title: "Excursion Studio - Digests",
      description: "Stay tuned for Excursion Studio's upcoming <strong>Paper Guide</strong> and <strong>Paper Express</strong> series columns!"
    },
    ui: {
      showMore: "Show More",
      showLess: "Show Less",
      readMore: "Read More"
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
      if (line.match(/^(\w+):\s*\[$/)) {
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
    const finalZhItems = allZhItems.map(item => ({
      category: item.category,
      categoryName: item.categoryName,
      number: item.number,
      title: `${item.categoryName} ${item.number} - ${item.title}`,
      description: item.editor_note.join('\n'),
      date: item.date,
      digestPubTime: item.digestPubTime,
      authors: item.authors,
      tags: item.tags,
      venue: item.venue,
      pdfUrl: item.pdfUrl,
      sourcePath: item.sourcePath
    }));
    
    const finalEnItems = allEnItems.map(item => ({
      category: item.category,
      categoryName: item.categoryName,
      number: item.number,
      title: `${item.categoryName} ${item.number} - ${item.title}`,
      description: item.editor_note.join('\n'),
      date: item.date,
      digestPubTime: item.digestPubTime,
      authors: item.authors,
      tags: item.tags,
      venue: item.venue,
      pdfUrl: item.pdfUrl,
      sourcePath: item.sourcePath
    }));
    
    // 创建单一的 sections
    zhData.sections = [{ type: 'digests', id: 'all-digests', items: finalZhItems }];
    enData.sections = [{ type: 'digests', id: 'all-digests', items: finalEnItems }];
    
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

      if (allItems.length === 0) {
        this.innerHTML = `<p class="digests-empty">暂无内容</p>`;
        return;
      }

      const hasMoreItems = allItems.length > this.initialShowCount;
      const showMoreText = ui.showMore || '展开更多';
      const showLessText = ui.showLess || '收起';

      let html = `
        <div class="digests-section">
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
    }

    bindEvents() {
      const showMoreBtn = this.querySelector('.digests-show-more-btn');
      if (showMoreBtn) {
        showMoreBtn.addEventListener('click', () => this.toggleShowMore());
      }
    }

    toggleShowMore() {
      this.expanded = !this.expanded;
      this.render();
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

      html += `<a href="${url}" class="digest-link" target="_blank">${I18n.getDigests('ui.readMore') || '阅读全文'}</a>`;

      html += `
          </div>
        </div>
      `;

      this.innerHTML = html;
    }
  }

  // 定义 Web Component
  customElements.define('es-digests-section', ESDigestsSection);
  customElements.define('es-latest-digests-card', ESLatestDigestsCard);
  console.log('es-digests-section and es-latest-digests-card defined');
  
  // 监听 I18n 初始化完成事件
  if (window.I18n) {
    // 如果 I18n 已经存在，重新渲染所有 ESDigestsSection 组件
    setTimeout(() => {
      const sections = document.querySelectorAll('es-digests-section');
      sections.forEach(section => {
        section.render();
      });
    }, 100);
  }
}
