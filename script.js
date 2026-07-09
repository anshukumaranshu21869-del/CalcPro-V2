const sound = new Audio("click.mp3");
sound.volume = 0.35;

function playSound() {
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

const expressionEl = document.getElementById("expression");
const resultEl = document.getElementById("result");
const historyLineEl = document.getElementById("historyLine");
const keys = document.querySelectorAll(".key");
const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");
const memoryBtns = document.querySelectorAll("[data-memory]");
const themeToggle = document.getElementById("themeToggle");
const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistory");
const convertInput = document.getElementById("convertInput");
const convertType = document.getElementById("convertType");
const convertBtn = document.getElementById("convertBtn");
const convertResult = document.getElementById("convertResult");

let expression = "";
let memoryValue = 0;
let history = [];

function updateDisplay(result = "0") {
  expressionEl.textContent = expression || "0";
  resultEl.textContent = result;
}

function cleanExpression(exp) {
  return exp.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/\^/g, "**");
}

function calculateExpression(exp) {
  try {
    if (!exp) return "0";
    const cleaned = cleanExpression(exp);
    if (!/^[0-9+\-*/().% **]+$/.test(cleaned)) return "Error";
    const ans = Function(`"use strict"; return (${cleaned})`)();
    if (!Number.isFinite(ans)) return "Error";
    return Number(ans.toFixed(10)).toString();
  } catch {
    return "Error";
  }
}

function addHistory(exp, ans) {
  if (!exp || ans === "Error") return;
  history.unshift(`${exp} = ${ans}`);
  history = history.slice(0, 20);
  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = "";
  if (history.length === 0) {
    historyList.innerHTML = "<li>No history yet</li>";
    return;
  }
  history.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    historyList.appendChild(li);
  });
}

function calculate() {
  const ans = calculateExpression(expression);
  historyLineEl.textContent = expression || "Ready";
  updateDisplay(ans);
  addHistory(expression, ans);
  if (ans !== "Error") expression = ans;
}

function scientific(func) {
  const val = Number(calculateExpression(expression));
  if (!expression || Number.isNaN(val)) return;

  let ans = "Error";

  if (func === "sqrt") ans = Math.sqrt(val);
  if (func === "square") ans = val ** 2;
  if (func === "cube") ans = val ** 3;
  if (func === "sin") ans = Math.sin(val * Math.PI / 180);
  if (func === "cos") ans = Math.cos(val * Math.PI / 180);
  if (func === "tan") ans = Math.tan(val * Math.PI / 180);
  if (func === "log") ans = Math.log10(val);
  if (func === "ln") ans = Math.log(val);

  if (func === "factorial") {
    if (val < 0 || !Number.isInteger(val)) ans = "Error";
    else {
      ans = 1;
      for (let i = 2; i <= val; i++) ans *= i;
    }
  }

  if (ans === "Error" || !Number.isFinite(ans)) {
    updateDisplay("Error");
    return;
  }

  ans = Number(ans.toFixed(10)).toString();
  addHistory(`${func}(${expression})`, ans);
  historyLineEl.textContent = `${func}(${expression})`;
  expression = ans;
  updateDisplay(ans);
}

keys.forEach(key => {
  key.addEventListener("click", () => {
    playSound();

    const value = key.dataset.value;
    const action = key.dataset.action;
    const func = key.dataset.func;

    if (value) {
      expression += value;
      updateDisplay();
    }

    if (action === "clear") {
      expression = "";
      historyLineEl.textContent = "Ready";
      updateDisplay();
    }

    if (action === "delete") {
      expression = expression.slice(0, -1);
      updateDisplay();
    }

    if (action === "percent") {
      expression = `(${expression})/100`;
      calculate();
    }

    if (action === "calculate") calculate();

    if (func) scientific(func);
  });
});

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    playSound();
    tabs.forEach(t => t.classList.remove("active"));
    panels.forEach(p => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(`${tab.dataset.mode}Panel`).classList.add("active");
  });
});

memoryBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    playSound();
    const type = btn.dataset.memory;
    const val = Number(calculateExpression(expression)) || 0;

    if (type === "clear") memoryValue = 0;
    if (type === "recall") expression = memoryValue.toString();
    if (type === "add") memoryValue += val;
    if (type === "subtract") memoryValue -= val;

    historyLineEl.textContent = `Memory: ${memoryValue}`;
    updateDisplay(expression || "0");
  });
});

convertBtn.addEventListener("click", () => {
  playSound();
  const value = Number(convertInput.value);
  const type = convertType.value;

  if (Number.isNaN(value)) {
    convertResult.textContent = "Please enter a valid number";
    return;
  }

  const conversions = {
    cmToM: `${value / 100} m`,
    mToCm: `${value * 100} cm`,
    kgToG: `${value * 1000} g`,
    gToKg: `${value / 1000} kg`,
    kmToMile: `${(value * 0.621371).toFixed(4)} mile`,
    mileToKm: `${(value * 1.60934).toFixed(4)} km`
  };

  convertResult.textContent = conversions[type];
});

clearHistoryBtn.addEventListener("click", () => {
  playSound();
  history = [];
  renderHistory();
});

themeToggle.addEventListener("click", () => {
  playSound();
  document.body.classList.toggle("light");
});

document.addEventListener("keydown", e => {
  const allowed = "0123456789+-*/().";
  if (allowed.includes(e.key)) {
    expression += e.key;
    updateDisplay();
  }
  if (e.key === "Enter") calculate();
  if (e.key === "Backspace") {
    expression = expression.slice(0, -1);
    updateDisplay();
  }
  if (e.key === "Escape") {
    expression = "";
    updateDisplay();
  }
});

updateDisplay();
renderHistory();
