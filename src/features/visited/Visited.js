import './Visited.css';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAllParks, selectParksStatus } from '../explore/exploreSlice';
import { selectVisited, selectVisitedStatus } from './visitedSlice';
import ExploreTile from '../explore/exploreList/ExploreTile';


export default function Visited() {

    const allParks = useSelector(selectAllParks);
    const parksStatus = useSelector(selectParksStatus);
    const visitedIds = useSelector(selectVisited);
    const [visitedParks, setVisitedParks] = useState([]);
    const visitedStatus = useSelector(selectVisitedStatus);

    const isLoading =
        visitedStatus === 'idle' ||
        visitedStatus === 'loading' ||
        parksStatus === 'idle' ||
        parksStatus === 'loading' ||
        (visitedStatus === 'succeeded' && visitedParks.length === 0 && visitedIds.length > 0);

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
            <div className='no-results'>
                <img
                    src={require('../../assets/images/tent.svg').default}
                    alt="No parks found"
                    className='no-results-img'
                    height='600'
                    width='400'
                />
                <p className="no-results-label">Oops, you haven't visited any parks yet!<br></br><Link className="underline" to={'/'}>Click here</Link> to explore.</p>
            </div>
        </main>
    );
}
