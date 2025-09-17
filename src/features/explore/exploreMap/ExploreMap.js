import { useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import ManualSlideshow from '../../../common/slideshow/ManualSlideshow';
import { selectFavorites, toggleFavorite } from '../../favorites/favoritesSlice';
import './ExploreMap.css';

function MapEventHandler({ searchParams, setSearchParams }) {
    useMapEvents({
        moveend: (event) => {
            const map = event.target;
            const center = map.getCenter();
            const newCenter = `${center.lat.toFixed(2)},${center.lng.toFixed(2)}`;
            const newZoom = map.getZoom();

            const newParams = new URLSearchParams(searchParams);
            newParams.set('center', newCenter);
            newParams.set('zoom', newZoom);

            setSearchParams(newParams);
        }
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
    const [searchParams, setSearchParams] = useSearchParams();

    const centerParam = searchParams.get('center');
    const initialCenter = centerParam ? centerParam.split(',').map(Number) : [38, -97];
    
    const zoomParam = searchParams.get('zoom');
    const initialZoom = zoomParam ? parseInt(zoomParam, 10) : 3;

    const popupParam = searchParams.get('currentPark');
    const markerRefs = useRef({});

    const updateCurrentPark = useCallback(
        (parkName) => {
            const newParams = new URLSearchParams(searchParams);
            if (parkName) {
                newParams.set('currentPark', parkName);
            } else {
                newParams.delete('currentPark');
            }
            setSearchParams(newParams);
        },
        [searchParams, setSearchParams]
    );

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (popupParam && markerRefs.current[popupParam]) {
                markerRefs.current[popupParam].openPopup();
            }
        }, 100);

        return () => clearTimeout(timeout);
    }, [popupParam, parks]);

    return (
        <MapContainer 
            className={'map-container'} 
            center={initialCenter} 
            zoom={initialZoom} 
            scrollWheelZoom={true} 
            maxBounds={[[-90, -360], [90, 360]]} 
            maxBoundsViscosity={1}
        >
            <MapEventHandler searchParams={searchParams} setSearchParams={setSearchParams} />
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
                                click: () => updateCurrentPark(park.name),
                                popupclose: () => updateCurrentPark(null)
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
