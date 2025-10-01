import { Link } from "react-router-dom";
import './FooterNav.css';


export default function FooterNav({ loggedIn, handleLogout, userNavOpen, setUserNavOpen }) {

    return (
        <nav className='footer-nav-container'>
            <div className='footer-nav'>
                { loggedIn
                    ?   <>
                            <Link className='footer-nav-link' to={'/'}>
                                <i className="fa-solid fa-magnifying-glass"></i>
                                <span>Explore</span>
                            </Link>
                            <Link className='footer-nav-link' to={'/user/favorites'}>
                                <i className="fa-regular fa-bookmark"></i>
                                <span>Saved</span>
                            </Link>
                            <Link className='footer-nav-link' to={'user/visited'}>
                                <i className="fa-regular fa-circle-check"></i>
                                <span>Visited</span>
                            </Link>
                            <button 
                                className='footer-nav-menu-toggler footer-nav-link' 
                                type='button' 
                                onClick={() => setUserNavOpen(prev => !prev)} 
                                aria-label="Toggle account menu"
                            >
                                <i className="fa-regular fa-user"></i>
                                <span>Account</span>
                            </button>
                        </>
                    :   <>
                            <Link className='footer-nav-link' to={'/'}>
                                <i className="fa-solid fa-magnifying-glass"></i>
                                <span>Explore</span>
                            </Link>
                                <Link className='footer-nav-link' to={`/user/login?next=${encodeURIComponent('/user/favorites')}`}>
                                <i className="fa-regular fa-bookmark"></i>
                                <span>Saved</span>
                            </Link>
                            <Link className='footer-nav-link' to={`/user/login?next=${encodeURIComponent('/user/visited')}`}>
                                <i className="fa-regular fa-circle-check"></i>
                                <span>Visited</span>
                            </Link>
                            <button 
                                className='footer-nav-menu-toggler footer-nav-link' 
                                type='button' 
                                onClick={() => setUserNavOpen(prev => !prev)} 
                                aria-label="Toggle account menu"
                            >
                                <i className="fa-regular fa-user"></i>
                                <span>Account</span>
                            </button>
                        </>
                }
                
                <div className={`footer-nav-menu-content ${userNavOpen ? 'open' : ''}`}>
                    {loggedIn ? (
                        <>
                        <Link to="/user" onClick={() => setUserNavOpen(false)}>
                            <i className="fa-regular fa-address-card"></i>
                            <span className="menu-label">My Profile</span>
                            <i className="fa-solid fa-chevron-right chevron"></i>
                        </Link>
                        <button  onClick={() => {setUserNavOpen(false); handleLogout()}}>
                            <i className="fa-solid fa-right-from-bracket"></i>
                            <span className="menu-label">Log out</span>
                            <i className="fa-solid fa-chevron-right chevron"></i>
                        </button>
                        </>
                    ) : (
                        <>
                            <Link 
                                to={`/user/login`} 
                                onClick={() => setUserNavOpen(false)}
                            >
                                <i className="fa-solid fa-right-to-bracket"></i>
                                <span className="menu-label">Log in</span>
                                <i className="fa-solid fa-chevron-right chevron"></i>
                            </Link>
                            <Link 
                                to={`/user/signup`} 
                                onClick={() => setUserNavOpen(false)}
                            >
                                <i className="fa-solid fa-user-plus"></i>
                                <span className="menu-label">Sign up</span>
                                <i className="fa-solid fa-chevron-right chevron"></i>
                            </Link>
                        </>
                    )}
                    </div>
                {userNavOpen && <div className="footer-nav-overlay" onClick={() => setUserNavOpen(false)}></div>}
            </div>
        </nav>
    );
}