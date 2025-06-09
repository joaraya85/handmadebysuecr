let categories = [];
let products = [];

function addCategory() {
    const category = prompt("Enter category name:");
    if (category) {
        categories.push(category);
        displayCategories();
    }
}

function addProduct() {
    const product = prompt("Enter product name:");
    const category = prompt("Enter category name:");
    if (product && category) {
        products.push({ name: product, category: category });
        displayProducts();
    }
}

function displayCategories() {
    const categoryList = document.getElementById("category-list");
    categoryList.innerHTML = "<h3>Categories:</h3>";
    categories.forEach(category => {
        const div = document.createElement("div");
        div.textContent = category;
        categoryList.appendChild(div);
    });
}

function displayProducts() {
    const productList = document.getElementById("product-list");
    productList.innerHTML = "<h3>Products:</h3>";
    products.forEach(product => {
        const div = document.createElement("div");
        div.textContent = `${product.name} (${product.category})`;
        productList.appendChild(div);
    });
}
