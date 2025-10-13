import { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import PropTypes from "prop-types";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = Cookies.get("user");

        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));                
            } catch {
                Cookies.remove("user");
            }
        }
        setLoading(false);
    }, []);

    const login = (userData, authToken) => {
        Cookies.set("user", JSON.stringify(userData), { expires: 1 });
        setUser(userData);
        setToken(authToken);
    };

    const logout = () => {
        Cookies.remove("user");
        setUser(null);
        setToken(null);
    };

    const refreshUser = async () => {
        if (!token) return;
        try {
            const { data: refreshedUser } = await api.get("/alunos/me", {
                headers: { Authorization: `Bearer ${token}` },
            });
            Cookies.set("user", JSON.stringify(refreshedUser), { expires: 1 });
            setUser(refreshedUser);
        } catch (error) {
            console.error("Erro ao atualizar usuário:", error);
            logout();
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export { AuthContext };