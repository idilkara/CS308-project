import React from 'react';
import {BsBag, BsPersonCircle} from "react-icons/bs";

const Footer = () => {

    const footerData = [
        {
            header: "Publishers",
            links: [
                { text: "Publisher 1", url: "#"},
                { text: "Publisher 2", url: "#"},
                { text: "Publisher 3", url: "#"},
                { text: "Publisher 4", url: "#"},
            ]
        },
        {
            header: "Authors",
            links: [
                { text: "Sima's Fav Author", url: "#"},
                { text: "Secil's Fav Author", url: "#"},
                { text: "Idil's Fav Author", url: "#"},
                { text: "Esin's Fav Author", url: "#"},
                { text: "Zeynep's Fav Author", url: "#"},
                { text: "Duygu's Fav Author", url: "#"},
            ]
        },
        {
            header: "Support",
            links: [
                { text: "Return Policy", url: "#"},
                { text: "Orders", url: "#"},
                { text: "Delivery", url: "#"},
            ]
        },
        {
            header: "Contact",
            links: [
                { text: "Email Us", url: "mailto:adleyba@sabanciuniv.edu"},
                { text: "Call Us", url: "tel:02164839000"},
            ]
        }
    ];

    return (
        <footer className="footer">
            <div className="footer-container">
                {footerData.map((section, index) => (
                    <div key={index} className="footer-column">
                        <h3 className="footer-header">{section.header}</h3>
                        <ul className="footer-links">
                            {section.links.map((link, idx) => (
                                <li key={idx}>
                                    <a href={link.url}>{link.text}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </footer>
    );
};

export default Footer;
