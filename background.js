/**
 * 从Chrome网上应用店URL中提取扩展ID
 */
const extractExtensionId = (url) => {
  return url
    ?.split('/detail/')[1] // 移除detail前的部分
    ?.split('?')[0] // 移除参数
    ?.replace(/\/$/, '') // 移除末尾“/”
    ?.replace(/\/reviews$/, '') // 移除末尾“/reviews”
    ?.replace(/.*\//, '') // 只保留最后一个“/”后的部分
    ?.match(/^[a-zA-Z]{32}$/)?.[0]; // 校验扩展ID
};

const menuId = 'redirect-to-crx4chrome';

/**
 * 创建右键菜单项
 */
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: menuId,
    title: '跳转crx4chrome',
    contexts: ['link'],
    documentUrlPatterns: ['<all_urls>'],
    targetUrlPatterns: ['*://chrome.google.com/webstore/detail/*', '*://chromewebstore.google.com/detail/*'],
  });
});

/**
 * 处理右键菜单点击事件
 */
chrome.contextMenus.onClicked.addListener((info, _tab) => {
  if (info.menuItemId === menuId) {
    const extensionId = extractExtensionId(info.linkUrl);
    if (extensionId) {
      // 成功提取到扩展ID，进行重定向
      const redirectUrl = `https://www.crx4chrome.com/extensions/${extensionId}/`;
      // 在新标签页中打开
      chrome.tabs.create({ url: redirectUrl });
    }
  }
});
