import './ListTile.css';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { selectFavorites, toggleFavorite } from './favorites/favoritesSlice';
import { selectVisited, toggleVisited } from './visited/visitedSlice';
import { useSelector, useDispatch } from 'react-redux';

export default function ListTile({ park, list }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);
    const [modalPosition, setModalPosition] = useState('down');
    const menuRef = useRef(null);
    const buttonRef = useRef(null);

    const dispatch = useDispatch();
    const favorites = useSelector(selectFavorites);
    const visited = useSelector(selectVisited);
    
    const openMenu = () => {
        setModalVisible(true);
        setMenuOpen(true);
    };

    const closeMenu = () => {
        setAnimateIn(false);
        setMenuOpen(false);
        setTimeout(() => setModalVisible(false), 200);
    };

    useEffect(() => {
        if (modalVisible) {
            // Allow next tick to add animateIn to trigger CSS transition
            const timeout = setTimeout(() => setAnimateIn(true), 10);
            return () => clearTimeout(timeout);
        } else {
            setAnimateIn(false);
        }
    }, [modalVisible]);

    useEffect(() => {
        if (menuOpen && buttonRef.current && menuRef.current) {
            const buttonRect = buttonRef.current.getBoundingClientRect();
            const modalHeight = menuRef.current.offsetHeight;
            const viewportHeight = window.innerHeight;
            const spaceBelow = viewportHeight - buttonRect.bottom;

            if (spaceBelow < modalHeight + 16) {
                setModalPosition('up');
            } else {
                setModalPosition('down');
            }
        }
    }, [menuOpen]);

    let states = park.states.split(',').join(', ');
    const statesLength = park.states.split(',').length;
    if (statesLength > 2) {
        states = states.split(',').slice(0, 3).join(', ') + ', & More';
    }

    const handleToggleSaved = () => {
        dispatch(toggleFavorite({ id: park.id }));
        closeMenu();
    };

    const handleToggleVisited = () => {
        dispatch(toggleVisited({ id: park.id }));
        closeMenu();
    };

    const renderModalContent = () => {
        if (list === 'favorites') {
            return (
                <>
                    <button onClick={handleToggleSaved} title={favorites && favorites.includes(park.id) ? "Unsave this park" : "Save this park"}>
                        {favorites && favorites.includes(park.id) && (
                            <i className="fa-solid fa-circle-xmark"></i>
                        )}
                        <span className="menu-label">
                            Unsave this park
                        </span>
                    </button>
                    <button onClick={handleToggleVisited} title={visited && visited.includes(park.id) ? "Unmark as visited" : "Mark as visited"}>
                        {visited && visited.includes(park.id) ? (
                            <i className="fa-regular fa-circle-xmark"></i>
                        ) : (
                            <i className="fa-regular fa-circle-check"></i>
                        )}
                        <span className="menu-label">
                            {visited && visited.includes(park.id) ? "Unmark as visited" : "Mark as visited"}
                        </span>
                    </button>
                </>
            )
        }

        if (list === 'visited') {
            return (
                <>
                    <button onClick={handleToggleVisited} title={visited && visited.includes(park.id) ? "Unmark as visited" : "Mark as visited"}>
                        {visited && visited.includes(park.id) && (
                            <i className="fa-solid fa-circle-xmark"></i>
                        )}
                        <span className="menu-label">
                            Unmark as visited
                        </span>
                    </button>
                    <button onClick={handleToggleSaved} title={favorites && favorites.includes(park.id) ? "Unsave this park" : "Save this park"}>
                        {favorites && favorites.includes(park.id) ? (
                            <i className="fa-regular fa-circle-xmark"></i>
                        ) : (
                            <i className="fa-regular fa-bookmark"></i>
                        )}
                        <span className="menu-label">
                            {favorites && favorites.includes(park.id) ? "Unsave this park" : "Save this park"}
                        </span>
                    </button>
                </>
            )
        }
    }

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
                    onClick={() => (menuOpen ? closeMenu() : openMenu())}
                    aria-label="More actions"
                    ref={buttonRef}
                >
                    <i className="fa-solid fa-ellipsis-vertical"></i>
                </button>
            </div>

            {modalVisible && (
                <>
                    <div
                        className={`list-tile-overlay ${menuOpen ? 'fade-in' : 'fade-out'}`}
                        onClick={closeMenu}
                    ></div>
                    <div
                        className={`list-tile-modal ${modalPosition} ${animateIn ? 'slide-fade-in' : 'slide-fade-out'}`}
                        ref={menuRef}
                    >
                        <div className="list-tile-modal-header">
                            <div className='list-tile-modal-title'>
                                {park.fullName}
                            </div>
                            <button
                                className="list-tile-modal-close-btn"
                                aria-label="Close menu"
                                onClick={closeMenu}
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        <div className='list-tile-modal-content'>
                            {/* <button onClick={handleToggleVisited} title="Unmark as visited">
                                <i className="fa-solid fa-circle-xmark"></i>
                                <span className="menu-label">Remove from visited parks</span>
                            </button> */}

                            {renderModalContent()}
                        </div>
                    </div>
                </>
            )}
        </li>
    );
}
