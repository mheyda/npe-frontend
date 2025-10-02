import './Favorites.css';
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllParks, selectParksStatus } from '../explore/exploreSlice';
import { selectFavorites, selectFavoritesStatus, selectToggleStatus, getFavorites, setToggleStatus } from './favoritesSlice';
import ExploreTile from '../explore/exploreList/ExploreTile';


export default function Favorites() {

    const allParks = useSelector(selectAllParks);
    const parksStatus = useSelector(selectParksStatus);
    const favoriteIds = useSelector(selectFavorites);
    const [favoriteParks, setFavoriteParks] = useState([]);
    const favoritesStatus = useSelector(selectFavoritesStatus);
    const toggleStatus = useSelector(selectToggleStatus);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const isLoading =
        favoritesStatus === 'idle' ||
        favoritesStatus === 'loading' ||
        parksStatus === 'idle' ||
        parksStatus === 'loading' ||
        (favoritesStatus === 'succeeded' && favoriteParks.length === 0 && favoriteIds.length > 0);


    // Make request to get user's favorites. If not successful, redirect to login page.
    useEffect(() => {
        dispatch(getFavorites());
    }, [dispatch])

    // If there was an error getting parks or toggling a park, redirect to login page
    useEffect(() => {
        if (favoritesStatus === 'failed' || toggleStatus === 'failed') {
            navigate('/user/login?next=/user/favorites');
            dispatch(setToggleStatus('idle'));
        }
    }, [favoritesStatus, toggleStatus, navigate, dispatch])

    // Get favorite parks everytime the user changes their favorites
    useEffect(() => {
        setFavoriteParks(allParks.filter(park => {
            if (favoriteIds.includes(park.id)) {
                return park;
            }
            return null;
        }));
    }, [favoriteIds, allParks])


    if (isLoading) {
        return (
            <main>
                <h2 className='favorites-title'>My Saved Parks</h2>
                <i className="fa-solid fa-spinner fa-spin loading-spinner" aria-hidden="true"></i>
            </main>
        );
    }

    if (favoriteParks.length > 0) {
        return (
            <main>
                <h2 className='favorites-title'>My Saved Parks</h2>
                <ul className='explore-tiles'>
                    {favoriteParks.map((park, index) => {
                        return <ExploreTile key={index} park={park} />
                    })}
                </ul>
            </main>
        );
    }

    return (
        <main>
            <h2 className='favorites-title'>My Saved Parks</h2>
            <div className='no-results'>
                <img
                    src={require('../../assets/images/tent.svg').default}
                    alt="No parks found"
                    className='no-results-img'
                />
                <p className="no-results-label">Oops, you have nothing saved!<br></br><Link className="underline" to={'/'}>Click here</Link> to explore.</p>
            </div>
        </main>
    )
}
