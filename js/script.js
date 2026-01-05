const form = document.getElementById("expense-form");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const expenseList = document.getElementById("expense-list");
const totalEl = document.getElementById("total");
const emptyEl = document.getElementById("empty");

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let currentFilter = "All";

/* INIT */
renderExpenses();

/* EVENTS */
form.addEventListener("submit", addExpense);

function addExpense(e) {
  e.preventDefault();

  const description = descriptionInput.value.trim();
  const amount = parseFloat(amountInput.value); // permite zecimale
  const category = categoryInput.value;

  if (!description || amount <= 0) return;

  const expense = {
    id: Date.now(),
    description,
    amount,
    category
  };

  expenses.push(expense);
  saveAndRender();
  form.reset();
}

function renderExpenses() {
  expenseList.innerHTML = "";

  const filteredExpenses =
    currentFilter === "All"
      ? expenses
      : expenses.filter(exp => exp.category === currentFilter);

  emptyEl.style.display = filteredExpenses.length === 0 ? "block" : "none";

  filteredExpenses.forEach(expense => {
    const li = document.createElement("li");
    li.setAttribute("data-id", expense.id);

    const textDiv = document.createElement("div");
    textDiv.className = "expense-text";

    const title = document.createElement("strong");
    title.textContent = expense.description;

    const categorySpan = document.createElement("span");
    categorySpan.className = `category ${expense.category}`;
    categorySpan.textContent = expense.category;

    // EDIT prin dblclick
    title.addEventListener("dblclick", () => {
      const input = document.createElement("input");
      input.type = "text";
      input.value = expense.description;

      textDiv.replaceChild(input, title);
      input.focus();

      function saveEdit() {
        const newValue = input.value.trim();
        if (newValue) {
          expense.description = newValue;
          saveAndRender();
        } else {
          textDiv.replaceChild(title, input);
        }
      }

      input.addEventListener("blur", saveEdit);
      input.addEventListener("keydown", e => {
        if (e.key === "Enter") saveEdit();
        if (e.key === "Escape") textDiv.replaceChild(title, input);
      });
    });

    textDiv.appendChild(title);
    textDiv.appendChild(categorySpan);

    const amountSpan = document.createElement("span");
    amountSpan.textContent = `${expense.amount} RON`;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "X";
    deleteBtn.className = "delete-btn";

    deleteBtn.addEventListener("click", () => deleteExpense(expense.id));

    li.appendChild(textDiv);
    li.appendChild(amountSpan);
    li.appendChild(deleteBtn);

    expenseList.appendChild(li);
  });

  updateTotal();
}

function deleteExpense(id) {
  const li = document.querySelector(`[data-id="${id}"]`);
  if (li) {
    li.style.transition = "opacity 0.2s ease, transform 0.2s ease";
    li.style.opacity = "0";
    li.style.transform = "translateX(20px)";
  }

  setTimeout(() => {
    expenses = expenses.filter(exp => exp.id !== id);
    saveAndRender();
  }, 200);
}

function updateTotal() {
  const total = expenses
    .filter(exp => currentFilter === "All" || exp.category === currentFilter)
    .reduce((sum, exp) => sum + exp.amount, 0);

  totalEl.textContent = total.toFixed(2); // afișează două zecimale
}

function saveAndRender() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
  renderExpenses();
}

function setFilter(category) {
  currentFilter = category;

  document.querySelectorAll(".filters button").forEach(btn => {
    btn.classList.remove("active");
    if (btn.textContent === category) btn.classList.add("active");
  });

  renderExpenses();
}
