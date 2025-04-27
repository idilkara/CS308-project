import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginRegister.css";

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [roleType, setRoleType] = useState(""); // Changed to empty string to detect when no role is selected
    const navigate = useNavigate(); // Add useNavigate hook for redirection

    const handleRegister = async (e) => {
        e.preventDefault(); // Prevent page reload

        // Reset error messages
        setErrorMessage("");
        
        // Check if role is selected
        if (!roleType) {
            setErrorMessage("Please select a role");
            return;
        }

        // Check if any field is empty
        if (!name || !email || !password) {
            setErrorMessage("All fields are required.");
            return;
        }

        try {
            const response = await fetch("http://localhost/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password,
                    role: roleType
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Registration successful:", data);
                // Set success message
                setSuccessMessage("Registration successful! Redirecting to login page...");
                
                // Redirect to login page after 2 seconds
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            } else {
                // Check specifically for email already registered error
                if (data.message && data.message.includes("email already exists") || 
                    data.message && data.message.includes("already registered") ||
                    response.status === 409) {
                    setErrorMessage("This email is already registered. Please use a different email or try logging in.");
                } else {
                    // Generic error message for other failures
                    setErrorMessage(data.message || "Registration failed.");
                }
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
                            type="button" // Add type="button" to prevent form submission
                            className={`toggle-button ${roleType === "customer" ? "active" : ""}`}
                            onClick={() => setRoleType("customer")}
                        >
                            Customer
                        </button>
                        <button
                            type="button" // Add type="button" to prevent form submission
                            className={`toggle-button ${roleType === "sales_manager" ? "active" : ""}`}
                            onClick={() => setRoleType("sales_manager")}
                        >
                            Sales Manager
                        </button>
                        <button
                            type="button" // Add type="button" to prevent form submission
                            className={`toggle-button ${roleType === "product_manager" ? "active" : ""}`}
                            onClick={() => setRoleType("product_manager")}
                        >
                            Product Manager
                        </button>
                    </div>

                    {/* Error message */}
                    {errorMessage && <p className="auth-error">{errorMessage}</p>}
                    
                    {/* Success message */}
                    {successMessage && <p className="auth-success">{successMessage}</p>}

                    <form className="auth-form" onSubmit={handleRegister}>
                        <input 
                            type="text" 
                            className="auth-input" 
                            placeholder="Name" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                        />
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
                        <button type="submit" className="auth-button">Sign Up</button>
                    </form>

                    <Link to="/login" className="auth-toggle">
                        Already have an account? Log in
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;