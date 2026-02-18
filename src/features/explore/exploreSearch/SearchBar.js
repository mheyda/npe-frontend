import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectQuery, setQuery } from '../exploreSlice';
import './SearchBar.css';

export default function SearchBar() {

    const query = useSelector(selectQuery);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [currentQuery, setCurrentQuery] = useState(query);

    useEffect(() => {
        setCurrentQuery(query);
    }, [query])

    const handleSearch = (e) => {
        e.preventDefault();
        const searchTerm = e.target.queryTerm.value;
        navigate(`/explore?q=${encodeURIComponent(searchTerm)}`);
    }

    return (
        <form onSubmit={handleSearch} className='search-bar'>
            <input type='text' id='queryTerm' value={currentQuery} onChange={(e) => setCurrentQuery(e.target.value)} placeholder='Search' />
            {currentQuery !== '' ? <button className='clear-search-bar' title="Clear search" type='button' onClick={() => {setCurrentQuery(''); dispatch(setQuery(''));}}><i className="fa-solid fa-xmark"></i></button> : <></>}
            <button id='submit-search' title="Search" className='search-btn' type='submit'><i className="fa-solid fa-magnifying-glass"></i></button>
        </form>  
    );
}
