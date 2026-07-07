const form = document.getElementById("transaction-form");
const transactionList = document.getElementById("transaction-list");

const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");

const budgetInput = document.getElementById("budget-input");
const budgetDisplay = document.getElementById("budget-display");
const remainingBudgetEl = document.getElementById("remaining-budget");

const saveBudgetBtn = document.getElementById("save-budget");

const searchInput = document.getElementById("search");
const filterSelect = document.getElementById("filter");

const clearBtn = document.getElementById("clear-btn");
const exportBtn = document.getElementById("export-btn");

const errorMessage = document.getElementById("error-message");

const TRANSACTION_KEY = "expense_tracker_transactions";
const BUDGET_KEY = "expense_tracker_budget";

let transactions =
    JSON.parse(localStorage.getItem(TRANSACTION_KEY)) || [];

let budget =
    Number(localStorage.getItem(BUDGET_KEY)) || 0;

budgetInput.value = budget;

budgetDisplay.textContent = `₹${budget}`;

render();

// Save Functions

function saveTransactions() {

    localStorage.setItem(
        TRANSACTION_KEY,
        JSON.stringify(transactions)
    );

}

function saveBudget() {

    localStorage.setItem(
        BUDGET_KEY,
        budget
    );

}

// Budget

saveBudgetBtn.addEventListener("click", () => {

    const value = Number(budgetInput.value);

    if (value < 0) {

        alert("Budget cannot be negative.");

        return;

    }

    budget = value;

    saveBudget();

    render();

});

// Add Transaction

form.addEventListener("submit", function (e) {

    e.preventDefault();

    const name =
        document.getElementById("name").value.trim();

    const amount =
        Number(document.getElementById("amount").value);

    const category =
        document.getElementById("category").value;

    const type =
        document.querySelector(
            'input[name="type"]:checked'
        ).value;

    // Validation

    if (name === "") {

        showError("Please enter a transaction name.");

        return;

    }

    if (amount <= 0 || isNaN(amount)) {

        showError("Please enter a valid amount.");

        return;

    }

    hideError();

    const transaction = {

        id: Date.now(),

        name,

        amount,

        category,

        type,

        date: new Date().toLocaleDateString()

    };

    transactions.push(transaction);

    saveTransactions();

    render();

    form.reset();

});
// Utility Functions

function showError(message) {

    errorMessage.textContent = message;

}

function hideError() {

    errorMessage.textContent = "";

}

function formatCurrency(value) {

    return `₹${Number(value).toLocaleString("en-IN")}`;

}

// Render Everything
function render() {

    renderTransactions();

    updateSummary();

}
// Render Transactions

function renderTransactions() {

    transactionList.innerHTML = "";

    let searchText =
        searchInput.value.toLowerCase();

    let filter =
        filterSelect.value;

    let filteredTransactions =
        transactions.filter(transaction => {

            let matchesSearch =
                transaction.name
                    .toLowerCase()
                    .includes(searchText);

            let matchesFilter =
                filter === "all"
                || transaction.type === filter;

            return matchesSearch && matchesFilter;

        });

    if(filteredTransactions.length === 0){

        transactionList.innerHTML = `

            <div class="empty-state">

                <i class="fa-solid fa-wallet"></i>

                <h3>No Transactions Found</h3>

                <p>Add your first transaction.</p>

            </div>

        `;

        return;

    }

    filteredTransactions.forEach(transaction => {

        const li =
            document.createElement("li");

        li.classList.add(transaction.type);

        const amountClass =
            transaction.type === "income"
            ? "income-amount"
            : "expense-amount";

        const sign =
            transaction.type === "income"
            ? "+"
            : "-";

        li.innerHTML = `

        <div class="transaction-info">

            <h4>${transaction.name}</h4>

            <p>

                ${transaction.category}

                •

                ${transaction.date}

            </p>

        </div>

        <div class="transaction-amount ${amountClass}">

            ${sign}${formatCurrency(transaction.amount)}

        </div>

        <button
            class="delete-btn"
            onclick="deleteTransaction(${transaction.id})">

            <i class="fa-solid fa-trash"></i>

        </button>

        `;

        transactionList.appendChild(li);

    });

}

// Summary Cards

function updateSummary(){

    let income = 0;

    let expense = 0;

    transactions.forEach(transaction=>{

        if(transaction.type==="income"){

            income += transaction.amount;

        }

        else{

            expense += transaction.amount;

        }

    });

    const balance =
        income - expense;

    const remaining =
        budget - expense;

    balanceEl.textContent =
        formatCurrency(balance);

    incomeEl.textContent =
        formatCurrency(income);

    expenseEl.textContent =
        formatCurrency(expense);

    budgetDisplay.textContent =
        formatCurrency(budget);

    remainingBudgetEl.textContent =
        formatCurrency(remaining);

    if(remaining < 0){

        remainingBudgetEl.classList.add("over-budget");

    }

    else{

        remainingBudgetEl.classList.remove("over-budget");

    }

}

// Delete Transaction

function deleteTransaction(id){

    const confirmDelete =
        confirm("Delete this transaction?");

    if(!confirmDelete){

        return;

    }

    transactions =
        transactions.filter(transaction => transaction.id !== id);

    saveTransactions();

    render();

}

// Search
searchInput.addEventListener("input",()=>{

    renderTransactions();

});

// Filter

filterSelect.addEventListener("change",()=>{

    renderTransactions();

});
// Export Transactions to CSV

exportBtn.addEventListener("click", exportCSV);

function exportCSV() {

    if (transactions.length === 0) {

        alert("No transactions to export.");

        return;

    }

    let csv =
        "Name,Category,Type,Amount,Date\n";

    transactions.forEach(transaction => {

        csv +=
            `"${transaction.name}",` +
            `"${transaction.category}",` +
            `"${transaction.type}",` +
            `"${transaction.amount}",` +
            `"${transaction.date}"\n`;

    });

    const blob = new Blob(
        [csv],
        { type: "text/csv" }
    );

    const url =
        URL.createObjectURL(blob);

    const a =
        document.createElement("a");

    a.href = url;

    a.download = "transactions.csv";

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

    URL.revokeObjectURL(url);

}
// Clear All Transactions

clearBtn.addEventListener("click", clearTransactions);

function clearTransactions() {

    if (transactions.length === 0) {

        alert("Nothing to clear.");

        return;

    }

    const confirmClear =
        confirm(
            "Delete all transactions?"
        );

    if (!confirmClear)
        return;

    transactions = [];

    saveTransactions();

    render();

}
// Reset Budget

function resetBudget() {

    budget = 0;

    budgetInput.value = 0;

    saveBudget();

}

// Clear Everything

function clearEverything() {

    transactions = [];

    resetBudget();

    saveTransactions();

    render();

}
// Get Transactions By Type

function getIncomeTransactions() {

    return transactions.filter(transaction =>
        transaction.type === "income"
    );

}

function getExpenseTransactions() {

    return transactions.filter(transaction =>
        transaction.type === "expense"
    );

}
// Calculate Totals

function getTotalIncome() {

    return getIncomeTransactions()

        .reduce((total, transaction) => {

            return total + transaction.amount;

        }, 0);

}

function getTotalExpense() {

    return getExpenseTransactions()

        .reduce((total, transaction) => {

            return total + transaction.amount;

        }, 0);

}
// Local Storage Helpers

function reloadData() {

    transactions =
        JSON.parse(
            localStorage.getItem(
                TRANSACTION_KEY
            )
        ) || [];

    budget =
        Number(
            localStorage.getItem(
                BUDGET_KEY
            )
        ) || 0;

}
// Window Load

window.addEventListener("load", () => {

    reloadData();

    budgetInput.value = budget;

    render();

});

// Prevent Negative Budget Display

function updateRemainingColor() {

    const remaining =
        budget - getTotalExpense();

    if (remaining < 0) {

        remainingBudgetEl.classList.add(
            "over-budget"
        );

    }

    else {

        remainingBudgetEl.classList.remove(
            "over-budget"
        );

    }

}
// Override Render

const originalRender = render;

render = function () {

    originalRender();

    updateRemainingColor();

};
// Chart

let pieChart = null;

function updateChart() {

    const canvas =
        document.getElementById("pieChart");

    if (!canvas)
        return;

    const expenseTransactions =
        transactions.filter(transaction =>
            transaction.type === "expense"
        );

    const categoryTotals = {};

    expenseTransactions.forEach(transaction => {

        if (!categoryTotals[transaction.category]) {

            categoryTotals[transaction.category] = 0;

        }

        categoryTotals[transaction.category] +=
            transaction.amount;

    });

    const labels =
        Object.keys(categoryTotals);

    const data =
        Object.values(categoryTotals);

    if (pieChart !== null) {

        pieChart.destroy();

    }

    pieChart = new Chart(canvas, {

        type: "pie",

        data: {

            labels: labels,

            datasets: [

                {

                    data: data,

                    backgroundColor: [

                        "#3498db",
                        "#2ecc71",
                        "#e74c3c",
                        "#9b59b6",
                        "#f39c12",
                        "#1abc9c",
                        "#34495e",
                        "#e67e22",
                        "#16a085",
                        "#7f8c8d"

                    ],

                    borderWidth: 2,

                    borderColor: "#ffffff"

                }

            ]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {

                    position: "bottom"

                },

                title: {

                    display: true,

                    text: "Expenses by Category"

                }

            }

        }

    });

}
// Update Render Function

const previousRender = render;

render = function () {

    previousRender();

    updateChart();

};

// First Chart Load

window.addEventListener("load", () => {

    updateChart();

});