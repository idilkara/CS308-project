import React, { useState } from 'react';
import "./ProductPage.css";
const ProductPage = () => {
  // Sample product data
  const products = [
    { name: "Product Name", brand: "Brand", price: "$19.99" },
    { name: "Product Name", brand: "Brand", price: "$19.99" },
    { name: "Product Name", brand: "Brand", price: "$19.99" },
    { name: "Product Name", brand: "Brand", price: "$19.99" },
    { name: "Product Name", brand: "Brand", price: "$19.99" }
  ];

  return (
    <div>
      <br />
      <div className="product-header">
        <p className="category-path">Category 1 / Subcategory 1</p>
      </div>
      
      <section className="product-details">
        <ImageGallery />
        <br />
        <div className="product-info">
          <div className="brand-rating">
            <h3>Brand</h3>
            <div className="rating">
              <span className="stars">★★★★★</span>
              <span className="rating-count">(17)</span>
            </div>
          </div>
          <h1>Product Name</h1>
          <p>$19.99</p>
          <p>Product Code: XXXXXXXXXX</p>
          <h3>Product Description</h3>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
          <h3>Shipping and Return Policy</h3>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
        </div>
      </section>

      <hr className="separator" />

      <SimilarProducts products={products} />
      
      <br />
      <hr className="separator" />

      <CommentSection />
    </div>
  );
};

const ImageGallery = () => {
  return (
    <div className="image-gallery">
      <div className="main-image"></div>
      <div className="sub-images">
        <div className="sub-image"></div>
        <div className="sub-image"></div>
        <div className="sub-image"></div>
      </div>
    </div>
  );
};

const SimilarProducts = ({ products }) => {
  return (
    <section className="similar-products">
      <h2>Similar Products</h2>
      <div className="product-list">
        {products.map((product, index) => (
          <ProductCard 
            key={index} 
            name={product.name} 
            brand={product.brand} 
            price={product.price} 
          />
        ))}
      </div>
    </section>
  );
};

const ProductCard = ({ name, brand, price }) => {
  return (
    <div className="product-card">
      <div className="product-image"></div>
      <strong>{brand}</strong>
      <p>{name}</p>
      <p>{price}</p>
    </div>
  );
};

const CommentSection = () => {
  const [filterOption, setFilterOption] = useState('highest-rated');
  
  const handleFilterChange = (e) => {
    setFilterOption(e.target.value);
  };
  
  return (
    <div className="comment-container">
      <section className="comments">
        <div className="comments-header">
          <h2>Comments (17)</h2>
          <div className="filter-dropdown">
            <select 
              className="filter-select" 
              value={filterOption}
              onChange={handleFilterChange}
            >
              <option value="highest-rated">Highest Rated</option>
              <option value="least-rated">Least Rated</option>
              <option value="most-recent">Most Recent</option>
              <option value="more-popular">More Popular</option>
            </select>
          </div>
        </div>
        
        <CommentCard />
        <CommentCard />
      </section>
    </div>
  );
};

const CommentCard = () => {
  return (
    <div className="comment-card">
      <div className="comment-header">
        <div className="avatar"></div>
        <div className="stars">★★★★★</div>
      </div>
      <p className="comment-text">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
        Maecenas volutpat leo turpis, dignissim ultrices orci condimentum vulputate. 
        Maecenas imperdiet imperdiet tincidunt. Vestibulum tincidunt rhoncus tristique. 
        Ut scelerisque luctus auctor. Suspendisse in maximus ipsum, nec varius lacus. 
        Sed ultricies dapibus eros et aliquet. Etiam a nisl mi.
      </p>
    </div>
  );
};

export default ProductPage;