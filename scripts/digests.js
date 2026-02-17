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
      } else if (line.match(/^(\w+):\s*"(.*)"$/)) {
        frontmatter[RegExp.$1] = RegExp.$2;
      }
    }
    return frontmatter;
  }

  function generateDigestsData() {
    const papersDir = path.join(__dirname, '..', 'es-digests');
    const sections = [
      { id: 'paper-guide', path: 'Paper Guide/papers', title: { zh: '论文导读', en: 'Paper Guide' } },
      { id: 'paper-express', path: 'Paper Express/papers', title: { zh: '论文速递', en: 'Paper Express' } }
    ];
    
    const zhData = JSON.parse(JSON.stringify(baseDataZh));
    const enData = JSON.parse(JSON.stringify(baseDataEn));
    
    zhData.sections = [];
    enData.sections = [];
    
    for (const section of sections) {
      const papersPath = path.join(papersDir, section.path);
      
      if (!fs.existsSync(papersPath)) {
        console.log(`Directory not found: ${papersPath}`);
        continue;
      }
      
      const paperFolders = fs.readdirSync(papersPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      const items = [];
      
      for (const folderName of paperFolders) {
        const folderPath = path.join(papersPath, folderName);
        const mdFile = `${folderName}.md`;
        const mdPath = path.join(folderPath, mdFile);
        
        if (fs.existsSync(mdPath)) {
          const content = fs.readFileSync(mdPath, 'utf-8');
          const fm = parseFrontmatter(content);
          items.push({
            title: fm.title || folderName,
            date: fm.date || '1970-01-01',
            digestPubTime: fm.digest_pub_time || '1970-01-01',
            editor_note: fm.editor_note || [],
            authors: fm.authors || [],
            tags: fm.tags || [],
            venue: fm.venue || '',
            pdfUrl: fm.pdf_url || '',
            sourcePath: `${section.path}/${folderName}/${mdFile}`
          });
        }
      }
      
      items.sort((a, b) => new Date(b.digestPubTime) - new Date(a.digestPubTime));
      
      items.forEach((item, index) => {
        item.number = items.length - index;
      });
      
      const zhItems = items.map(item => ({
        number: item.number,
        title: `${section.title.zh} ${item.number} - ${item.title}`,
        description: item.editor_note.join('\n'),
        date: item.date,
        digestPubTime: item.digestPubTime,
        authors: item.authors,
        tags: item.tags,
        venue: item.venue,
        pdfUrl: item.pdfUrl,
        sourcePath: item.sourcePath
      }));
      
      const enItems = items.map(item => ({
        number: item.number,
        title: `${section.title.en} ${item.number} - ${item.title}`,
        description: item.editor_note.join('\n'),
        date: item.date,
        digestPubTime: item.digestPubTime,
        authors: item.authors,
        tags: item.tags,
        venue: item.venue,
        pdfUrl: item.pdfUrl,
        sourcePath: item.sourcePath
      }));
      
      zhData.sections.push({ type: 'digests', id: section.id, title: section.title.zh, items: zhItems });
      enData.sections.push({ type: 'digests', id: section.id, title: section.title.en, items: enItems });
    }
    
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
      this.data = null;
      this.expanded = {};
      this.initialShowCount = 3;
      this.activeTabId = null;
    }

    setData(data) {
      this.data = data;
      this.render();
    }

    render() {
      if (!this.data) return;

      const ui = I18n.getPage('ui') || {};
      const sections = I18n.getPage('sections') || [];
      const digestsSections = sections.filter(section => section.type === 'digests');

      if (digestsSections.length === 0) {
        this.innerHTML = `<p class="digests-empty">暂无内容</p>`;
        return;
      }

      // 设置默认激活的 tab
      this.activeTabId = this.activeTabId || digestsSections[0].id;

      let html = `
        <div class="digests-tab-container">
          <div class="digests-tabs">
      `;

      // 生成 tab 按钮
      digestsSections.forEach(section => {
        const isActive = section.id === this.activeTabId;
        html += `
          <button class="digests-tab-btn ${isActive ? 'active' : ''}" data-tab="${section.id}">
            ${section.title}
          </button>
        `;
      });

      html += `
          </div>
          <div class="digests-tab-panels">
      `;

      // 生成 tab 面板
      digestsSections.forEach(section => {
        const isActive = section.id === this.activeTabId;
        const { id, title, items } = section;
        const hasMoreItems = items && items.length > this.initialShowCount;
        const showMoreText = ui.showMore || '展开更多';
        const showLessText = ui.showLess || '收起';
        const isExpanded = this.expanded[id] || false;

        html += `
          <div class="digests-tab-panel ${isActive ? 'active' : ''}" data-panel="${id}">
            <h2 class="section-title">${title}</h2>
        `;

        if (items && items.length > 0) {
          html += `<div class="digests-list">`;
          items.forEach((item, index) => {
            const hidden = index >= this.initialShowCount && !isExpanded;
            html += `<es-digests-card id="digest-${id}-${index}" class="${hidden ? 'hidden' : ''}"></es-digests-card>`;
          });
          html += `</div>`;

          if (hasMoreItems) {
            html += `
              <button class="digests-show-more-btn" data-expanded="${isExpanded}" data-section="${id}">
                <span class="btn-text">${isExpanded ? showLessText : showMoreText}</span>
                <span class="btn-icon">▼</span>
              </button>
            `;
          }
        } else {
          html += `<p class="digests-empty">暂无内容</p>`;
        }

        html += `</div>`;
      });

      html += `
          </div>
        </div>
      `;

      this.innerHTML = html;

      // 设置卡片数据
      digestsSections.forEach(section => {
        section.items.forEach((item, index) => {
          const card = this.querySelector(`#digest-${section.id}-${index}`);
          if (card) card.setData(item);
        });
      });

      this.bindEvents();
    }

    bindEvents() {
      // Tab 切换事件
      const tabBtns = this.querySelectorAll('.digests-tab-btn');
      tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const tabId = btn.dataset.tab;
          this.switchTab(tabId);
        });
      });

      // 展开/收起事件
      const showMoreBtns = this.querySelectorAll('.digests-show-more-btn');
      showMoreBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const sectionId = btn.dataset.section;
          this.toggleShowMore(sectionId);
        });
      });
    }

    switchTab(tabId) {
      this.activeTabId = tabId;
      this.render();
    }

    toggleShowMore(sectionId) {
      this.expanded[sectionId] = !this.expanded[sectionId];
      this.render();
    }
  }

  // 定义 Web Component
  customElements.define('es-digests-section', ESDigestsSection);
  console.log('es-digests-section defined');
}
