import React, { useState, useEffect } from "react";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import "../styles/CategoriesAuthors.css";

const Categories = () => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch("http://localhost/api/categories/categories");
                const data = await response.json();

                const categoriesWithImages = data.map((category) => {
                    const imageName = category.name
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                        .replace(/[^a-z0-9-]/g, "");

                    return {
                        ...category,
                        image: `${imageName}.jpg`
                    };
                });

                console.log("Fetched categories:", data);

                setCategories(categoriesWithImages);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };

        fetchCategories();
    }, []);

    const categoriesByLetter = categories.reduce((acc, category) => {
        const firstLetter = category.name[0].toUpperCase();
        if (!acc[firstLetter]) acc[firstLetter] = [];
        acc[firstLetter].push(category);
        return acc;
    }, {});

    return (
        <div>
            <Navbar />
            <div className="categories-container">
                <h1 className="page-title">Categories</h1>
                <div className="alphabet-nav-wrapper">
                    <div className="alphabet-nav">
                        {Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map((letter) => (
                            <a key={letter} href={`#${letter}`} className="alphabet-link">
                                {letter}
                            </a>
                        ))}
                    </div>
                </div>

                <div className="categories-list">
                    {Object.keys(categoriesByLetter).sort().map((letter) => (
                        <div key={letter} id={letter} className="letter-section">
                            <h2 className="letter-header">{letter}</h2>
                            <div className="category-cards">
                                {categoriesByLetter[letter].map((category, index) => (
                                    <div key={index} className="category-card">
                                        <img
                                            src={`/images/categoryImages/${category.image}`}
                                            alt={category.name}
                                            className="category-image"
                                            onError={(e) => {
                                                e.target.onerror = null; // prevent infinite loop
                                                e.target.src = "/images/categoryImages/default.jpg"; // fallback image
                                            }}
                                        />
                                        <div className="category-name">{category.name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Categories;