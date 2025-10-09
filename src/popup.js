const showMsg = (text) => {
  document.getElementById("msg").textContent = text;
};

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
  return row;
};

const rowsEl = document.getElementById("rows");
const renderMenus = (menus = {}) => {
  rowsEl.innerHTML = "";
  for (const [k, v] of Object.entries(menus)) {
    rowsEl.appendChild(createRow(k, v.name, v.url));
  }
};

const loadMenus = async (reset = false) => {
  const res = await chrome.runtime.sendMessage({ action: "getMenus", reset });
  showMsg(res?.msg || (reset ? "重置成功" : ""));
  renderMenus(res?.data);
};

const saveMenus = async () => {
  const menus = {};
  for (const r of rowsEl.children) {
    const inputs = r.getElementsByTagName("input");
    menus[inputs[0].value.trim()] = { name: inputs[1].value.trim(), url: inputs[2].value.trim() };
  }
  const res = await chrome.runtime.sendMessage({ action: "setMenus", menus });
  showMsg(res?.msg || "保存成功");
};

// 绑定点击事件
document.getElementById("reset").addEventListener("click", () => {
  loadMenus(true);
});
document.getElementById("add").addEventListener("click", () => {
  rowsEl.appendChild(createRow());
});

// 绑定提交事件
document.getElementById("rows").addEventListener("submit", (event) => {
  event.preventDefault(); // 阻止表单默认提交事件
  saveMenus();
});

// 初始化加载
document.addEventListener("DOMContentLoaded", loadMenus);
