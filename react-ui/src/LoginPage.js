import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginRegister.css";

import { useAuth } from "./context/AuthContext"; // Import AuthContext if using Context API


const Login = () => {
    const [email, setEmail] = useState("");  // State for email input
    const [password, setPassword] = useState(""); // State for password input
    const [errorMessage, setErrorMessage] = useState(""); // State for error messages
    const [userToken, setUserToken ]= useState(""); // State for user token
    const { setToken } = useAuth(); // Access the setToken function from AuthContext
    const navigate = useNavigate(); // Initialize useNavigate


    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent page reload

        try {
            // TODO: Replace with actual API URL when backend is ready
            const response = await fetch("http://localhost/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            setUserToken(data.token); // Store the token in state

            if (response.ok) {
                console.log("Login successful:", data);
                setToken(data.access_token); // Save the token in AuthContext
                localStorage.setItem("token", data.access_token); // Option

                navigate("/user", { state: { token: data.access_token } });
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