import { useEffect } from 'react';
import { Routes, Route } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchParks,
  filterParks,
  selectAllParks, 
  selectInterval,
  selectQuery, 
  selectSort, 
  selectFilter, 
} from '../features/explore/exploreSlice.js';
import LandingPage from './landingPage/LandingPage.js';
import About from './about/About';
import Explore from '../features/explore/Explore.js';
import ExplorePark from '../features/explore/explorePark/ExplorePark';
import Favorites from '../features/lists/favorites/Favorites';
import Visited from '../features/lists/visited/Visited';
import User from '../features/user/User';
import Login from '../features/user/authenticate/login/Login.js';
import Signup from '../features/user/authenticate/signup/Signup.js';
import NavBar from './navBar/NavBar';
import NotFound from '../features/notFound/NotFound';
import Chatbot from '../features/chatbot/Chatbot.js';
import { getFavorites, selectFavoritesStatus } from '../features/lists/favorites/favoritesSlice';
import { getVisited, selectVisitedStatus } from '../features/lists/visited/visitedSlice';
import { useAuth } from '../context/AuthContext';
import RequireAuth from '../features/user/RequireAuth.js';
import ScrollToTop from '../utilityFunctions/ScrollToTop';
import './App.css';

function App() {

	const dispatch = useDispatch();
	const allParks = useSelector(selectAllParks);
	const interval = useSelector(selectInterval);
	const filter = useSelector(selectFilter);
	const query = useSelector(selectQuery);
	const sort = useSelector(selectSort);

	const { isLoggedIn, authLoading } = useAuth();
	const favoritesStatus = useSelector(selectFavoritesStatus);
	const visitedStatus = useSelector(selectVisitedStatus);

	// Fetch parks
	useEffect(() => {
		dispatch(fetchParks());
	}, [dispatch, interval]);

	// Re-filter parks whenever the filter, sort, or query changes
	useEffect(() => {
		if (allParks && allParks.length > 0) {
			dispatch(filterParks());
		}
	}, [filter, sort, query, dispatch, allParks]);

	// Fetch user's favorites and saved parks if logged in
	useEffect(() => {
		if (!authLoading && isLoggedIn) {
			if (favoritesStatus === 'idle') {
				dispatch(getFavorites());
			}
			if (visitedStatus === 'idle') {
				dispatch(getVisited());
			}
		}
	}, [authLoading, isLoggedIn, favoritesStatus, visitedStatus, dispatch]);


	return (
		<>
			<NavBar />
			<ScrollToTop />
			<Routes>
				<Route index element={<LandingPage />} />
				<Route path='/explore' element={<Explore />} />
				<Route path='/about' element={<About />} />
				<Route path='/guide' element={<Chatbot />} />
				<Route path="/user" element={<User />} />
				<Route path="/user/signup" element={<Signup />} />
				<Route path="/user/login" element={<Login />} />
				<Route path="/user/favorites" element={
				<RequireAuth>
					<Favorites />
				</RequireAuth>} 
				/>
				<Route path="/user/visited" element={
				<RequireAuth>
					<Visited />
				</RequireAuth>} 
				/>
				<Route path="/explore/:parkCode" element={<ExplorePark />} />
				<Route path="*" element={<NotFound />} />
			</Routes>
		</>
	);
}

export default App;
