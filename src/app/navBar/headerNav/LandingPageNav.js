import { useState, useEffect, useRef } from 'react';
import { AuthService } from '../../../services/AuthService';
import { Link, useLocation } from 'react-router-dom';
import './LandingPageNav.css';

export default function LandingPageNav({ isLoggedIn, authLoading }) {
    
    const [user, setUser] = useState({});
    const [checkedAuth, setCheckedAuth] = useState(false);
    const firstRender = useRef(true);
    const location = useLocation();

    useEffect(() => {
        const getUserInfo = async () => {
            const userInfo = await AuthService.makeRequest({ urlExtension: 'user/info/', method: 'GET', body: null });

            if (userInfo.error) {
                setUser(false);
            } else {
                setUser(userInfo.data);
            }
            setCheckedAuth(true);
        }
        
        if (firstRender.current) {
            firstRender.current = false;
            getUserInfo();
        }

    }, []);

    if (location.pathname !== '/') {
        return null;
    }

    return (
        <nav className="landing-page-nav-container">
            <div className="landing-page-nav">
                {/* Logo / Home */}
                <Link className="landing-page-nav-logo" to="/">
                    <img 
                        src={require('../../../assets/images/buffalo-head.png')} 
                        alt="National Park Explorer Logo" 
                    />
                </Link>

                {/* Right-side actions */}
                <div className="landing-page-nav-actions">
                    {!checkedAuth ? (
                        // Skeleton loader
                        <div className="landing-page-skeleton"></div>
                    ) : isLoggedIn ? (
                        <span className="landing-page-welcome">
                            Welcome, {user?.first_name || user?.username || 'user'}
                        </span>
                    ) : (
                        <Link to="/user/login" className="landing-page-login-btn">
                            Log in
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
