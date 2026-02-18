import { createContext, useState, useContext, useEffect } from 'react';
import { AuthService } from '../services/AuthService';
import { useNavigate, useLocation } from 'react-router';
import { clearFavorites } from '../features/lists/favorites/favoritesSlice';
import { clearVisited } from '../features/lists/visited/visitedSlice';
import { useDispatch } from 'react-redux';


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
    const dispatch = useDispatch();
    const location = useLocation();
    

    const handleLogin = async (e) => {
        e.preventDefault();

        const params = new URLSearchParams(location.search);
        const nextPath = params.get('next') || '/explore';

        const login = await AuthService.makeRequest({ 
            urlExtension: 'token/obtain/', 
            method: 'POST', 
            body: {
                'username': username,
                'password': password
            } 
        });

        if (login.error) {
            setUsernameError(login.data?.detail || "Invalid username or password");
            setPassword('');
        } else {
            sessionStorage.setItem('tokens', JSON.stringify(login.data));
            setIsLoggedIn(true);
            window.location.href = nextPath;
        }
    };

    const handleLogout = async () => {
        const tokens = JSON.parse(sessionStorage.getItem("tokens"));
        const refresh = tokens?.refresh;

        if (!refresh) {
            sessionStorage.removeItem("tokens");
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
        });

        if (logout.error) {
            console.error('[AuthContext] Error logging out');
        }

        dispatch(clearFavorites());
        dispatch(clearVisited());
        sessionStorage.removeItem("tokens");
        navigate('/user/login');
        setIsLoggedIn(false);
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        const params = new URLSearchParams(location.search);
        const next = params.get('next') || '/explore';

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
            const currentPath = location.pathname;
            navigate(`${currentPath}?next=${encodeURIComponent(next)}`, { replace: true });
            handleLogin(e);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const refreshAuth = async () => {
            console.log("[AuthContext] Refreshing tokens...");
            const success = await AuthService.refreshTokens();

            if (isMounted) {
                console.log("[AuthContext] Setting isLoggedIn to", success);
                setIsLoggedIn(success);
                setAuthLoading(false);
            }
        };

        refreshAuth();

        const syncLogout = (event) => {
            if (event.key === 'tokens' && event.newValue === null) {
                setIsLoggedIn(false);
            }
        };

        window.addEventListener("storage", syncLogout);

        return () => {
            isMounted = false;
            window.removeEventListener("storage", syncLogout);
        };
    }, []);

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