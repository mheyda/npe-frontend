import { useState } from 'react';
import { Link, useLocation } from "react-router-dom";
import capitalizeFirstLetters from '../../../utilityFunctions/capitalizeFirstLetters';
import './FooterNav.css';

export default function FooterNav({ isLoggedIn, authLoading, handleLogout, userNavOpen, setUserNavOpen }) {

    const location = useLocation();
    const [navPromptTarget, setNavPromptTarget] = useState(null);

    const skeletonButtons = [1, 2, 3, 4].map((_, i) => (
        <div key={i} className="skeleton-nav-button" aria-hidden="true">
            <div className="skeleton skeleton-icon"></div>
            <div className="skeleton skeleton-text"></div>
        </div>
    ));

    if (authLoading) {
        return (
            <nav className='footer-nav-container'>
                <div className='footer-nav'>
                {skeletonButtons}
                </div>
            </nav>
        );
    }

    return (
        <nav className='footer-nav-container'>
            <div className='footer-nav'>
                {isLoggedIn ? (
                    <>
                        <Link className={`footer-nav-link ${location.pathname === '/' ? 'active' : ''}`} to={'/'}>
                            <i className="fa-solid fa-magnifying-glass"></i>
                            <span>Explore</span>
                        </Link>
                        <Link className={`footer-nav-link ${location.pathname === '/user/favorites' ? 'active' : ''}`} to={'/user/favorites'}>
                            <i className="fa-regular fa-bookmark"></i>
                            <span>Saved</span>
                        </Link>
                        <Link className={`footer-nav-link ${location.pathname === '/user/visited' ? 'active' : ''}`} to={'/user/visited'}>
                            <i className="fa-regular fa-circle-check"></i>
                            <span>Visited</span>
                        </Link>
                        <button
                            className={`footer-nav-menu-toggler footer-nav-link ${location.pathname === '/user' ? 'active' : ''}`}
                            type='button'
                            onClick={() => setUserNavOpen(prev => !prev)}
                            aria-label="Toggle account menu"
                        >
                            <i className="fa-regular fa-user"></i>
                            <span>Account</span>
                        </button>
                    </>
                ) : (
                    <>
                        <Link className={`footer-nav-link ${location.pathname === '/' ? 'active' : ''}`} to={'/'}>
                            <i className="fa-solid fa-magnifying-glass"></i>
                            <span>Explore</span>
                        </Link>
                        <button
                            className="footer-nav-link"
                            onClick={() => {
                                setNavPromptTarget('saved');
                                setUserNavOpen(true);
                            }}
                        >
                            <i className="fa-regular fa-bookmark"></i>
                            <span>Saved</span>
                        </button>
                        <button
                            className="footer-nav-link"
                            onClick={() => {
                                setNavPromptTarget('visited');
                                setUserNavOpen(true);
                            }}
                        >
                            <i className="fa-regular fa-circle-check"></i>
                            <span>Visited</span>
                        </button>
                        <Link
                            className={`footer-nav-link ${location.pathname === '/user/login' || location.pathname === '/user/signup' ? 'active' : ''}`}
                            to="/user/login"
                        >
                            <i className="fa-regular fa-user"></i>
                            <span>Log in</span>
                        </Link>
                    </>
                )}

                <div className={`footer-nav-menu-content ${userNavOpen ? 'open' : ''}`}>
                    <button
                        className="footer-nav-close-btn"
                        aria-label="Close menu"
                        onClick={() => setUserNavOpen(false)}
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                    {isLoggedIn ? (
                        <div className='logged-in'>
                            <h3 className='footer-nav-menu-heading'>My Account</h3>
                            <Link to="/user" onClick={() => setUserNavOpen(false)}>
                                <i className="fa-regular fa-address-card"></i>
                                <span className="menu-label">Profile</span>
                                <i className="fa-solid fa-chevron-right chevron"></i>
                            </Link>
                            <button onClick={() => { setUserNavOpen(false); handleLogout(); }}>
                                <i className="fa-solid fa-right-from-bracket"></i>
                                <span className="menu-label">Log out</span>
                                <i className="fa-solid fa-chevron-right chevron"></i>
                            </button>
                        </div>
                    ) : (
                        <div className='logged-out'>
                            <h3 className='footer-nav-menu-heading'>{capitalizeFirstLetters(navPromptTarget)} Parks</h3>
                            <p className="login-prompt-message">
                                Log in to view or edit your {navPromptTarget} parks
                            </p>
                            <div className='login-prompt-btn'>
                                <Link
                                    to={`/user/login?next=${navPromptTarget === 'saved' ? '/user/favorites' : '/user/visited'}`}
                                    className="btn-login"
                                    onClick={() => setUserNavOpen(false)}
                                >
                                    Log in
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {userNavOpen && (
                    <div className="footer-nav-overlay" onClick={() => setUserNavOpen(false)}></div>
                )}
            </div>
        </nav>
    );
}
