const form = document.getElementById("transaction-form");
const nameInput = document.getElementById("name");
const amountInput = document.getElementById("amount");
const balanceEl = document.getElementById("balance");
const list = document.getElementById("transaction-list");
const error = document.getElementById("error-message");

let balance = 0;

form.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = nameInput.value.trim();
    const amount = Number(amountInput.value);
    const type = document.querySelector('input[name="type"]:checked').value;

    // Validation
    if (name === "" || amount <= 0) {
        error.textContent = "Please enter valid transaction details!";
        return;
    }

    error.textContent = "";

    // Create list item
    const li = document.createElement("li");
    li.classList.add(type);

    if (type === "income") {
        balance += amount;
        li.innerHTML = `<span>${name}</span><span>+₹${amount}</span>`;
    } else {
        balance -= amount;
        li.innerHTML = `<span>${name}</span><span>-₹${amount}</span>`;
    }

    list.appendChild(li);

    // Update balance
    balanceEl.textContent = `₹${balance}`;

    // Clear inputs
    nameInput.value = "";
    amountInput.value = "";
});
