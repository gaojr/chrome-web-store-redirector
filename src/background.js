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

let menus = {};

/**
 * 重建右键菜单
 */
const rebuildContextMenus = async () => {
  await chrome.contextMenus.removeAll();
  for (const [k, v] of Object.entries(menus)) {
    chrome.contextMenus.create({
      id: `${STORAGE_KEY}-${k}`,
      title: v.name,
      ...CREATE_PROPERTIES,
    });
  }
};

/**
 * 读取 storage
 */
const getStorage = async () => {
  let cache = await chrome.storage.local.get(STORAGE_KEY);
  menus = cache[STORAGE_KEY];
};

/**
 * 写入 storage
 */
const setStorage = async () => {
  await chrome.storage.local.set({ [STORAGE_KEY]: menus });
};

/**
 * 加载菜单
 */
const loadMenus = async () => {
  await getStorage();
  rebuildContextMenus();
};

/**
 * 保存菜单
 */
const saveMenus = async (newMenus = {}) => {
  menus = newMenus;
  await setStorage();
  rebuildContextMenus();
};

/**
 * 从链接中提取信息
 */
const extractUrl = (url) => {
  const cleanUrl = decodeURIComponent(url) // url转义
    ?.split("detail/")[1] // 移除detail前的部分
    ?.split("?")[0] // 移除参数
    ?.replace(/\/$/, "") // 移除末尾“/”
    ?.replace(/\/reviews$/, ""); // 移除末尾“/reviews”
  let extensionId = cleanUrl?.split("/").filter(Boolean).pop();
  // 校验扩展ID
  extensionId = extensionId?.match(/^[a-zA-Z]{32}$/)?.[0];
  return { extensionId };
};

/**
 * 消息监听器
 */
const msgListener = async (msg) => {
  let result = {};
  try {
    if (msg?.action === "loadMenus") {
      await loadMenus();
    } else if (msg?.action === "resetMenus") {
      await saveMenus(DEFAULT_MENUS);
    } else if (msg?.action === "saveMenus") {
      await saveMenus(msg.menus);
    }
  } catch (error) {
    result.msg = error;
  }
  result.data = menus;
  return result;
};

/**
 * 注册监听器：处理消息
 */
chrome.runtime.onMessage.addListener((message, _sender, response) => {
  msgListener(message).then((result) => {
    response(result);
  });
  return true;
});

/**
 * 注册监听器：浏览器启动
 */
chrome.runtime.onStartup.addListener(() => {
  loadMenus();
});

/**
 * 注册监听器：扩展安装、更新
 */
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") {
    saveMenus(DEFAULT_MENUS);
  }
  loadMenus();
});

/**
 * 注册监听器：右键菜单点击
 */
chrome.contextMenus.onClicked.addListener((info, _tab) => {
  const menu = menus[info.menuItemId.replace(`${STORAGE_KEY}-`, "")];
  const { extensionId } = extractUrl(info.linkUrl);
  if (extensionId) {
    // 成功提取到扩展ID，进行重定向
    const redirectUrl = `${menu.url}/${extensionId}`;
    // 在新标签页中打开
    chrome.tabs.create({ url: redirectUrl });
  } else {
    // 弹出提示
    chrome.notifications.create({
      type: "basic",
      iconUrl: chrome.runtime.getURL("icons/icon48.png"),
      title: "跳转CWS镜像",
      message: "链接无法提取扩展ID",
    });
  }
});
