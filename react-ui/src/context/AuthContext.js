import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null); // Manage token state
    const [role, setRole] = useState(null); // Manage role state

    // Debugging: Log when the token is set
    const debugSetToken = (newToken) => {
        console.log("Setting token:", newToken); // Log the new token
        setToken(newToken); // Update the token state
    };

    // Debugging: Log when the token is accessed
    console.log("Current token in AuthContext:", token);

    return (
        <AuthContext.Provider value={{ token, setToken: debugSetToken, role, setRole }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};


export const useSetRole = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useSetRole must be used within an AuthProvider");
    }
    return context.setRole;
};

