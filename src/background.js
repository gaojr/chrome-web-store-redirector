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
 * 清除并根据给定 menus 重建右键菜单
 */
const rebuildContextMenus = (menus = {}, callback) => {
  chrome.contextMenus.removeAll().then(() => {
    for (const [k, v] of Object.entries(menus)) {
      chrome.contextMenus.create({
        id: `${STORAGE_KEY}-${k}`,
        title: v.name,
        ...CREATE_PROPERTIES,
      });
    }
    typeof callback === "function" && callback();
  });
};

/**
 * 从 storage 读取 menus
 */
const getStoredMenus = (callback) => {
  // todo
  // chrome.storage.local.get(menus, (res) => {
  //   console.info("🚀 ~ getStoredMenus ~ res:", res);
  //   callback(res.menus);
  // });
};

/**
 * 将 menus 写入 storage 并重建右键菜单
 */
const saveMenus = (menus, callback) => {
  console.info("🚀 ~ saveMenus ~ menus:", menus);
  chrome.storage.local.set({ STORAGE_KEY: menus }).then(
    () => {
      // todo
      console.info("🚀 ~ saveMenus ~ :", 'success');
    },
    (error) => {
      // todo
      console.error("🚀 ~ saveMenus ~ error:", error);
    },
  );
};

const startUp = () => {
  // todo 生成目录
  // return () => {
  //   getStoredMenus((menus) => {
  //     rebuildContextMenus(menus);
  //   });
  // };
};

/**
 * service worker 启动（例如浏览器重启时）需要重建右键菜单
 */
chrome.runtime.onStartup.addListener(startUp());

/**
 * 当扩展首次安装或更新时确保 storage 中有菜单并创建
 */
chrome.runtime.onInstalled.addListener(() => {
  console.info("🚀 ~ onInstalled");
  // todo 如果 storage 为空，写入默认
  // getStoredMenus((menus) => {
  //   // 如果 storage 为空，写入默认
  //   if (!menus || Object.keys(menus).length === 0) {
  //     saveMenusAndRebuild(DEFAULT_MENUS);
  //   }
  // });
});

/**
 * 处理 popup 发来的消息：获取/保存 menus
 */
chrome.runtime.onMessage.addListener((msg, _sender, response) => {
  console.info("🚀 ~ onMessage ~ msg:", msg);
  if (msg?.action === "getMenus") {
    if (msg?.reset) {
      // todo 恢复初始化
      // saveMenusAndRebuild(DEFAULT_MENUS, () => response({ success: true }));
    }
    // todo 获取菜单
    // getStoredMenus((menus) => response({ menus }));
  } else if (msg?.action === "saveMenus") {
    // todo 保存菜单
    // const newMenus = msg.menus || {};
    // saveMenusAndRebuild(newMenus, () => response({ success: true }));
  }
});

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
