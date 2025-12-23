import ExploreMap from './exploreMap/ExploreMap.js';
import ExploreTiles from './exploreList/ExploreTiles.js';
import { 
    syncExploreState,
    initializeExplore, 
    filterParks,
    selectListParks, 
    selectMapParks, 
    selectError, 
    selectQuery, 
    selectSort, 
    selectView, 
    selectFilter, 
} from './exploreSlice.js';
import { useDispatch, useSelector } from 'react-redux';
import ViewToggler from './ViewToggler.js';
import FilterPage from './exploreFilter/FilterPage.js';
import { useEffect, useState } from 'react';
import './Explore.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { selectToggleStatus as selectFavoritesToggleStatus, setToggleStatus as setFavoritesToggleStatus } from '../lists/favorites/favoritesSlice.js';
import { selectToggleStatus as selectVisitedToggleStatus, setToggleStatus as setVisitedToggleStatus } from '../lists/visited/visitedSlice.js';
import Loader from '../../common/loader/Loader.js';

const DEFAULT_SORT = 'Alphabetical (A-Z)';


export default function Explore() {
    
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [hydrated, setHydrated] = useState(false);
    const listParks = useSelector(selectListParks);
    const mapParks = useSelector(selectMapParks);
    const view = useSelector(selectView);
    const filter = useSelector(selectFilter);
    const query = useSelector(selectQuery);
    const sort = useSelector(selectSort);
    const parksStatus = useSelector(state => state.explore.parksStatus);
    const error = useSelector(selectError);
    const favoritesToggleStatus = useSelector(selectFavoritesToggleStatus);
    const visitedToggleStatus = useSelector(selectVisitedToggleStatus);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Get number of filters and sorts currently applied
    const sortCount = (sort !== DEFAULT_SORT ? 1 : 0);
    const filterCount = Object.values(filter).filter(value => value.length > 0).length;
    
    const searchMessage = query ? `Showing search results for "${query}"` : null;
    const filterMessage = mapParks.length === 1 
        ? '1 park found' 
        : `${mapParks.length} parks found`;

    const areFiltersEmpty = () => Object.values(filter).every(value => value.length === 0);

    // If there was an error toggling a saved park, redirect to login page
    useEffect(() => {
        if (favoritesToggleStatus === 'failed') {
            navigate('/user/login/');
            dispatch(setFavoritesToggleStatus('idle'));
        }
    }, [favoritesToggleStatus, navigate, dispatch])

    // If there was an error toggling a visited park, redirect to login page
    useEffect(() => {
        if (visitedToggleStatus === 'failed') {
            navigate('/user/login/');
            dispatch(setVisitedToggleStatus('idle'));
        }
    }, [visitedToggleStatus, navigate, dispatch]);

    useEffect(() => {
        // Store current URL with filters whenever Explore renders
        sessionStorage.setItem('lastExploreURL', window.location.pathname + window.location.search);
    }, [searchParams]);

    useEffect(() => {
        // Hydrate Redux state from URL
        const statesParam = searchParams.get('states');
        const designationsParam = searchParams.get('designations');
        const queryParam = searchParams.get('q');
        const sortParam = searchParams.get('sort');

        dispatch(initializeExplore({
            filter: {
                stateCodes: statesParam ? statesParam.split(',') : [],
                designations: designationsParam ? designationsParam.split(',') : [],
            },
            query: queryParam ?? '',
            sort: sortParam ?? DEFAULT_SORT,
        }));

        dispatch(filterParks());
        setHydrated(true);
    }, [searchParams, dispatch]);

    useEffect(() => {
        if (hydrated) {
            dispatch(syncExploreState({ filter, query, sort, setSearchParams }));
        }
    }, [filter, query, sort, hydrated, dispatch, setSearchParams]);

    useEffect(() => {
        dispatch(syncExploreState({ filter, query, sort, setSearchParams }));
    }, [filter, query, sort, dispatch, setSearchParams]);

    useEffect(() => {
        if (view === 'map') {
            window.scrollTo(0, 0);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [view]);

    // If an error occured while fetching the parks
    if (error) {
        return (
            <main>Sorry, something went wrong. Please try again.</main>
        )
    }

    // If no errors occured while fetching data
    else {
        if (mapParks && mapParks.length > 0) {
            if (view === 'list') {
                return (
                    <main className='explore-container'>
                        <div className='filter-bar'>
                            <div className='search-result-string'>
                                <div title={searchMessage}>{searchMessage}</div>
                                <div>{filterMessage}</div>
                            </div>
                            <button 
                                className={
                                    sort === DEFAULT_SORT && areFiltersEmpty()
                                    ? 'filter-btn'
                                    : 'filter-btn active'
                                } 
                                onClick={() => setFiltersOpen(true)}
                            >
                                Sort & Filter {sortCount + filterCount > 0 ? `(${sortCount + filterCount})` : ''}
                            </button>
                        </div>
                        {filtersOpen ? <FilterPage setFiltersOpen={setFiltersOpen} /> : <></>}
                        <ExploreTiles parks={listParks} />
                        <ViewToggler />
                    </main>
                );
            } else if (view === 'map') {
                return (
                    <div>
                        {filtersOpen && <FilterPage setFiltersOpen={setFiltersOpen} />}
                        <ExploreMap 
                            parks={mapParks} 
                            searchMessage={searchMessage} 
                            filterMessage={filterMessage} 
                            filterCount={filterCount} 
                            areFiltersEmpty={areFiltersEmpty()}
                            onOpenFilters={() => setFiltersOpen(true)}
                        />
                        <ViewToggler />
                    </div>
                );
            }
        }
        else if (parksStatus === 'idle' || parksStatus === 'loading') {
            return (
                <main>
                    <Loader />
                </main>
            );
        }
        else if (parksStatus === 'succeeded') {
            if (view === 'list') {
                return (
                    <main className='explore-container'>
                        <div className='filter-bar'>
                            <div className='search-result-string'>
                                {query && <div>No search results for "{query}"</div>}
                                {filterCount > 0 && <div>0 parks found</div>}
                            </div>
                            <button
                                className={
                                    sort === DEFAULT_SORT && areFiltersEmpty()
                                        ? 'filter-btn'
                                        : 'filter-btn active'
                                }
                                onClick={() => setFiltersOpen(true)}
                            >
                                Sort & Filter {sortCount + filterCount > 0 ? `(${sortCount + filterCount})` : ''}
                            </button>
                        </div>
                        {filtersOpen && <FilterPage setFiltersOpen={setFiltersOpen} />}
                        <div className='no-results'>
                            <img
                                src={require('../../assets/images/tent.svg').default}
                                alt="No parks found"
                                className='no-results-img'
                            />
                            <p className="no-results-label">
                                Nothing to see here...
                                <br></br>
                                Try updating your filters or search criteria.
                            </p>
                        </div>
                        <ViewToggler />
                    </main>
                );
            } else if (view === 'map') {
                return (
                    <div className='explore-map-view'>
                        {filtersOpen && <FilterPage setFiltersOpen={setFiltersOpen} />}
                        <ExploreMap 
                            parks={mapParks} 
                            searchMessage={searchMessage} 
                            filterMessage={filterMessage} 
                            filterCount={filterCount} 
                            areFiltersEmpty={areFiltersEmpty()}
                            onOpenFilters={() => setFiltersOpen(true)}
                        />
                        <ViewToggler />
                    </div>
                );
            }
        }
    }
}
