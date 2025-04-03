export function searchProducts(query, allProducts) {
    const lowerQuery = query.toLowerCase();

    const matches = allProducts.filter(product => {
        return (
            product.name.toLowerCase().includes(lowerQuery) ||
            (product.author && product.author.toLowerCase().includes(lowerQuery)) ||
            (product.description && product.description.toLowerCase().includes(lowerQuery))
        );
    });

    return matches.slice(0, 5); // only return top 5
}