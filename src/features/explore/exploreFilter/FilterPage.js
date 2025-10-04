import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectFilter, setFilter, selectSort, setSort, selectView } from '../exploreSlice.js';
import FilterSelector from './FilterSelector.js';
import Select from '../../../common/select/Select.js';
import { designationOptions, stateOptions, sortOptions } from '../../../assets/data/filterOptions.js';
import './FilterPage.css';

export default function FilterPage({ setFiltersOpen }) {
    const view = useSelector(selectView);
    const sort = useSelector(selectSort);
    const filter = useSelector(selectFilter);
    const dispatch = useDispatch();   
    const filterPageRef = useRef(null);

    const [newFilter, setNewFilter] = useState(filter);
    const [newSort, setNewSort] = useState(sort);

    const updateFilter = (key, value, checked) => {
        const updated = checked
            ? [...newFilter[key], value]
            : newFilter[key].filter(v => v !== value);

        setNewFilter({ ...newFilter, [key]: updated });
    };

    const updateStateCodes = e => updateFilter('stateCodes', e.target.value, e.target.checked);
    const updateDesignations = e => updateFilter('designations', e.target.value, e.target.checked);

    const updateSort = e => {
        const selectedIndex = e.target.options.selectedIndex;
        const newSort = e.target.options[selectedIndex].value;
        setNewSort(newSort);
    };

    const clearSort = () => {
        if (view === 'list') {
            document.querySelector('select').options.selectedIndex = 0;
        }
        setNewSort('Alphabetical (A-Z)');
    };

    const handleClickOutside = (e) => {
        if (filterPageRef.current && !filterPageRef.current.contains(e.target)) {
            setFiltersOpen(false);
        }
    };

    const handleSubmit = e => {
        e.preventDefault();
        dispatch(setSort(newSort));
        dispatch(setFilter(newFilter));
        setFiltersOpen(false);
    };

    useEffect(() => {
        // Save scroll position
        const scrollY = window.scrollY;
        // Lock background scroll
        if (view === 'list') {
            document.body.style.top = `-${scrollY}px`;
            document.body.classList.add('modal-open');
        }

        return () => {
        // Restore scroll position
        document.body.classList.remove('modal-open');
        window.scrollTo(0, scrollY);
        document.body.style.top = '';
        };
    }, []);

    return (
        <div className="filter-page-container" onClick={handleClickOutside}>
            <form ref={filterPageRef} className="filter-page" onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
                <p className="filter-page-header">
                    <span className="filter-page-title">
                        {view === 'list' ? 'Filter & Sort' : 'Filter'}
                    </span>
                    <button className="close-filter-page" type="button" onClick={() => setFiltersOpen(false)}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </p>

                <div className="filter-page-scrollable">
                    {view === 'list' && (
                    <>
                        <p className="filter-page-subheading">
                            Sort by
                            {newSort !== 'Alphabetical (A-Z)' && (
                                <button className="clear-sort-btn" type="button" onClick={clearSort}>
                                    Reset
                                </button>
                            )}
                        </p>
                        <Select
                            name={''}
                            options={sortOptions}
                            defaultValue={sort}
                            onChange={updateSort}
                            clearSort={clearSort}
                        />
                    </>
                    )}

                    <p className="filter-page-subheading">Filter by</p>
                    <FilterSelector
                        name={'Park Designation'}
                        filterTitle={'designations'}
                        options={designationOptions}
                        newFilter={newFilter}
                        setNewFilter={setNewFilter}
                        handleChange={updateDesignations}
                    />
                    <FilterSelector
                        name={'State & Territory'}
                        filterTitle={'stateCodes'}
                        options={stateOptions}
                        newFilter={newFilter}
                        setNewFilter={setNewFilter}
                        handleChange={updateStateCodes}
                    />
                </div>

                <p className="filter-page-footer">
                    {(newSort !== 'Alphabetical (A-Z)' || !Object.values(newFilter).every(value => value.length === 0)) && (
                    <button
                        className="clear-all-btn"
                        type="button"
                        onClick={() => {
                            clearSort();
                            setNewFilter({ designations: [], stateCodes: [] });
                        }}
                    >
                        Clear All
                    </button>
                    )}
                    <button className="apply-filter-btn" type="submit">
                        Apply
                    </button>
                </p>
            </form>
        </div>
    );
}
