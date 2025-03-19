import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./LoginRegister.css";

const ManagerLogin = () => {
    const [managerType, setManagerType] = useState("sales"); // Default to Sales Manager
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent page reload

        if (!username || !password) {
            setErrorMessage("All fields are required.");
            return;
        }

        try {
            // TODO: Replace with actual API URL when backend is ready
            const response = await fetch("https://your-backend-api.com/manager-login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ role: managerType, username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Manager login successful:", data);
                // TODO: Redirect manager to dashboard
            } else {
                setErrorMessage(data.message || "Invalid username or password.");
            }
        } catch (error) {
            console.error("Error during login:", error);
            setErrorMessage("Something went wrong. Please try again later.");
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-box">
                    <h1 className="brand auth-brand">ODYSSEY</h1>
                    <h2 className="auth-title">Manager Login</h2>

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

                    <form className="auth-form" onSubmit={handleLogin}>
                        <input
                            type="text"
                            className="auth-input"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <input
                            type="password"
                            className="auth-input"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button type="submit" className="auth-button">
                            Login as {managerType === "sales" ? "Sales Manager" : "Product Manager"}
                        </button>
                    </form>

                    <Link to="/manager-register" className="auth-toggle">
                        Don't have an account? Register
                    </Link>
                </div>
            </div>
            <Link to="/login" className="auth-manager">
                Login or register as a customer
            </Link>
        </div>
    );
};

export default ManagerLogin;