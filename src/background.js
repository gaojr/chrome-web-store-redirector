let menus = {};
const DEFAULT_MENUS = {
  crx4chrome: { name: "跳转crx4chrome", url: "https://www.crx4chrome.com/extensions" },
  crxsosor: { name: "跳转crx搜搜", url: "https://www.crxsoso.com/webstore/detail" },
  crxdl: { name: "跳转crxdl", url: "https://crxdl.com/detail/g" },
};
const CREATE_PROPERTIES = {
  contexts: ["link"],
  documentUrlPatterns: ["<all_urls>"],
  targetUrlPatterns: [
    // 旧版
    "*://chrome.google.com/webstore/detail/*",
    // 新版
    "*://chromewebstore.google.com/detail/*",
    // 其他重定向
    "*://*/*%2Fchrome.google.com%2Fwebstore%2Fdetail%2F*",
    "*://*/*%2Fchromewebstore.google.com%2Fdetail%2F*",
  ],
};
const STORAGE_KEY = "cws-redirector";

/**
 * 从Chrome网上应用店链接中提取信息
 */
const extractUrl = (url) => {
  const cleanUrl = decodeURIComponent(url) // url转义
    ?.split("/detail")[1] // 移除detail前的部分
    ?.split("?")[0] // 移除参数
    ?.replace(/\/$/, "") // 移除末尾“/”
    ?.replace(/\/reviews$/, ""); // 移除末尾“/reviews”
  let [extensionName, extensionId] = cleanUrl?.split("/") || [];
  // 校验扩展ID
  extensionId = extensionId?.match(/^[a-zA-Z]{32}$/)?.[0];
  return { extensionName, extensionId };
};

/**
 * 创建右键菜单项
 */
chrome.runtime.onInstalled.addListener(() => {
  for (const [k, v] of Object.entries(MENUS)) {
    chrome.contextMenus.create({
      id: `${STORAGE_KEY}-${k}`,
      title: v.name,
      ...CREATE_PROPERTIES,
    });
  }
});

/**
 * 处理右键菜单点击事件
 */
chrome.contextMenus.onClicked.addListener((info, _tab) => {
  const menu = menus[info.menuItemId];
  if (menu) {
    const { extensionId } = extractUrl(info.linkUrl);
    if (extensionId) {
      // 成功提取到扩展ID，进行重定向
      const redirectUrl = `${menu.url}/${extensionId}`;
      // 在新标签页中打开
      chrome.tabs.create({ url: redirectUrl });
    }
  }
});
