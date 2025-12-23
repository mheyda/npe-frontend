import '../Lists.css';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAllParks, selectParksStatus } from '../../explore/exploreSlice';
import { selectVisited, selectVisitedStatus } from './visitedSlice';
import ExploreTile from '../../explore/exploreList/ExploreTile';
import Loader from '../../../common/loader/Loader';
import ListTile from '../ListTile';


export default function Visited() {

    const allParks = useSelector(selectAllParks);
    const parksStatus = useSelector(selectParksStatus);
    const visitedIds = useSelector(selectVisited);
    const visitedStatus = useSelector(selectVisitedStatus);

    const [viewType, setViewType] = useState('list'); // 'detailed' or 'list'
    const [sortOption, setSortOption] = useState('name-asc');

    const visitedParks = useMemo(() => {
        let filtered = allParks.filter(park => visitedIds.includes(park.id));

        switch (sortOption) {
            case 'name-asc':
                return [...filtered].sort((a, b) => a.fullName.localeCompare(b.fullName));
            case 'name-desc':
                return [...filtered].sort((a, b) => b.fullName.localeCompare(a.fullName));
            case 'state-asc':
                return [...filtered].sort((a, b) => a.states.localeCompare(b.states));
            case 'state-desc':
                return [...filtered].sort((a, b) => b.states.localeCompare(a.states));
            default:
                return filtered;
        }
    }, [allParks, visitedIds, sortOption]);

    const isLoading =
        visitedStatus === 'idle' ||
        visitedStatus === 'loading' ||
        parksStatus === 'idle' ||
        parksStatus === 'loading' ||
        (visitedStatus === 'succeeded' && visitedParks.length === 0 && visitedIds.length > 0);

    const handleSortChange = (e) => {
        setSortOption(e.target.value);
    };

    const handleViewToggle = (type) => {
        setViewType(type);
    };

    const renderToggleButtons = () => (
        <div className="view-toggle-icon-buttons" role="group" aria-label="View type toggle">
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
        </div>
    );

    if (visitedStatus === 'failed' || parksStatus === 'failed') {
        return (
            <main>
                <h2 className='list-title'>My Visited Parks</h2>
                <div className='error-message'>
                    <p>There was an error loading your visited parks. Please try again.</p>
                </div>
            </main>
        );
    }

    if (isLoading) {
        return (
            <main>
                <h2 className='list-title'>My Visited Parks</h2>
                <Loader />
            </main>
        );
    }
    
    if (visitedParks.length > 0) {
        return (
            <main>
                <h2 className='list-title'>My Visited Parks</h2>
                <div className="list-controls">
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
                    {visitedParks.map((park, index) => {
                        return viewType === 'detailed' ? (
                            <ExploreTile key={index} park={park} />
                        ) : (
                            <ListTile key={index} park={park} list={"visited"} />
                        )
                    })}
                </ul>
            </main>
        );
    }

    return (
        <main>
            <h2 className='list-title'>My Visited Parks</h2>
            <div className='no-results'>
                <img
                    src={require('../../../assets/images/tent.svg').default}
                    alt="No parks found"
                    className='no-results-img'
                    height='600'
                    width='400'
                />
                <p className="no-results-label">Oops, you haven't visited any parks yet!<br></br><Link className="underline" to={'/explore'}>Click here</Link> to explore.</p>
            </div>
        </main>
    );
}
