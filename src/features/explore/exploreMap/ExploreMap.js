import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import ManualSlideshow from '../../../common/slideshow/ManualSlideshow';
import { selectFavorites, toggleFavorite } from '../../favorites/favoritesSlice';
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

export default function ExploreMap({ parks }) {
    const favorites = useSelector(selectFavorites);
    const dispatch = useDispatch();
    const markerRefs = useRef({});

    const storedCenter = sessionStorage.getItem('center');
    const storedZoom = sessionStorage.getItem('zoom');
    const storedCurrentPark = sessionStorage.getItem('currentPark');
    
    const initialCenter = storedCenter ? storedCenter.split(',').map(Number) : [38, -97];
    const initialZoom = storedZoom ? parseInt(storedZoom, 10) : 3;
    const initialCurrentPark = storedCurrentPark ? JSON.parse(storedCurrentPark).name : null;
    
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

    const onMarkerClick = (parkName) => {
        currentParkRef.current = parkName;
        sessionStorage.setItem('currentPark', JSON.stringify({ name: parkName }));
    };

    const onPopupClose = () => {
        currentParkRef.current = null;
        sessionStorage.removeItem('currentPark');
    };

    return (
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
                                    onClick={() => dispatch(toggleFavorite({ id: park.id }))}
                                    className="park-toggle-favorite"
                                >
                                    {favorites && favorites.includes(park.id) ? (
                                        <i className="fa-solid fa-heart selected"></i>
                                    ) : (
                                        <i className="fa-solid fa-heart"></i>
                                    )}
                                </button>
                            </Popup>
                        </Marker>
                    );
                })
            }
        </MapContainer>
    );
}
