import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./styles/root.css";

const Register = () => {
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault(); // Prevent page reload

        // Check if any field is empty
        if (!name || !surname || !email || !password) {
            setErrorMessage("All fields are required.");
            return;
        }

        try {
            // TODO: Replace with actual API URL when backend is ready
            const response = await fetch("http://backend/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    surname,
                    email,
                    password,
                    role: "customer"  // Correctly setting the role property here 
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Registration successful:", data);
                // TODO: Redirect user to login or homepage
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

                    {/* Show error message if fields are empty */}
                    {errorMessage && <p className="auth-error">{errorMessage}</p>}

                    <form className="auth-form" onSubmit={handleRegister}>
                        <input type="text" className="auth-input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                        <input type="text" className="auth-input" placeholder="Surname" value={surname} onChange={(e) => setSurname(e.target.value)} />
                        <input type="email" className="auth-input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <input type="password" className="auth-input" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <button type="submit" className="auth-button">Sign Up</button>
                    </form>

                    <Link to="/login" className="auth-toggle">
                        Already have an account? Log in
                    </Link>
                </div>
            </div>
            <Link to="/manager-login" className="auth-manager">Login or register as manager</Link>
        </div>
    );
};

export default Register;
