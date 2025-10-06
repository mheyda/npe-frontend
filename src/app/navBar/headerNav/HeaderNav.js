import { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from "react-router-dom";
import SearchBar from '../../../features/explore/exploreSearch/SearchBar.js';
import capitalizeFirstLetters from '../../../utilityFunctions/capitalizeFirstLetters.js';
import './HeaderNav.css';


export default function HeaderNav({ isLoggedIn, authLoading, handleLogout, userNavOpen, setUserNavOpen }) {

    const location = useLocation();
    const currentPath = location.pathname;
    const menuRef = useRef();
    const toggleButtonRef = useRef();
    const [navPromptTarget, setNavPromptTarget] = useState(null);

    const isActive = (path) => currentPath === path;

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target) &&
                toggleButtonRef.current &&
                !toggleButtonRef.current.contains(event.target) &&
                !event.target.closest('.header-nav-modal') &&
                !event.target.closest('.header-nav-modal-overlay')
            ) {
                setUserNavOpen(false);
                setNavPromptTarget(null);
            }
        }

        if (userNavOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [userNavOpen, setUserNavOpen]);

    return (
        <nav className='header-nav-container'>
            <div className='header-nav'>
                <Link className='header-nav-logo' to={'/'}>
                    <img src={require('../../../assets/images/buffalo-head.png')} alt={'National Park Service Logo'} />
                </Link>
                <p className='header-nav-title'>National<br></br>Park<br></br>Explorer</p>
                <SearchBar />
                <button
                    ref={toggleButtonRef}
                    className='header-nav-toggler'
                    type='button'
                    onClick={() => setUserNavOpen(prev => !prev)}
                >
                    <i className="fa-solid fa-bars"></i>
                    <i className="fa-solid fa-user"></i>
                </button>
                {userNavOpen &&
                    <div ref={menuRef} className='header-nav-content'>
                        {authLoading ? (
                            <div className="header-nav-loading">
                                <div className="skeleton skeleton-line"></div>
                                <div className="skeleton skeleton-line"></div>
                                <div className="skeleton skeleton-line short"></div>
                            </div>
                        ) : isLoggedIn ? (
                            <>
                                <Link onClick={() => setUserNavOpen(false)} className={`header-nav-link ${isActive('/') ? 'active' : ''}`} to={'/'}>
                                    <i className="fa-solid fa-magnifying-glass"></i>
                                    <span>Explore</span>
                                    <i className="fa-solid fa-chevron-right chevron"></i>
                                </Link>

                                <Link onClick={() => setUserNavOpen(false)} className={`header-nav-link ${isActive('/user/favorites') ? 'active' : ''}`} to={'user/favorites'}>
                                    <i className="fa-regular fa-bookmark"></i>
                                    <span>Saved Parks</span>
                                    <i className="fa-solid fa-chevron-right chevron"></i>
                                </Link>

                                <Link onClick={() => setUserNavOpen(false)} className={`header-nav-link ${isActive('/user/visited') ? 'active' : ''}`} to={'user/visited'}>
                                    <i className="fa-regular fa-circle-check"></i>
                                    <span>Visited Parks</span>
                                    <i className="fa-solid fa-chevron-right chevron"></i>
                                </Link>

                                <div className="header-nav-separator"></div>

                                <Link onClick={() => setUserNavOpen(false)} className={`header-nav-link ${isActive('/user') ? 'active' : ''}`} to={'user'}>
                                    <i className="fa-regular fa-user"></i>
                                    <span>My Profile</span>
                                    <i className="fa-solid fa-chevron-right chevron"></i>
                                </Link>

                                <button 
                                    onClick={() => {
                                        handleLogout(); 
                                        setUserNavOpen(false);
                                    }} 
                                    className='header-nav-link'
                                >
                                    <i className="fa-solid fa-right-from-bracket"></i>
                                    <span>Log out</span>
                                    <i className="fa-solid fa-chevron-right chevron"></i>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link onClick={() => setUserNavOpen(false)} className={`header-nav-link ${isActive('/') ? 'active' : ''}`} to={'/'}>
                                    <i className="fa-solid fa-magnifying-glass"></i>
                                    <span>Explore</span>
                                    <i className="fa-solid fa-chevron-right chevron"></i>
                                </Link>

                                <button
                                    onClick={() => setNavPromptTarget('saved')}
                                    className={`header-nav-link ${isActive('/user/favorites') ? 'active' : ''}`}
                                >
                                    <i className="fa-regular fa-bookmark"></i>
                                    <span>Saved Parks</span>
                                    <i className="fa-solid fa-chevron-right chevron"></i>
                                </button>

                                <button
                                    onClick={() => setNavPromptTarget('visited')}
                                    className={`header-nav-link ${isActive('/user/visited') ? 'active' : ''}`}
                                >
                                    <i className="fa-regular fa-circle-check"></i>
                                    <span>Visited Parks</span>
                                    <i className="fa-solid fa-chevron-right chevron"></i>
                                </button>

                                <div className="header-nav-separator"></div>

                                <Link
                                    className={`header-nav-link ${isActive('/user/login') ? 'active' : ''}`}
                                    to={`/user/login`}
                                    onClick={() => setUserNavOpen(false)}
                                >
                                    <i className="fa-solid fa-right-to-bracket"></i>
                                    <span>Log in</span>
                                    <i className="fa-solid fa-chevron-right chevron"></i>
                                </Link>

                                <Link
                                    className={`header-nav-link ${isActive('/user/signup') ? 'active' : ''}`}
                                    to={`/user/signup`}
                                    onClick={() => setUserNavOpen(false)}
                                >
                                    <i className="fa-solid fa-user-plus"></i>
                                    <span>Sign up</span>
                                    <i className="fa-solid fa-chevron-right chevron"></i>
                                </Link>
                            </>
                        )}
                    </div>
                }
            </div>

            {navPromptTarget && (
                <>
                    <div
                        className="header-nav-modal-overlay"
                        onClick={() => setNavPromptTarget(null)}
                    ></div>
                    <div className="header-nav-modal">
                        <h3 className="header-nav-modal-title">
                            {capitalizeFirstLetters(navPromptTarget)} Parks
                        </h3>
                        <p className="header-nav-modal-message">
                            Log in to view or edit your {navPromptTarget} parks
                        </p>
                        <div className="header-nav-modal-buttons">
                            <Link
                                to={`/user/login?next=${navPromptTarget === 'saved' ? '/user/favorites' : '/user/visited'}`}
                                className="btn-login"
                                onClick={() => {
                                    setNavPromptTarget(null);
                                    setUserNavOpen(false);
                                }}
                            >
                                Log in
                            </Link>
                            <button
                                className="header-nav-modal-cancel-btn"
                                onClick={() => {
                                    setNavPromptTarget(null)
                                    setUserNavOpen(false);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </>
            )}
        </nav>
    );
}
