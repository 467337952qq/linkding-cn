// 保存选项到Chrome存储
function saveOptions(e) {
  e.preventDefault();
  chrome.storage.sync.set({
    baseUrl: document.getElementById('baseUrl').value.replace(/\/$/, ''),
    apiToken: document.getElementById('apiToken').value,
    defaultTags: document.getElementById('defaultTags').value,
    defaultUnread: document.getElementById('defaultUnread').checked,
    defaultShared: document.getElementById('defaultShared').checked,
    enableBookmarkComparison: document.getElementById('enableBookmarkComparison').checked
  }, function() {
    // 获取或创建提示信息元素
    let message = document.querySelector('.success-message');
    if (!message) {
      message = document.createElement('span');
      message.className = 'success-message';
      message.textContent = '您的配置已保存';
      
      // 创建按钮容器
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'button-container';
      
      // 获取保存按钮
      const submitButton = document.querySelector('button[type="submit"]');
      
      // 将按钮和提示信息放入容器
      submitButton.parentNode.insertBefore(buttonContainer, submitButton);
      buttonContainer.appendChild(submitButton);
      buttonContainer.appendChild(message);
    }
    
    // 显示提示信息
    message.classList.add('show');
    
    // 3秒后隐藏
    setTimeout(() => {
      message.classList.remove('show');
    }, 3000);
  });
}

// 加载已保存的选项
function restoreOptions() {
  chrome.storage.sync.get({
    baseUrl: '',
    apiToken: '',
    defaultTags: '',
    defaultUnread: true,
    defaultShared: false,
    enableBookmarkComparison: false
  }, function(items) {
    document.getElementById('baseUrl').value = items.baseUrl;
    document.getElementById('apiToken').value = items.apiToken;
    document.getElementById('defaultTags').value = items.defaultTags;
    document.getElementById('defaultUnread').checked = items.defaultUnread;
    document.getElementById('defaultShared').checked = items.defaultShared;
    document.getElementById('enableBookmarkComparison').checked = items.enableBookmarkComparison;
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('optionsForm').addEventListener('submit', saveOptions);