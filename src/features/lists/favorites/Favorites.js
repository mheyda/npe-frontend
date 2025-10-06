import '../Lists.css';
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllParks, selectParksStatus } from '../../explore/exploreSlice';
import { selectFavorites, selectFavoritesStatus, selectToggleStatus, setToggleStatus } from './favoritesSlice';
import ExploreTile from '../../explore/exploreList/ExploreTile';
import ListTile from '../../lists/ListTile';
import Loader from '../../../common/loader/Loader';

export default function Favorites() {

    const allParks = useSelector(selectAllParks);
    const parksStatus = useSelector(selectParksStatus);
    const favoriteIds = useSelector(selectFavorites);
    const [favoriteParks, setFavoriteParks] = useState([]);
    const favoritesStatus = useSelector(selectFavoritesStatus);
    const toggleStatus = useSelector(selectToggleStatus);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [viewType, setViewType] = useState('list'); // 'detailed' or 'list'
    const [sortOption, setSortOption] = useState('name-asc');

    const isLoading =
        favoritesStatus === 'idle' ||
        favoritesStatus === 'loading' ||
        parksStatus === 'idle' ||
        parksStatus === 'loading' ||
        (favoritesStatus === 'succeeded' && favoriteParks.length === 0 && favoriteIds.length > 0);

    useEffect(() => {
        if (favoritesStatus === 'failed' || toggleStatus === 'failed') {
            navigate('/user/login?next=/user/favorites');
            dispatch(setToggleStatus('idle'));
        }
    }, [favoritesStatus, toggleStatus, navigate, dispatch]);

    useEffect(() => {
        setFavoriteParks(allParks.filter(park => favoriteIds.includes(park.id)));
    }, [favoriteIds, allParks]);

    // Sorting handler
    const handleSortChange = (e) => {
        const value = e.target.value;
        setSortOption(value);

        let sorted = [...favoriteParks];

        switch (value) {
            case 'name-asc':
                sorted.sort((a, b) => a.fullName.localeCompare(b.fullName));
                break;
            case 'name-desc':
                sorted.sort((a, b) => b.fullName.localeCompare(a.fullName));
                break;
            case 'state-asc':
                sorted.sort((a, b) => a.states.localeCompare(b.states));
                break;
            case 'state-desc':
                sorted.sort((a, b) => b.states.localeCompare(a.states));
                break;
            default:
                break;
        }

        setFavoriteParks(sorted);
    };

    const handleViewToggle = (type) => {
        setViewType(type);
    };

    const renderToggleButtons = () => (
        <div className="view-toggle-icon-buttons" role="group" aria-label="View type toggle">
            <button
                className={viewType === 'detailed' ? 'active' : ''}
                onClick={() => handleViewToggle('detailed')}
                title="Detailed View"
                aria-label="Detailed View"
            >
                <div className="icon-wrapper">
                    <i className="fa-solid fa-table-cells-large"></i>
                    <span className="icon-label">Grid</span>
                </div>
            </button>
            <button
                className={viewType === 'list' ? 'active' : ''}
                onClick={() => handleViewToggle('list')}
                title="List View"
                aria-label="List View"
            >
                <div className="icon-wrapper">
                    <i className="fa-solid fa-list"></i>
                    <span className="icon-label">List</span>
                </div>
            </button>
        </div>
    );

    if (isLoading) {
        return (
            <main>
                <h2 className='list-title'>My Saved Parks</h2>
                <Loader />
            </main>
        );
    }

    if (favoriteParks.length > 0) {
        return (
            <main>
                <h2 className='list-title'>My Saved Parks</h2>
                <div className="list-controls"> {/* Reuse Visited.css class or rename */}
                    <div className="list-sort-dropdown">
                        <label htmlFor="list-sort-select" className="list-sort-label">Sort by:</label>
                        <select
                            id="list-sort-select"
                            value={sortOption}
                            onChange={handleSortChange}
                            className="list-sort-select"
                        >
                            <option value="name-asc">Name A-Z</option>
                            <option value="name-desc">Name Z-A</option>
                            <option value="state-asc">State A-Z</option>
                            <option value="state-desc">State Z-A</option>
                        </select>
                    </div>
                    {renderToggleButtons()}
                </div>
                <ul className={viewType === 'detailed' ? 'explore-tiles' : 'list-tiles'}>
                    {favoriteParks.map((park, index) => {
                        return viewType === 'detailed' ? (
                            <ExploreTile key={index} park={park} />
                        ) : (
                            <ListTile key={index} park={park} list={"favorites"} />
                        );
                    })}
                </ul>
            </main>
        );
    }

    return (
        <main>
            <h2 className='list-title'>My Saved Parks</h2>
            <div className='no-results'>
                <img
                    src={require('../../../assets/images/tent.svg').default}
                    alt="No parks found"
                    className='no-results-img'
                    height='600'
                    width='400'
                />
                <p className="no-results-label">Oops, you have nothing saved!<br></br><Link className="underline" to={'/'}>Click here</Link> to explore.</p>
            </div>
        </main>
    );
}
