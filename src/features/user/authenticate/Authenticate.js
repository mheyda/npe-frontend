import './Authenticate.css';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Login from './login/Login';
import Signup from './signup/Signup';
import NotFound from '../../notFound/NotFound';
import { refreshTokens, makeRequest } from '../../../makeRequest';


export default function Authenticate() {

    const { format } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const nextPath = searchParams.get('next') || '/';

    const [checkedAuth, setCheckedAuth] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');


    const handleLogin = async (e) => {
        e.preventDefault();

        const login = await makeRequest({ 
            urlExtension: 'token/obtain/', 
            method: 'POST', 
            body: {
                'username': username,
                'password': password
            },
            authRequired: false,
        });
        if (login.error) {
            setUsernameError(login.data.detail);
            setPassword('');
        } else {
            localStorage.setItem('tokens', JSON.stringify(login.data));
            window.location.href = nextPath;
        }
    }

    const handleSignup = async (e) => {
        e.preventDefault();
        const signup = await makeRequest({ 
            urlExtension: 'user/create/', 
            method: 'POST', 
            body: {
                'username': username,
                'password': password,
                'email': email
            },
            authRequired: false,
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

    // Check user authentication
    useEffect(() => {
        const checkAuth = async () => {
            const loggedIn = await refreshTokens();
            if (loggedIn) {
                navigate(nextPath);
            } else {
                setCheckedAuth(true);
            }
        }
        checkAuth();
    }, [dispatch, navigate, nextPath]);

    
    if (format === 'login' && checkedAuth) {
        // User wants to login and is not already logged in
        return (
            <Login 
                usernameError={usernameError}
                passwordError={passwordError}
                username={username} 
                setUsername={setUsername} 
                password={password} 
                setPassword={setPassword}
                showPassword={showPassword} 
                setShowPassword={setShowPassword} 
                handleLogin={handleLogin} 
            />
        );
    } else if (format === 'signup' && checkedAuth) {
        // User wants to sign up and is not currently logged in
        return (
            <Signup 
                emailError={emailError}
                usernameError={usernameError}
                passwordError={passwordError}
                email={email}
                setEmail={setEmail}
                username={username}
                setUsername={setUsername}
                password={password}
                setPassword={setPassword}
                showPassword={showPassword} 
                setShowPassword={setShowPassword} 
                handleSignup={handleSignup}
            />
        );
    } else if (checkedAuth) {
        // URL does not match login or signup
        return (
            <NotFound />
        )
    }
}
