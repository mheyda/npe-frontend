import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import ManualSlideshow from '../../../common/slideshow/ManualSlideshow';
import { selectFavorites, toggleFavorite } from '../../favorites/favoritesSlice';
import './ExploreMap.css';

function MapEventHandler() {
    useMapEvents({
        moveend: (event) => {
            const map = event.target;
            const center = map.getCenter();
            sessionStorage.setItem('mapCenter', JSON.stringify([center.lat, center.lng]));
        },
        zoomend: (event) => {
            const map = event.target;
            sessionStorage.setItem('mapZoom', map.getZoom());
        }
    });
    return null;
}

export default function ExploreMap( { parks }) {

    const favorites = useSelector(selectFavorites);
    const dispatch = useDispatch();
    const storedCenter = sessionStorage.getItem('mapCenter');
    const storedZoom = sessionStorage.getItem('mapZoom');
    const initialCenter = storedCenter ? JSON.parse(storedCenter) : [38, -97];
    const initialZoom = storedZoom ? parseInt(storedZoom, 10) : 3;

    const [searchParams, setSearchParams] = useSearchParams();
    const openPopup = searchParams.get('currentPark');
    const markerRefs = useRef({});

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (openPopup && markerRefs.current[openPopup]) {
                markerRefs.current[openPopup].openPopup();
            }
        }, 100);

        return () => clearTimeout(timeout);
    }, [openPopup, parks]);

    return (
        <MapContainer 
            className={'map-container'} 
            center={initialCenter} 
            zoom={initialZoom} 
            scrollWheelZoom={true} 
            maxBounds={[[-90, -360], [90, 360]]} 
            maxBoundsViscosity={1}
        >
            <MapEventHandler />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {parks && parks.length > 0 &&
                parks.map((park, index) => {
                    let states = park.states.split(',').join(', ');
                    const statesLength = park.states.split(',').length;

                    if (statesLength > 2) {
                        states = states.split(',').slice(0, 3).join(', ') + ', & More';
                    }

                    return (
                        <Marker 
                            key={index} 
                            position={[park.latitude, park.longitude]}
                            ref={(ref) => {
                                if (ref) markerRefs.current[park.name] = ref;
                            }}
                            eventHandlers={{
                                click: () => {
                                    setSearchParams({ currentPark: park.name });
                                },
                                popupclose: () => {
                                    setSearchParams({});
                                }
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
