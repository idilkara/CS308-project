import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/root.css";

const Login = () => {
    const [email, setEmail] = useState("");  // State for email input
    const [password, setPassword] = useState(""); // State for password input
    const [errorMessage, setErrorMessage] = useState(""); // State for error messages

    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent page reload

        try {
            // TODO: Replace with actual API URL when backend is ready
            const response = await fetch("https://your-backend-api.com/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Login successful:", data);
                // TODO: Redirect user to dashboard or homepage
            } else {
                setErrorMessage(data.message || "Invalid email or password.");
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
                    <h2 className="auth-title">Log in</h2>

                    <form className="auth-form" onSubmit={handleLogin}>
                        <input
                            type="email"
                            className="auth-input"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            type="password"
                            className="auth-input"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button type="submit" className="auth-button">Login</button>
                    </form>

                    {/* Show error message if login fails */}
                    {errorMessage && <p className="auth-error">{errorMessage}</p>}

                    <Link to="/register" className="auth-toggle">
                        Don't have an account? Register
                    </Link>
                </div>
            </div>
            <Link to="/manager-login" className="auth-manager">Login or register as manager</Link>
        </div>
    );
};

export default Login;
