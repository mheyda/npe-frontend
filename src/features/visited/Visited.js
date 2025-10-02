import './Visited.css';
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllParks, selectParksStatus } from '../explore/exploreSlice';
import { selectVisited, selectVisitedStatus, selectToggleStatus, getVisited, setToggleStatus } from './visitedSlice';
import ExploreTile from '../explore/exploreList/ExploreTile';


export default function Visited() {

    const allParks = useSelector(selectAllParks);
    const parksStatus = useSelector(selectParksStatus);
    const visitedIds = useSelector(selectVisited);
    const [visitedParks, setVisitedParks] = useState([]);
    const visitedStatus = useSelector(selectVisitedStatus);
    const toggleStatus = useSelector(selectToggleStatus);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const isLoading =
        visitedStatus === 'idle' ||
        visitedStatus === 'loading' ||
        parksStatus === 'idle' ||
        parksStatus === 'loading' ||
        (visitedStatus === 'succeeded' && visitedParks.length === 0 && visitedIds.length > 0);


    // Make request to get user's visited parks. If not successful, redirect to login page.
    useEffect(() => {
        dispatch(getVisited());
    }, [dispatch])

    // If there was an error getting parks or toggling a park, redirect to login page
    useEffect(() => {
        if (visitedStatus === 'failed' || toggleStatus === 'failed') {
            navigate('/user/login?next=/user/visited');
            dispatch(setToggleStatus('idle'));
        }
    }, [visitedStatus, toggleStatus, navigate, dispatch])

    // Get visited parks everytime the user changes their visited parks
    useEffect(() => {
        setVisitedParks(allParks.filter(park => {
            if (visitedIds.includes(park.id)) {
                return park;
            }
            return null;
        }));
    }, [visitedIds, allParks])


    if (isLoading) {
        return (
            <main>
                <h2 className='visited-title'>My Visited Parks</h2>
                <i className="fa-solid fa-spinner fa-spin loading-spinner" aria-hidden="true"></i>
            </main>
        );
    }
    
    if (visitedParks.length > 0) {
        return (
            <main>
                <h2 className='visited-title'>My Visited Parks</h2>
                <ul className='explore-tiles'>
                    {visitedParks.map((park, index) => {
                        return <ExploreTile key={index} park={park}  />
                    })}
                </ul>
            </main>
        );
    }

    return (
        <main>
            <h2 className='visited-title'>My Visited Parks</h2>
            <div className="image-container">
                <img className="no-saved-parks-image" src="/images/pines.png" alt="Pine Tree" />
            </div>
            <div className="empty-message">
                Oops, you haven't visited any parks yet! <Link className="underline" to={'/'}>Explore here</Link> to help you get out there.
            </div>
        </main>
    );
}
