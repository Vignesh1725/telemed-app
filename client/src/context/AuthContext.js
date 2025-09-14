import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storeUser = localStorage.getItem('user')
        if (storeUser) {
            setUser(JSON.parse(storeUser))
        }
    }, [])

    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user))
        }
        else {
            localStorage.removeItem('user')
        }
    }, [user])

    const navigate = useNavigate();

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        navigate('/login');
    }

    return (
        <AuthContext.Provider value={{ user, setUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);