document.addEventListener('DOMContentLoaded', () => {
    const cartTable = document.getElementById('cart-table');
    const totalBox = document.querySelector('.total-price table');
    const cartContainer = document.querySelector('.small-container.cart-page');

    // Exit early if elements don't exist (user might be on a different page)
    if (!cartTable || !totalBox || !cartContainer) return;

    fetch('/cart/data')
        .then(res => res.json())
        .then(cart => {
            let subtotal = 0;
            cart.forEach(item => {
                const price = Number(item.price);
                const quantity = Number(item.quantity);
                const itemSubtotal = price * quantity;
                subtotal += itemSubtotal;

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <div class="cart-info">
                            <img src="${item.image}" alt="${item.name}">
                            <div>
                                <p>${item.name}</p>
                                <small>Price: ₹${price.toFixed(2)}</small><br>
                                <a href="#" class="remove-btn" data-name="${item.name}">Remove</a>
                            </div>
                        </div>
                    </td>
                    <td>
                        <input type="number" value="${quantity}" data-name="${item.name}" min="1" class="qty-input">
                    </td>
                    <td>₹${itemSubtotal.toFixed(2)}</td>
                `;
                cartTable.appendChild(row);
            });

            updateTotal();
            
            // ... rest of your existing event listeners


            // Quantity change event listener
            document.querySelectorAll('.qty-input').forEach(input => {
                input.addEventListener('change', async function () {
                    const name = this.dataset.name;
                    const quantity = parseInt(this.value);

                    if (isNaN(quantity) || quantity <= 0) {
                        alert("Please enter a valid quantity.");
                        return;
                    }

                    const response = await fetch('/cart/update', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, quantity })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.success) {
                            updateCartRow(data.updatedItem, name);
                        }
                    } else {
                        alert("Failed to update cart.");
                    }
                });
            });

            // Remove item event listener
            document.querySelectorAll('.remove-btn').forEach(btn => {
                btn.addEventListener('click', async function (e) {
                    e.preventDefault();
                    const name = this.dataset.name;

                    const response = await fetch('/cart/remove', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name })
                    });

                    if (response.ok) {
                        this.closest('tr').remove();
                        updateTotal();
                    } else {
                        alert("Failed to remove item.");
                    }
                });
            });

            // Function to update totals
            function updateTotal() {
                let subtotal = 0;

                document.querySelectorAll('.qty-input').forEach(input => {
                    const row = input.closest('tr');
                    const priceText = row.querySelector('small').textContent;
                    const price = Number(priceText.replace(/[^\d.]/g, ""));
                    const quantity = Number(input.value);
                    subtotal += price * quantity;
                });

                const tax = subtotal * 0.1;
                const total = subtotal + tax;

                totalBox.innerHTML = `
                    <tr><td>Subtotal</td><td>₹${subtotal.toFixed(2)}</td></tr>
                    <tr><td>Tax</td><td>₹${tax.toFixed(2)}</td></tr>
                    <tr><td>Total</td><td>₹${total.toFixed(2)}</td></tr>
                `;
            }

            // Function to update one row's subtotal and recalculate totals
            function updateCartRow(updatedItem, name) {
                const price = Number(updatedItem.price);
                const quantity = Number(updatedItem.quantity);
                const itemSubtotal = price * quantity;

                const row = document.querySelector(`input[data-name="${name}"]`).closest('tr');
                row.children[2].textContent = `₹${itemSubtotal.toFixed(2)}`;

                updateTotal();
            }
        });
});


// Add to cart logic
document.addEventListener("DOMContentLoaded", function () {
    const addToCartButton = document.querySelector(".add-to-cart");

    if (addToCartButton) {
        addToCartButton.addEventListener("click", async function (e) {
            e.preventDefault();

            const form = addToCartButton.closest("form");
            const name = form.querySelector("input[name='name']").value;
            const price = form.querySelector("input[name='price']").value;
            const quantity = form.querySelector("input[name='quantity']").value;
            const image = addToCartButton.getAttribute("data-image");

            const payload = { name, price, quantity, image };

            try {
                const response = await fetch("/cart/add", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    window.location.href = "/cart";
                } else {
                    alert("Failed to add item to cart.");
                }
            } catch (err) {
                console.error("Error:", err);
            }
        });
    }
});


// Checkout button logic
document.addEventListener('DOMContentLoaded', () => {
    const checkoutButton = document.getElementById("checkout-btn");

    if (checkoutButton) {
        checkoutButton.addEventListener('click', async function () {
            const response = await fetch('/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                alert(data.message);
                window.location.href = "/home";
            } else {
                alert(data.message);
            }
        });
    }
});
