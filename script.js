const STORAGE_KEY = "spendwise_expenses_v1";

const form = document.getElementById("expenseForm");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const notesInput = document.getElementById("notes");
const expenseList = document.getElementById("expenseList");
const emptyState = document.getElementById("emptyState");
const formMessage = document.getElementById("formMessage");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEdit");

let expenses = loadExpenses();
let editingId = null;

function loadExpenses() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    console.error("Could not read saved expenses:", error);
    return [];
  }
}

function saveExpenses() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch (error) {
    showMessage("Unable to save. Check your browser storage settings.", true);
  }
}

function makeId() {
  return window.crypto && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value) {
  if (!value) return "";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function showMessage(message, isError = false) {
  formMessage.textContent = message;
  formMessage.classList.toggle("error", isError);
}

function resetForm() {
  form.reset();
  dateInput.value = new Date().toISOString().slice(0, 10);
  editingId = null;
  document.getElementById("formTitle").textContent = "Add an expense";
  submitBtn.textContent = "＋ Add expense";
  cancelEditBtn.classList.add("hidden");
}

function getFilteredExpenses() {
  const search = document
    .getElementById("searchInput")
    .value.trim()
    .toLowerCase();
  const category = document.getElementById("filterCategory").value;
  const date = document.getElementById("filterDate").value;
  const sort = document.getElementById("sortBy").value;

  const filtered = expenses.filter((expense) => {
    const matchesSearch =
      expense.title.toLowerCase().includes(search) ||
      (expense.notes || "").toLowerCase().includes(search);
    const matchesCategory = category === "all" || expense.category === category;
    const matchesDate = !date || expense.date === date;
    return matchesSearch && matchesCategory && matchesDate;
  });

  return filtered.sort((a, b) => {
    if (sort === "oldest") return a.date.localeCompare(b.date);
    if (sort === "high") return b.amount - a.amount;
    if (sort === "low") return a.amount - b.amount;
    return b.date.localeCompare(a.date);
  });
}

function updateSummary(visibleExpenses) {
  const total = visibleExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );
  const count = visibleExpenses.length;
  document.getElementById("totalAmount").textContent = formatCurrency(total);
  document.getElementById("transactionCount").textContent = count;
  document.getElementById("averageAmount").textContent = formatCurrency(
    count ? total / count : 0,
  );
  document.getElementById("recordCount").textContent =
    `${count} ${count === 1 ? "record" : "records"}`;
}

function renderExpenses() {
  const visibleExpenses = getFilteredExpenses();
  expenseList.innerHTML = "";

  visibleExpenses.forEach((expense) => {
    const row = document.createElement("tr");

    const descriptionCell = document.createElement("td");
    const expenseTitle = document.createElement("span");
    expenseTitle.className = "expense-title";
    expenseTitle.textContent = expense.title;
    descriptionCell.appendChild(expenseTitle);

    if (expense.notes) {
      const note = document.createElement("span");
      note.className = "expense-note";
      note.textContent = expense.notes;
      descriptionCell.appendChild(note);
    }

    const categoryCell = document.createElement("td");
    const pill = document.createElement("span");
    pill.className = "category-pill";
    pill.textContent = expense.category;
    categoryCell.appendChild(pill);

    const dateCell = document.createElement("td");
    dateCell.textContent = formatDate(expense.date);

    const amountCell = document.createElement("td");
    amountCell.className = "amount-cell";
    amountCell.textContent = formatCurrency(expense.amount);

    const actionsCell = document.createElement("td");
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "action-btn";
    editButton.textContent = "Edit";
    editButton.setAttribute("aria-label", `Edit ${expense.title}`);
    editButton.addEventListener("click", () => startEdit(expense.id));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "action-btn delete";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete ${expense.title}`);
    deleteButton.addEventListener("click", () => deleteExpense(expense.id));

    actionsCell.append(editButton, deleteButton);
    row.append(
      descriptionCell,
      categoryCell,
      dateCell,
      amountCell,
      actionsCell,
    );
    expenseList.appendChild(row);
  });

  emptyState.style.display = visibleExpenses.length ? "none" : "block";
  updateSummary(visibleExpenses);
}

function startEdit(id) {
  const expense = expenses.find((item) => item.id === id);
  if (!expense) return;

  editingId = id;
  titleInput.value = expense.title;
  amountInput.value = expense.amount;
  categoryInput.value = expense.category;
  dateInput.value = expense.date;
  notesInput.value = expense.notes || "";
  document.getElementById("formTitle").textContent = "Edit expense";
  submitBtn.textContent = "Save changes";
  cancelEditBtn.classList.remove("hidden");
  showMessage("Update the details and save your changes.");
  document
    .querySelector(".form-panel")
    .scrollIntoView({ behavior: "smooth", block: "start" });
  titleInput.focus();
}

function deleteExpense(id) {
  const expense = expenses.find((item) => item.id === id);
  if (!expense) return;
  if (!window.confirm(`Delete "${expense.title}"? This cannot be undone.`))
    return;
  expenses = expenses.filter((item) => item.id !== id);
  saveExpenses();
  if (editingId === id) resetForm();
  renderExpenses();
  showMessage("Expense deleted.");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const amount = Number(amountInput.value);
  const category = categoryInput.value;
  const date = dateInput.value;
  const notes = notesInput.value.trim();

  if (!title || title.length > 45)
    return showMessage("Enter an expense name (up to 45 characters).", true);
  if (!Number.isFinite(amount) || amount <= 0)
    return showMessage("Enter an amount greater than zero.", true);
  if (!category) return showMessage("Please choose a category.", true);
  if (!date) return showMessage("Please select a date.", true);
  if (date > new Date().toISOString().slice(0, 10))
    return showMessage("Expense date cannot be in the future.", true);

  const expenseData = { title, amount, category, date, notes };

  if (editingId) {
    expenses = expenses.map((item) =>
      item.id === editingId ? { ...item, ...expenseData } : item,
    );
    showMessage("Expense updated successfully.");
  } else {
    expenses.push({ id: makeId(), ...expenseData });
    showMessage("Expense added successfully.");
  }

  saveExpenses();
  resetForm();
  renderExpenses();
});

cancelEditBtn.addEventListener("click", () => {
  resetForm();
  showMessage("");
});

["searchInput", "filterCategory", "filterDate", "sortBy"].forEach((id) => {
  document.getElementById(id).addEventListener("input", renderExpenses);
});

document.getElementById("clearFilters").addEventListener("click", () => {
  document.getElementById("searchInput").value = "";
  document.getElementById("filterCategory").value = "all";
  document.getElementById("filterDate").value = "";
  document.getElementById("sortBy").value = "newest";
  renderExpenses();
});

document.getElementById("todayLabel").textContent =
  new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
dateInput.max = new Date().toISOString().slice(0, 10);
dateInput.value = new Date().toISOString().slice(0, 10);
renderExpenses();
