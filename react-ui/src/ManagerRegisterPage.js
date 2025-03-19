import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./LoginRegister.css";

const ManagerRegister = () => {
    const [managerType, setManagerType] = useState("sales"); // Default to Sales Manager
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault(); // Prevent page reload

        // Check if any field is empty
        if (!name || !surname || !username || !email || !password) {
            setErrorMessage("All fields are required.");
            return;
        }

        try {
            // TODO: Replace with actual API URL when backend is ready
            const response = await fetch("https://your-backend-api.com/manager-register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ role: managerType, name, surname, username, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Manager registration successful:", data);
                // TODO: Redirect manager to login or dashboard
            } else {
                setErrorMessage(data.message || "Registration failed.");
            }
        } catch (error) {
            console.error("Error during registration:", error);
            setErrorMessage("Something went wrong. Please try again later.");
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-box">
                    <h1 className="brand auth-brand">ODYSSEY</h1>
                    <h2 className="auth-title">Sign Up</h2>

                    {/* Select Role */}
                    <p className="auth-text">Select your role:</p>
                    <div className="manager-toggle">
                        <button
                            className={`toggle-button ${managerType === "sales" ? "active" : ""}`}
                            onClick={() => setManagerType("sales")}
                        >
                            Sales Manager
                        </button>
                        <button
                            className={`toggle-button ${managerType === "product" ? "active" : ""}`}
                            onClick={() => setManagerType("product")}
                        >
                            Product Manager
                        </button>
                    </div>

                    {/* Show error message if fields are empty */}
                    {errorMessage && <p className="auth-error">{errorMessage}</p>}

                    <p className="auth-text">Enter your information:</p>
                    <form className="auth-form" onSubmit={handleRegister}>
                        <input type="text" className="auth-input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                        <input type="text" className="auth-input" placeholder="Surname" value={surname} onChange={(e) => setSurname(e.target.value)} />
                        <input type="text" className="auth-input" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                        <input type="email" className="auth-input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <input type="password" className="auth-input" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <button type="submit" className="auth-button">
                            Sign Up as {managerType === "sales" ? "Sales Manager" : "Product Manager"}
                        </button>
                    </form>

                    <Link to="/manager-login" className="auth-toggle">
                        Already have an account? Log in
                    </Link>
                </div>
            </div>
            <Link to="/login" className="auth-manager">Login or register as customer</Link>
        </div>
    );
};

export default ManagerRegister;