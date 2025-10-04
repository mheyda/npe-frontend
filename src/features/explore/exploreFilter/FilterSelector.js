import { useState } from 'react';
import './FilterSelector.css';

export default function FilterSelector({ options, name, handleChange, filterTitle, newFilter, setNewFilter }) {
    const [checkboxOpen, setCheckboxOpen] = useState(false);

    const clearFilter = () => {
        setNewFilter({ ...newFilter, [filterTitle]: [] });
    };

    return (
        <div className="checkbox-selector">
            {newFilter[filterTitle].length > 0 && (
                <button className="clear-filter-btn" onClick={clearFilter} type="button">
                    Clear
                </button>
            )}
            <button
                className="checkbox-header"
                type="button"
                onClick={() => setCheckboxOpen(prev => !prev)}
                aria-expanded={checkboxOpen}
            >
                {name}
                <i className={checkboxOpen ? 'fa-solid fa-minus' : 'fa-solid fa-plus'}></i>
            </button>
            {checkboxOpen && (
                <div className="options">
                    {options.map((option, index) => {
                        const id = `${filterTitle}-${index}`;
                        return (
                            <label key={id} className="option" htmlFor={id}>
                                <input
                                    id={id}
                                    className="checkbox"
                                    type="checkbox"
                                    name={option.title}
                                    value={option.value}
                                    onChange={handleChange}
                                    checked={newFilter[filterTitle].includes(option.value)}
                                />
                                <span className="checkbox-label">{option.title}</span>
                            </label>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
