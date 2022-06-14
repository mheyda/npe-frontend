import './Select.css';


export default function Select( { name, options, onChange } ) {


    return (
        <div>
            <label>{name}</label>
            <select defaultValue={name} onChange={onChange}>
                <option value={name} disabled>{name}</option>
                {options.map((option, index) => {
                    return <option key={index} value={option.value}>{option.title}</option>;
                })}
            </select>
        </div>
    );
}
