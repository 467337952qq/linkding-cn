// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'setIcon') {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await chrome.action.setIcon({
        tabId: tab.id,
        path: request.icon
      });
      sendResponse({ success: true });
    } catch (error) {
      console.error('设置图标失败:', error);
      sendResponse({ success: false, error: error.message });
    }
  }
  return true; // 保持消息通道开放以支持异步响应
});