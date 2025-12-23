import { Link } from 'react-router-dom';
import ManualSlideshow from '../../../common/slideshow/ManualSlideshow';
import { useInView } from 'react-intersection-observer';
import { selectFavorites, toggleFavorite } from '../../lists/favorites/favoritesSlice';
import { selectVisited, toggleVisited } from '../../lists/visited/visitedSlice';
import { useSelector, useDispatch } from 'react-redux';


export default function ExploreTile( { park } ) {

    const dispatch = useDispatch();
    let states = park.states.split(',').join(', ');
    const statesLength = park.states.split(',').length;
    const favorites = useSelector(selectFavorites);
    const visited = useSelector(selectVisited);

    if (statesLength > 2) {
        states = states.split(',').slice(0, 3).join(', ') + ', & More'
    }

    // Keep DOM elements to minimum until they are needed / in view
    const { ref, inView } = useInView({
        threshold: 0,
        rootMargin: '0px 0px 100px 0px',
        triggerOnce: true,
    });

    if (inView) {
        return (
            <li className='explore-tile' id={park.fullName} >
                <Link to={park.parkCode} onClick={() => {
                    sessionStorage.setItem('currentPark', JSON.stringify(park));
                }}>
                    <div className='explore-tile-img-container'>
                        <div className='explore-tile-img'>
                            <ManualSlideshow images={park.images} />
                        </div>
                    </div>
                    <div className='explore-tile-content'>
                        <p className='explore-tile-title'>{park.name}<br></br>{park.designation}</p>
                        <p className='explore-tile-states'>{states}</p>
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
            </li>
        );
    } else {
        return (
            <div ref={ref}></div>
        );
    }
}
