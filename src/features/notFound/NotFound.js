import { Link } from 'react-router-dom';
import './NotFound.css';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="not-found-container">
            <div className="not-found-content">
                <img
                    src={require('../../assets/images/map2.svg').default}
                    height='300'
                    width='400'
                    alt="Lost in the wilderness"
                    className="not-found-image"
                />
                <h1 className='not-found-heading'>404 Page Not Found</h1>
                <p className='not-found-message'>Looks like you wandered off the trail...</p>
                
                <button
                    className="not-found-home-link"
                    onClick={() => navigate(-1)}
                >
                    Go Back
                </button>
            </div>
        </div>
    );
}
