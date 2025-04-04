import React, { useState, useEffect } from "react";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import "../styles/CategoriesAuthors.css";

const Authors = () => {
    const [authors, setAuthors] = useState([]);

    useEffect(() => {
        const fetchAuthors = async () => {
            try {
                const response = await fetch("http://localhost/api/products/products");
                const products = await response.json();
                console.log("Fetched products:", products);
                const authorSet = new Set();

                products.forEach(product => {
                    if (product.author) {
                        authorSet.add(product.author.trim()); 
                    }
                });

                const authorList = Array.from(authorSet).map((name) => {
                    const imageName = name
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                        .replace(/[^a-z0-9-]/g, "");

                    return {
                        name,
                        image: `${imageName}.jpg`,
                    };
                });

                setAuthors(authorList);
            } catch (error) {
                console.error("Failed to fetch authors:", error);
            }
        };

        fetchAuthors();
    }, []);

    const authorsByLetter = authors.reduce((acc, author) => {
        const firstLetter = author.name[0].toUpperCase();
        if (!acc[firstLetter]) acc[firstLetter] = [];
        acc[firstLetter].push(author);
        return acc;
    }, {});

    return (
        <div>
            <Navbar />
            <div className="authors-container">
                <h1 className="page-title">Authors</h1>

                <div className="alphabet-nav-wrapper">
                    <div className="alphabet-nav">
                        {Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map((letter) => (
                            <a key={letter} href={`#${letter}`} className="alphabet-link">
                                {letter}
                            </a>
                        ))}
                    </div>
                </div>

                <div className="authors-list">
                    {Object.keys(authorsByLetter).sort().map((letter) => (
                        <div key={letter} id={letter} className="letter-section">
                            <h2 className="letter-header">{letter}</h2>
                            <div className="author-cards">
                                {authorsByLetter[letter].map((author, index) => (
                                    <div key={index} className="author-card">
                                        <img
                                            src={`/images/authorImages/${author.image}`}
                                            alt={author.name}
                                            className="author-image"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "/images/authorImages/default.jpg";
                                            }}
                                        />
                                        <div className="author-name">{author.name}</div>
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

export default Authors;