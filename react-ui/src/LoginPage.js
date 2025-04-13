import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginRegister.css";

import { useAuth } from "./context/AuthContext"; // Import AuthContext if using Context API

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const { setToken } = useAuth(); // Access the setToken function from AuthContext
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent page reload
    
        try {
            const response = await fetch("http://localhost/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });
    
            const data = await response.json();
    
            if (response.ok) {
                console.log("Login successful:", data);
                const accessToken = data.access_token;
                setToken(accessToken); // Save the token in AuthContext
                localStorage.setItem("token", accessToken);
                
                // Transfer any items in localStorage cart to the user's backend cart
                await transferTempCartToUser(accessToken);
                
                navigate("/user", { state: { token: accessToken } });
            } else {
                setErrorMessage(data.message || "Invalid email or password.");
            }
        } catch (error) {
            console.error("Error during login:", error);
            setErrorMessage("Something went wrong. Please try again later.");
        }
    };
    
    // Function to transfer temporary cart items to user's backend cart
    const transferTempCartToUser = async (userToken) => {
        try {
            // Get items from temporary cart
            const tempCart = JSON.parse(localStorage.getItem('tempCart')) || [];
            
            if (tempCart.length === 0) {
                console.log("No items in temporary cart to transfer");
                return;
            }
        
            // Add each item to the user's cart
            for (const item of tempCart) {
                await fetch("http://localhost/api/shopping/add", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${userToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        product_id: item.id,
                        quantity: item.quantity
                    })
                });
            }
            
            // Clear the temporary cart after successful transfer
            localStorage.setItem('tempCart', JSON.stringify([]));
            console.log("Transferred temporary cart items to user account");
        } catch (error) {
            console.error("Error transferring temp cart to user account:", error);
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