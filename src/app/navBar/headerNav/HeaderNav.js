import { useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import SearchBar from '../../../features/explore/exploreSearch/SearchBar.js';
import './HeaderNav.css';


export default function HeaderNav({ loggedIn, handleLogout, userNavOpen, setUserNavOpen }) {

    const menuRef = useRef();

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setUserNavOpen(false);
            }
        }

        if (userNavOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        // Cleanup
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
                <button className='header-nav-toggler' type='button' onClick={() => setUserNavOpen(prev => !prev)} >
                    <i className="fa-solid fa-bars"></i>
                    <i className="fa-solid fa-user"></i>
                </button>
                {userNavOpen &&
                    <div ref={menuRef} className='header-nav-content'>
                        {loggedIn ? (
                            <>
                            <Link onClick={() => setUserNavOpen(false)} className='header-nav-link' to={'/'}>
                                <i className="fa-solid fa-magnifying-glass"></i>
                                <span>Explore</span>
                                <i className="fa-solid fa-chevron-right chevron"></i>
                            </Link>

                            <Link onClick={() => setUserNavOpen(false)} className='header-nav-link' to={'user/favorites'}>
                                <i className="fa-regular fa-bookmark"></i>
                                <span>Saved Parks</span>
                                <i className="fa-solid fa-chevron-right chevron"></i>
                            </Link>

                            <Link onClick={() => setUserNavOpen(false)} className='header-nav-link' to={'user/visited'}>
                                <i className="fa-regular fa-circle-check"></i>
                                <span>Visited Parks</span>
                                <i className="fa-solid fa-chevron-right chevron"></i>
                            </Link>

                            <div className="header-nav-separator"></div>

                            <Link onClick={() => setUserNavOpen(false)} className='header-nav-link' to={'user'}>
                                <i className="fa-regular fa-user"></i>
                                <span>My Profile</span>
                                <i className="fa-solid fa-chevron-right chevron"></i>
                            </Link>

                            <button onClick={handleLogout} className='header-nav-link'>
                                <i className="fa-solid fa-right-from-bracket"></i>
                                <span>Log out</span>
                                <i className="fa-solid fa-chevron-right chevron"></i>
                            </button>
                            </>
                        ) : (
                            <>
                                <Link onClick={() => setUserNavOpen(false)} className='header-nav-link' to={'/'}>
                                    <i className="fa-solid fa-magnifying-glass"></i>
                                    <span>Explore</span>
                                    <i className="fa-solid fa-chevron-right chevron"></i>
                                </Link>

                                <Link 
                                    onClick={() => setUserNavOpen(false)} 
                                    className='header-nav-link'
                                    to={`/user/login?next=${encodeURIComponent('/user/favorites')}`}
                                >
                                    <i className="fa-regular fa-bookmark"></i>
                                    <span>Saved Parks</span>
                                    <i className="fa-solid fa-chevron-right chevron"></i>
                                </Link>

                                <Link 
                                    onClick={() => setUserNavOpen(false)} 
                                    className='header-nav-link' 
                                    to={`/user/login?next=${encodeURIComponent('/user/visited')}`}
                                >
                                    <i className="fa-regular fa-circle-check"></i>
                                    <span>Visited Parks</span>
                                    <i className="fa-solid fa-chevron-right chevron"></i>
                                </Link>

                                <div className="header-nav-separator"></div>

                                <Link 
                                    className='header-nav-link'
                                    to={`user/login`}
                                    onClick={() => setUserNavOpen(false)}>
                                    <i className="fa-solid fa-right-to-bracket"></i>
                                    <span>Log in</span>
                                    <i className="fa-solid fa-chevron-right chevron"></i>
                                </Link>
                                <Link 
                                    className='header-nav-link'
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
        </nav>
    );
}