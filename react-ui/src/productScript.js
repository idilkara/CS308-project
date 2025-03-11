document.addEventListener("DOMContentLoaded", function () {
    const productList = document.querySelector(".product-list");

    // Sample product data
    const products = [
        { name: "Product Name", brand: "Brand" },
        { name: "Product Name", brand: "Brand" },
        { name: "Product Name", brand: "Brand" },
        { name: "Product Name", brand: "Brand" },
        { name: "Product Name", brand: "Brand" }
    ];

    // Generate similar product cards dynamically
    productList.innerHTML = products
        .map(
            (p) =>
                `<div class="product-card">
                    <div class="product-image"></div>
                    <strong>${p.brand}</strong>
                    <p>${p.name}</p>
                    <p>$19.99</p>
                </div>`
        )
        .join("");
});
