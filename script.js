// Variables
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");
const btns = document.querySelectorAll(".bag-btn");

// Cart
let cart = [];

// Buttons
let buttonsDOM = [];

// Getting the products
class Products {
    async getProducts() {
        try {
            let result = await fetch("products.json");
            let data = await result.json();
            let products = data.products.data.items;

            products = products.map(item => {
                const { name, description, id, images, features, price } = item;
                return { name, id, description, images, features, price };
            });

            return products;
        } catch (error) {
            console.log(error);
        }
    }
}

// Display products
class UI {
    displayProducts(products) {
        let result = "";
        products.forEach(product => {
            result +=
                `<article class="product">
                <div class="image-container">
                    <img src="https://picsum.photos/640/360"
                    alt="Product"
                    class="product-img">
                    <button class="bag-btn" data-id=${product.id}>
                      <i class="fas fa-shopping-cart"></i>
                        buy
                    </button>
                    <a href="product_description.html?id=${product.id}" class="description-link">Description</a>
                </div>
                <h3>${product.name}</h3>
                <h4>$${product.price}</h4>
            </article>`
        });
        productsDOM.innerHTML = result;
        // Reattach event listeners for BUY buttons
        this.getBagButtons();
    }

    getBagButtons() {
        const buttons = document.querySelectorAll(".bag-btn");
        buttonsDOM = buttons;
        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if (inCart) {
                button.innerText = "In Cart";
                button.disabled = true;
            }
            button.addEventListener("click", (event) => {
                if (inCart) {
                    return;
                }
                event.target.innerText = "In Cart";
                event.target.disabled = true;
                // Get product from products
                let cartItem = { ...Storage.getProduct(id), amount: 1 };
                // Add product to the cart
                cart = [...cart, cartItem];
                // Save cart in local storage
                Storage.saveCart(cart);
                // Set cart values
                this.setCartValues(cart);
                // Display cart item
                this.addCartItem(cartItem);
                // Show the cart
                this.showCart();
            });
        });
    }

    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }

    addCartItem(item) {
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML =
            `<img src="https://picsum.photos/640/360"
            alt="Product">
            <div>
                <h4>${item.name}</h4>
                <h5>$${item.price}</h5>
                <span class="remove-item" data-id=${item.id}>Remove</span>
            </div>
            <div>
                <i class="fas fa-chevron-up" data-id=${item.id}></i>
                <p class="item-amount">${item.amount}</p>
                <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>`;
        cartContent.appendChild(div);
    }

    showCart() {
        cartOverlay.classList.add("transparentBcg");
        cartDOM.classList.add("showCart");
    }

    // Setup app
    setupAPP() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        cartBtn.addEventListener("click", this.showCart);
        closeCartBtn.addEventListener("click", this.hideCart);
        this.populateCart(cart);
    }

    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item));
    }

    hideCart() {
        cartOverlay.classList.remove("transparentBcg");
        cartDOM.classList.remove("showCart");
    }

    // Cart logic
    cartLogic() {
        // Cart button
        clearCartBtn.addEventListener("click", () => {
            this.clearCart();
        });
        cartContent.addEventListener("click", event => {
            if(event.target.classList.contains("remove-item")){
                let removeItem = event.target;
                // This removes the item from both the cart and the DOM
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);
            }
            else if (event.target.classList.contains("fa-chevron-up")){
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id===id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            }
            else if (event.target.classList.contains("fa-chevron-down")){
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id===id);
                tempItem.amount = tempItem.amount - 1;
                if (tempItem.amount > 0){
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                }
                else{
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id);
                }
            }
        });
    }

    clearCart() {
        // Cart functionality
        cart = [];
        this.setCartValues(cart);
        Storage.saveCart(cart);

        // Remove cart items from the DOM
        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }

        // Reset button texts
        buttonsDOM.forEach(button => {
            button.innerHTML = `<i class="fas fa-shopping-cart"></i>BUY`;
            button.disabled = false;
        });

        this.hideCart();
    }

    removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
    
        // Find the button and update its state
        buttonsDOM.forEach(button => {
            if (button.dataset.id === id) {
                button.disabled = false;
                button.innerHTML = `<i class="fas fa-shopping-cart"></i>BUY`;
            }
        });
    
        // Remove the corresponding cart item from the DOM
        const removeElement = document.querySelector(`.cart-item .remove-item[data-id="${id}"]`);
        if (removeElement) {
            removeElement.parentElement.parentElement.remove();
        }
    }

    getSingleButton(id){
        return buttonsDOM.find(button => button.dataset.id === id);
    }

    searchProducts(products) {
        const searchTerm = document.getElementById('search').value.toLowerCase().trim();

        if (searchTerm) {
            const filteredProducts = products.filter(product => product.name.toLowerCase().includes(searchTerm));
            this.displayProducts(filteredProducts);
        } else {
            this.displayProducts(products);
        }
    }
}

// Local storage
class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem("products"));
        return products.find(product => product.id === id);
    }
    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }
    static getCart() {
        return localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : [];
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();

    // Setup app
    ui.setupAPP();

    // Get all products
    products.getProducts().then(products => {
        ui.displayProducts(products);
        Storage.saveProducts(products);

        // Search functionality
        const searchInput = document.getElementById('search');
        searchInput.addEventListener('input', () => {
            ui.searchProducts(products);
        });

        // Initial category filter
        filterProducts();

    }).then(() => {
        ui.getBagButtons();
        ui.cartLogic();
    });
});


let menuButton = document.getElementById("menuBtn");
const menuOptions = document.querySelector(".menu-options");

menuButton.addEventListener("click", function (event) {
    event.stopPropagation(); // Prevent the click event from reaching the body
    menuOptions.style.display = (menuOptions.style.display === "block") ? "none" : "block";
});

document.body.addEventListener("click", function () {
    menuOptions.style.display = "none"; // Close the menu when clicking anywhere outside
});

async function sortProducts() {
    const sortOption = document.getElementById('sort').value;

    try {
        const response = await fetch("products.json");
        const jsonData = await response.json();

        let sortedProducts;

        switch (sortOption) {
            case 'ascending':
                sortedProducts = jsonData.products.data.items.slice().sort((a, b) => a.price - b.price);
                break;
            case 'descending':
                sortedProducts = jsonData.products.data.items.slice().sort((a, b) => b.price - a.price);
                break;
            default:
                sortedProducts = jsonData.products.data.items.slice(); // Default to original order
                break;
        }

        const ui = new UI();
        ui.displayProducts(sortedProducts);
    } catch (error) {
        console.error('Error sorting products:', error);
    }
}

async function filterProducts() {
    const categoryOption = document.getElementById('category').value.toLowerCase();

    try {
        const response = await fetch("products.json");
        const jsonData = await response.json();

        let filteredProducts;

        if (categoryOption !== 'all') {
            // Filter products by category keyword
            filteredProducts = jsonData.products.data.items.filter(product => product.keywords.toLowerCase().includes(categoryOption));
        } else {
            // Display all products
            filteredProducts = jsonData.products.data.items.slice();
        }

        const ui = new UI();
        ui.displayProducts(filteredProducts);
    } catch (error) {
        console.error('Error filtering products:', error);
    }
}