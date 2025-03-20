import React, { useState, useEffect } from "react";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import "../styles/CategoriesAuthors.css";

const Authors = () => {
    const [authors, setAuthors] = useState([]);

    useEffect(() => {
        const fetchedAuthors = [
            { name: "Haruki Murakami", image: "murakami.jpg" },
            { name: "Hermann Hesse", image: "hesse.jpg" },
            { name: "Ursula K. Le Guin", image: "ursula.jpg" },
        ];
        setAuthors(fetchedAuthors);
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
                {/* Page Title */}
                <h1 className="page-title">Authors</h1>

                {/* A-Z Navigation with Divider */}
                <div className="alphabet-nav-wrapper">
                    <div className="alphabet-nav">
                        {Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map((letter) => (
                            <a key={letter} href={`#${letter}`} className="alphabet-link">
                                {letter}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Authors List */}
                <div className="authors-list">
                    {Object.keys(authorsByLetter)
                        .sort()
                        .map((letter) => (
                            <div key={letter} id={letter} className="letter-section">
                                <h2 className="letter-header">{letter}</h2>
                                <div className="author-cards">
                                    {authorsByLetter[letter].map((author, index) => (
                                        <div key={index} className="author-card">
                                            <img src={`/images/${author.image}`} alt={author.name} className="author-image" />
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