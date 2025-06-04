// 全局变量
let currentUrl = '';
let currentTitle = '';

// 获取当前标签页信息
function getCurrentTab() {
  chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
    currentUrl = tabs[0].url;
    currentTitle = tabs[0].title;
    document.getElementById('url').value = currentUrl;

    // 检查是否启用了书签对比
    const config = await getConfig();
    if (config.enableBookmarkComparison) {
      const existingBookmark = await findExistingBookmark(currentUrl, config);
      if (existingBookmark) {
        syncBookmarkToForm(existingBookmark);
        // 移除这行提示信息
        // showMessage('已找到相同网址的书签，已自动同步信息', 'success');
      } else {
        document.getElementById('title').value = currentTitle;
        // 获取页面描述
        try {
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => {
              // 尝试获取 meta description
              const metaDesc = document.querySelector('meta[name="description"]')?.content || '';
              // 如果没有 meta description，获取第一段文本
              const firstParagraph = metaDesc || document.querySelector('p')?.textContent || '';
              return firstParagraph.trim().substring(0, 500); // 限制长度
            }
          });
          if (results && results[0]?.result) {
            document.getElementById('descInput').value = results[0].result;
          }
        } catch (error) {
          console.error('获取描述失败:', error);
        }
      }
    } else {
      document.getElementById('title').value = currentTitle;
      // 获取页面描述
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: () => {
            // 尝试获取 meta description
            const metaDesc = document.querySelector('meta[name="description"]')?.content || '';
            // 如果没有 meta description，获取第一段文本
            const firstParagraph = metaDesc || document.querySelector('p')?.textContent || '';
            return firstParagraph.trim().substring(0, 500); // 限制长度
          }
        });
        if (results && results[0]?.result) {
          document.getElementById('descInput').value = results[0].result;
        }
      } catch (error) {
        console.error('获取描述失败:', error);
      }
    }
  });
}

// 初始化函数
async function init() {
  // 获取当前标签页信息
  getCurrentTab();

  // 获取并应用默认设置
  const config = await getConfig();
  if (config.defaultUnread) {
    document.querySelector('input[name="readStatus"][value="unread"]').checked = true;
  } else {
    document.querySelector('input[name="readStatus"][value="read"]').checked = true;
  }
  document.querySelector('input[name="shared"]').checked = config.defaultShared;

  // 如果没有开启书签对比，则应用默认标签
  if (!config.enableBookmarkComparison && config.defaultTags) {
    document.getElementById('tags').value = config.defaultTags;
  }

  // 绑定导航事件
  document.getElementById('openSite').addEventListener('click', openSite);
  document.getElementById('settings').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // 绑定选项卡切换事件
  const tabSwitch = document.querySelector('.tab-switch');
  tabSwitch.addEventListener('click', handleTabSwitch);

  // 绑定表单提交事件
  document.getElementById('bookmarkForm').addEventListener('submit', saveBookmark);
}

// 打开网站
async function openSite() {
  const config = await getConfig();
  if (config.baseUrl) {
    chrome.tabs.create({ url: config.baseUrl });
  } else {
    showMessage('请先在设置中配置服务器地址', 'error');
  }
}

// 获取配置
// 获取配置
async function getConfig() {
  return new Promise((resolve) => {
    chrome.storage.sync.get({
      baseUrl: '',
      apiToken: '',
      defaultTags: '',
      defaultUnread: true,
      defaultShared: false,
      enableBookmarkComparison: false
    }, (items) => {
      resolve(items);
    });
  });
}

// 查找现有书签
async function findExistingBookmark(url, config) {
  try {
    const response = await fetch(`${config.baseUrl}/api/bookmarks/?q=${encodeURIComponent(url)}`, {
      headers: {
        'Authorization': `Token ${config.apiToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP错误 ${response.status}`);
    }

    const data = await response.json();
    // 精确匹配 URL
    const existingBookmark = data.results.find(bookmark => bookmark.url === url);
    
    // 根据是否存在书签来设置图标
    if (existingBookmark) {
      try {
        await new Promise((resolve, reject) => {
          chrome.runtime.sendMessage({
            action: 'setIcon',
            icon: {
              "19": "icons/button_19x19_star.png",
              "38": "icons/button_38x38_star.png"
            }
          }, response => {
            if (response && response.success) {
              resolve();
            } else {
              reject(new Error(response?.error || '设置图标失败'));
            }
          });
        });
      } catch (error) {
        console.error('设置星标图标失败:', error);
      }
    } else {
      try {
        await new Promise((resolve, reject) => {
          chrome.runtime.sendMessage({
            action: 'setIcon',
            icon: {
              "19": "icons/button_19x19.png",
              "38": "icons/button_38x38.png"
            }
          }, response => {
            if (response && response.success) {
              resolve();
            } else {
              reject(new Error(response?.error || '设置图标失败'));
            }
          });
        });
      } catch (error) {
        console.error('设置默认图标失败:', error);
      }
    }
    
    return existingBookmark;
  } catch (error) {
    console.error('查找书签失败:', error);
    // 发生错误时恢复默认图标
    await chrome.action.setIcon({
      path: {
        "19": "icons/button_19x19.png",
        "38": "icons/button_38x38.png"
      }
    });
    return null;
  }
}

// 同步书签信息到表单
// 同步书签信息到表单
function syncBookmarkToForm(bookmark) {
  document.getElementById('title').value = bookmark.title;
  document.getElementById('descInput').value = bookmark.description || '';
  document.getElementById('noteInput').value = bookmark.notes || '';
  
  // 如果有笔记内容，在笔记按钮旁显示"有笔记"提示
  const noteTab = document.querySelector('.tab[data-type="note"]');
  if (bookmark.notes) {
      const hasNoteSpan = document.createElement('span');
      hasNoteSpan.textContent = ' (有笔记)';
      hasNoteSpan.style.color = '#1a73e8';
      noteTab.textContent = '笔记';
      noteTab.appendChild(hasNoteSpan);
  } else {
      noteTab.textContent = '笔记';
  }
  
  document.getElementById('tags').value = bookmark.tag_names.join(' '); // 使用空格分隔标签
  document.querySelector('input[name="readStatus"][value="' + (bookmark.unread ? 'unread' : 'read') + '"]').checked = true;
  document.querySelector('input[name="shared"]').checked = bookmark.shared;
  
  // 显示 URL 已存在的提示信息
  document.getElementById('urlTip').style.display = 'block';
}

// 显示消息
function showMessage(message, type = 'success') {
  const messageEl = document.createElement('div');
  messageEl.textContent = message;
  messageEl.className = type;
  document.body.insertBefore(messageEl, document.body.firstChild);
  setTimeout(() => messageEl.remove(), 3000);
}

// 处理选项卡切换
function handleTabSwitch(event) {
  const button = event.target;
  if (!button.matches('.tab')) return;

  // 更新按钮状态
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => tab.classList.remove('active'));
  button.classList.add('active');

  // 更新内容区域
  const type = button.dataset.type;
  const contents = document.querySelectorAll('.content');
  contents.forEach(content => content.classList.remove('active'));
  document.getElementById(type).classList.add('active');

  // 聚焦到文本框
  document.getElementById(type + 'Input').focus();
}

// 保存书签
async function saveBookmark(e) {
  e.preventDefault();
  
  const config = await getConfig();
  if (!config.baseUrl || !config.apiToken) {
    showMessage('请先在设置中配置Base URL和API Token', 'error');
    return;
  }
  
  // 确保 baseUrl 没有结尾的斜杠
  const baseUrl = config.baseUrl.replace(/\/$/, '');
  
  const data = {
    url: document.getElementById('url').value,
    title: document.getElementById('title').value,
    description: document.getElementById('descInput').value,
    notes: document.getElementById('noteInput').value,
    tag_names: document.getElementById('tags').value
      .split(/[,\s]/) // 同时支持逗号和空格分隔
      .map(tag => tag.trim()) // 清理每个标签的首尾空白
      .filter(tag => tag), // 移除空标签
    unread: document.querySelector('input[name="readStatus"]:checked').value === 'unread',
    shared: document.querySelector('input[name="shared"]').checked
  };
  
  try {
    const response = await fetch(`${baseUrl}/api/bookmarks/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${config.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || `HTTP错误 ${response.status}`;
      } catch (e) {
        errorMessage = `服务器错误 (${response.status})`;
      }
      throw new Error(errorMessage);
    }
    
    showMessage('书签保存成功！');
    setTimeout(() => window.close(), 1000);
  } catch (error) {
    console.error('保存失败:', error);
    showMessage(`保存失败：${error.message}`, 'error');
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);