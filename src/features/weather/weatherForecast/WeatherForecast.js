import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchWeather, selectWeather } from '../weatherSlice.js';
import WeatherForecastItem from './WeatherForecastItem.js';
import './WeatherForecast.css';
import Loader from '../../../common/loader/Loader.js';

export default function WeatherForecast( { lat, lng } ) {

    const dispatch = useDispatch();
    const weather = useSelector(selectWeather);
    const weatherStatus = useSelector(state => state.weather.status);
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];

    // Get weather data
    useEffect(() => {
        dispatch(fetchWeather({lat: lat, lng: lng}))
    }, [dispatch, lat, lng])

    if (weatherStatus === 'loading' || weatherStatus === 'idle') {
        return (
            <div className='weather-forecast-container'>
                <h3>7 Day Forecast</h3>
                <Loader />
            </div>
        )
    }

    if (weatherStatus === 'failed') {
        return (
            <div className='weather-forecast-container'>
                <h3>7 Day Forecast</h3>
                Unable to fetch weather
            </div>
        )
    }

    return (
        <div className='weather-forecast-container'>
            <h3>7 Day Forecast</h3>
            <ul className='weather-forecast-content'>
                {weather.daily.map((weather, index) => {
                     // Get day of the week
                     let dayIndex = new Date();
                     dayIndex.setDate(dayIndex.getDate() + index);
                     dayIndex = dayIndex.getDay();
                     if (index === 0) { dayIndex = 7 };

                     return <WeatherForecastItem key={index} weather={weather} dayOfTheWeek={weekdays[dayIndex]} />
                })}
            </ul>
        </div>
    );
}
