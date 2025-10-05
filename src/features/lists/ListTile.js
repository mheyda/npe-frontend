import './ListTile.css';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { selectFavorites, toggleFavorite } from '../favorites/favoritesSlice';
import { selectVisited, toggleVisited } from '../visited/visitedSlice';
import { useSelector, useDispatch } from 'react-redux';


export default function ListTile({ park }) {

    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    
    const dispatch = useDispatch();
    const favorites = useSelector(selectFavorites);
    const visited = useSelector(selectVisited);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        if (menuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuOpen]);

    // Format states string
    let states = park.states.split(',').join(', ');
    const statesLength = park.states.split(',').length;
    if (statesLength > 2) {
        states = states.split(',').slice(0, 3).join(', ') + ', & More'
    }

    // Action handlers (placeholder)
    const handleToggleSaved = () => {
        dispatch(toggleFavorite({ id: park.id }));
        setMenuOpen(false);
    };

    const handleToggleVisited = () => {
        dispatch(toggleVisited({ id: park.id }));
        setMenuOpen(false);
    };

    return (
        <li className="list-tile">
            <div className="list-tile-content">
                <Link
                    to={`/${park.fullName}/${park.parkCode}`}
                    className="list-tile-link"
                    onClick={() => sessionStorage.setItem('currentPark', JSON.stringify(park))}
                >
                    <div className="list-tile-image-container">
                        <img src={park.images[0]?.url} alt={park.images[0]?.altText || park.fullName} className="list-tile-thumbnail" />
                    </div>
                    <div className="list-tile-info">
                        <h3 className="list-tile-title">{park.fullName}</h3>
                        <p className="list-tile-states">{states}</p>
                    </div>
                </Link>

                <button
                    className="list-tile-menu-button"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="More actions"
                >
                    <i className="fa-solid fa-ellipsis-vertical"></i>
                </button>
            </div>

            {/* Menu rendering */}
            {menuOpen && (
                <>
                    <div className="list-tile-overlay" onClick={() => setMenuOpen(false)}></div>
                    <div className="list-tile-modal" ref={menuRef}>
                        <div className="list-tile-modal-header">
                            <div className='list-tile-modal-title'>
                                {park.fullName}
                            </div>
                            <button
                                className="list-tile-modal-close-btn"
                                aria-label="Close menu"
                                onClick={() => setMenuOpen(false)}
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        <div className='list-tile-modal-content'>
                            <button onClick={handleToggleVisited} title="Unmark as visited">
                                <i className="fa-solid fa-circle-xmark"></i>
                                <span className="menu-label">Remove from visited parks</span>
                            </button>
                            <button onClick={handleToggleSaved} title={favorites && favorites.includes(park.id) ? "Unsave this park" : "Save this park"}>
                                {favorites && favorites.includes(park.id) ? (
                                    <i className="fa-solid fa-bookmark"></i>
                                ) : (
                                    <i className="fa-regular fa-bookmark"></i>
                                )}
                                <span className="menu-label">
                                    {favorites && favorites.includes(park.id) ? "Unsave this park" : "Save this park"}
                                </span>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </li>
    );
}