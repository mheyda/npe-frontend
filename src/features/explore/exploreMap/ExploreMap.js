import { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import ManualSlideshow from '../../../common/slideshow/ManualSlideshow';
import { selectVisited, toggleVisited } from '../../lists/visited/visitedSlice';
import { selectFavorites, toggleFavorite } from '../../lists/favorites/favoritesSlice';
import './ExploreMap.css';

function MapEventHandler({ onMoveEnd }) {
    useMapEvents({
        moveend: (event) => {
            onMoveEnd(event.target);
        },
    });
    return null;
}

function formatStates(statesString) {
    const statesArray = statesString.split(',');
    if (statesArray.length > 3) {
        return statesArray.slice(0, 3).join(', ') + ', & More';
    }
    return statesArray.join(', ');
}

export default function ExploreMap({ parks, searchMessage, filterMessage, filterCount, areFiltersEmpty, onOpenFilters }) {
    const favorites = useSelector(selectFavorites);
    const visited = useSelector(selectVisited);
    const dispatch = useDispatch();
    const markerRefs = useRef({});

    const storedCenter = sessionStorage.getItem('center');
    const storedZoom = sessionStorage.getItem('zoom');
    const storedCurrentPark = sessionStorage.getItem('currentPark');
    
    const initialCenter = storedCenter ? storedCenter.split(',').map(Number) : [38, -97];
    const initialZoom = storedZoom ? parseInt(storedZoom, 10) : 3;
    const initialCurrentPark = useMemo(() => {
        if (storedCurrentPark) {
            return JSON.parse(storedCurrentPark).name;
        }
        return null;
    }, [storedCurrentPark]);
    
    const currentParkRef = useRef(initialCurrentPark);
    
    const onMoveEnd = (map) => {
        const center = map.getCenter();
        sessionStorage.setItem('center', `${center.lat.toFixed(2)},${center.lng.toFixed(2)}`);
        sessionStorage.setItem('zoom', map.getZoom());
    };

    useEffect(() => {
        if (!initialCurrentPark) return;

        const openPopupWithRetry = async (maxRetries = 10, interval = 100) => {
            for (let i = 0; i < maxRetries; i++) {
            const marker = markerRefs.current[initialCurrentPark];
            if (marker) {
                marker.openPopup();
                break;
            }
            await new Promise((resolve) => setTimeout(resolve, interval));
            }
        };

        openPopupWithRetry();
    }, [parks, initialCurrentPark]);

    useEffect(() => {
        const setVH = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };

        setVH();
        window.addEventListener('resize', setVH);

        return () => {
            window.removeEventListener('resize', setVH);
        };
    }, []);

    const onMarkerClick = (parkName) => {
        currentParkRef.current = parkName;
        sessionStorage.setItem('currentPark', JSON.stringify({ name: parkName }));
    };

    const onPopupClose = () => {
        currentParkRef.current = null;
        sessionStorage.removeItem('currentPark');
    };

    return (
        <div>
            {/* Message and Filter Button/Box */}
            <div className='search-result-string map'>
                {searchMessage && <div>{searchMessage}</div>}
                <div>{filterMessage}</div>
            </div>
            <button 
                className={areFiltersEmpty ? 'filter-btn map' : 'filter-btn active map'} 
                onClick={onOpenFilters}
                >
                Filter {filterCount > 0 ? `(${filterCount})` : ''}
            </button>
            <MapContainer 
                className={'map-container'} 
                center={initialCenter} 
                zoom={initialZoom} 
                scrollWheelZoom={true} 
                maxBounds={[[-90, -360], [90, 360]]} 
                maxBoundsViscosity={1}
            >
                <MapEventHandler onMoveEnd={onMoveEnd} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {parks && parks.length > 0 &&
                    parks.map((park, index) => {
                        const states = formatStates(park.states);

                        return (
                            <Marker 
                                key={park.id} 
                                position={[park.latitude, park.longitude]}
                                ref={(ref) => {
                                    if (ref) markerRefs.current[park.name] = ref;
                                }}
                                eventHandlers={{
                                    click: () => onMarkerClick(park.name),
                                    popupclose: () => onPopupClose(),
                                }}
                            >
                                <Popup className="popup-container">
                                    <Link
                                        to={`${park.fullName}/${park.parkCode}`}
                                        onClick={() => sessionStorage.setItem('currentPark', JSON.stringify(park))}
                                    >
                                        <div className="popup-img-container">
                                            <ManualSlideshow images={park.images} />
                                        </div>
                                        <div className="popup-content">
                                            <p className="popup-title">{park.name}<br />{park.designation}</p>
                                            <p className="popup-states">{states}</p>
                                        </div>
                                    </Link>
                                    <button 
                                        onClick={() => dispatch(toggleVisited({id: park.id}))} 
                                        className='park-toggle-visited'
                                        title={visited && visited.includes(park.id) ? "Unmark as visited" : "Mark as visited"}
                                    >
                                        {visited && visited.includes(park.id) ?
                                        <span className="fa-stack">
                                            <i className="fa-solid fa-circle fa-stack-2x selected"></i>
                                            <i className="fa-solid fa-check fa-stack-1x selected"></i>
                                        </span> :
                                        <span className="fa-stack">
                                            <i className="fa-solid fa-circle fa-stack-2x"></i>
                                            <i className="fa-solid fa-check fa-stack-1x"></i>
                                        </span>}
                                    </button>
                                    <button 
                                        onClick={() => dispatch(toggleFavorite({id: park.id}))} 
                                        className='park-toggle-favorite'
                                        title={favorites && favorites.includes(park.id) ? "Unsave this park" : "Save this park"}
                                    >
                                        {favorites && favorites.includes(park.id) ?
                                        <span className="fa-stack">
                                            <i className="fa-solid fa-circle fa-stack-2x selected"></i>
                                            <i className="fa-solid fa-bookmark fa-stack-1x selected"></i>
                                        </span> :
                                        <span className="fa-stack">
                                            <i className="fa-solid fa-circle fa-stack-2x"></i>
                                            <i className="fa-regular fa-bookmark fa-stack-1x"></i>
                                        </span>}
                                    </button>
                                </Popup>
                            </Marker>
                        );
                    })
                }
            </MapContainer>
        </div>
    );
}
