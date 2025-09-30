const showMsg = (text) => {
  document.getElementById("msg").textContent = text;
};

const createRow = (key = "", name = "", url = "") => {
  const row = document.createElement("div");
  row.className = "row";
  row.innerHTML = `
          <input name="key" type="text" placeholder="唯一标识" value="${key}" required=true />
          <input name="showName" type="text" placeholder="显示名称" value="${name}" />
          <input name="url" type="text" placeholder="URL（不以/结尾）" value="${url}" />
          <button>删除</button>
        `;
  row.querySelector("button").addEventListener("click", () => row.remove());
  row.querySelectorAll("input").forEach((e) => {
    e.addEventListener("change", () => {
      e.value ? e.classList.remove("error-input") : e.classList.add("error-input");
    });
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
  const res = await chrome.runtime.sendMessage({ action: "getMenus", reset: reset });
  renderMenus(res?.menus);
};

const validInput = (e) => {
  const v = e.value.trim();
  v ? e.classList.remove("error-input") : e.classList.add("error-input");
  return v;
};

const saveMenus = async () => {
  const menus = {};
  for (const r of rowsEl.children) {
    const inputs = r.getElementsByTagName("input");
    const key = validInput(inputs[0]);
    const name = validInput(inputs[1]);
    const url = validInput(inputs[2])?.replace(/\/+$/, ""); // 去掉末尾斜杠
    if (key && name && url) {
      menus[key] = { name: name, url: url };
    }
  }
  //判断有无非法输入
  if (rowsEl.querySelectorAll(".error-input").length > 0) {
    return "输入不可为空！";
  }
  const res = await chrome.runtime.sendMessage({ action: "saveMenus", menus: menus });
  return res?.success && "保存成功！";
};

// 绑定点击事件
document.getElementById("reset").addEventListener("click", async () => {
  await loadMenus(true);
  showMsg("已重置为默认");
});
document.getElementById("save").addEventListener("click", async () => {
  showMsg(await saveMenus());
});
document.getElementById("add").addEventListener("click", () => {
  rowsEl.appendChild(createRow());
});

// 初始化加载
document.addEventListener("DOMContentLoaded", loadMenus);
