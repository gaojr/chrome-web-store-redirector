/**
 * 显示消息
 */
const msgEl = document.getElementById("msg");
const showMsg = (text = "", sec = 3) => {
  msgEl.textContent = text;
  setTimeout(() => {
    msgEl.textContent = "";
  }, sec * 1000);
};

/**
 * 生成菜单
 */
const rowsEl = document.getElementById("rows");
const inputArrts = 'required pattern=".*\\S.*" title="不能为空或纯空格"';
const createInput = (n, p, v) => {
  return `<input type="text" name="${n}" placeholder="${p}" value="${v}" ${inputArrts} />`;
};
const createRow = (key = "", name = "", url = "") => {
  const row = document.createElement("div");
  row.className = "row";
  row.innerHTML = `
    ${createInput("key", "唯一标识", key)}
    ${createInput("showName", "显示名称", name)}
    ${createInput("url", "URL（不以/结尾）", url)}
    <button>删除</button>
  `;
  row.querySelector("button").addEventListener("click", () => {
    row.remove();
  });
  rowsEl.appendChild(row);
};
const renderMenus = (menus = {}) => {
  rowsEl.innerHTML = "";
  for (const [k, v] of Object.entries(menus)) {
    createRow(k, v.name, v.url);
  }
};

/**
 * 注册监听器：点击
 */
document.getElementById("reset").addEventListener("click", async () => {
  const res = await chrome.runtime.sendMessage({ action: "resetMenus" });
  const [msg, sec] = res?.msg ? [res.msg, 0] : ["重置成功"];
  showMsg(msg, sec);
  renderMenus(res?.data);
});
document.getElementById("add").addEventListener("click", () => {
  createRow();
});

/**
 * 注册监听器：提交
 */
document.getElementById("rows").addEventListener("submit", async (event) => {
  event.preventDefault(); // 阻止表单默认提交事件
  showMsg("保存中...", 0);
  const menus = {};
  for (const r of rowsEl.children) {
    const inputs = r.getElementsByTagName("input");
    menus[inputs[0].value.trim()] = { name: inputs[1].value.trim(), url: inputs[2].value.trim() };
  }
  const res = await chrome.runtime.sendMessage({ action: "setMenus", menus });
  const [msg, sec] = res?.msg ? [res.msg, 0] : ["保存成功"];
  showMsg(msg, sec);
});

/**
 * 注册监听器：初始化加载
 */
document.addEventListener("DOMContentLoaded", async () => {
  const res = await chrome.runtime.sendMessage({ action: "getMenus" });
  showMsg(res?.msg || "", 0);
  renderMenus(res?.data);
});
