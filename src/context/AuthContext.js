import { createContext, useState, useContext, useEffect } from 'react';
import { AuthService } from '../services/AuthService';
import { useNavigate } from 'react-router';


const AuthContext = createContext();
  
export const AuthProvider = ({ children }) => {

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const navigate = useNavigate();
    

    const handleLogin = async (e) => {
        e.preventDefault();

        const login = await AuthService.makeRequest({ 
            urlExtension: 'token/obtain/', 
            method: 'POST', 
            body: {
                'username': username,
                'password': password
            } 
        });
        if (login.error) {
            setUsernameError(login.data.detail);
            setPassword('');
        } else {
            localStorage.setItem('tokens', JSON.stringify(login.data));
            setIsLoggedIn(true);
            navigate('/');
        }
    }

    const handleLogout = async () => {
        const tokens = JSON.parse(localStorage.getItem("tokens"));
        const refresh = tokens?.refresh;

        if (!refresh) {
            localStorage.removeItem("tokens");
            window.location.href = '/user/login';
            setIsLoggedIn(false);
            return;
        }

        const logout = await AuthService.makeRequest({
            urlExtension: 'blacklist/',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: { refresh },
            skipRefresh: true,
        });

        if (logout.error) {
            console.log(logout);
        }

        localStorage.removeItem("tokens");
        navigate('/user/login');
        setIsLoggedIn(false);
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        const signup = await AuthService.makeRequest({ 
            urlExtension: 'user/create/', 
            method: 'POST', 
            body: {
                'username': username,
                'password': password,
                'email': email
            },
        });

        if (signup.error) {
            setEmailError(signup.data.email);
            setUsernameError(signup.data.detail);
            setPasswordError(signup.data.password);
            setPassword('');
        } else {
            handleLogin(e);
        }
    }

    useEffect(() => {
        AuthService.refreshTokens()
            .then((data) => {
                setIsLoggedIn(data);
            })
            .catch((err) => {
                console.log(err);
            })
            .finally(() => {
                setAuthLoading(false);
            })

        const syncLogout = (event) => {
            if (event.key === 'tokens' && event.newValue === null) {
                setIsLoggedIn(false);
            }
        };

        window.addEventListener("storage", syncLogout);

        return () => {
            window.removeEventListener("storage", syncLogout);
        };
    }, [])

    return (
        <AuthContext.Provider 
            value={{ 
                isLoggedIn,
                handleLogin, handleSignup, handleLogout, 
                authLoading,
                username, setUsername, 
                email, setEmail,
                password, setPassword, 
                showPassword, setShowPassword,
                emailError, usernameError, passwordError,
             }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};