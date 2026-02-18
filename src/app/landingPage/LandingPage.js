import './LandingPage.css';
import placeholderImage from '../../assets/images/plain-gray.webp';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const features = [
	{ title: 'Discover Parks', description: (<>Find national parks, monuments, historical sites, and recreation areas near you</>), img: placeholderImage, icon: 'fa-solid fa-map-location-dot' },
	{ title: 'Get official NPS info', description: (<>Browse official information on park fees, things to do, seasonal weather patterns, and more</>), img: placeholderImage, icon: 'fa-solid fa-circle-info' },
	{ title: 'Ask about Anything', description: (<>Get real-time answers to all your questions from our friendly park assistant</>), img: placeholderImage, icon: 'fa-regular fa-message' },
	{ title: 'Track your Adventures', description: (<>Add parks to your <em>visited</em> and <em>saved</em> lists</>), img: placeholderImage, icon: 'fa-solid fa-clipboard-check' },
	{ title: 'Check the Weather', description: (<>View the current weather for any park, anytime</>), img: placeholderImage, icon: 'fa-solid fa-cloud-sun' },
];

const popularParks = [
	{ label: 'Yellowstone', img: require('../../assets/images/yellowstone-hero.jpg'), destination: '/explore/yell' },
	{ label: 'Grand Canyon', img: require('../../assets/images/grand-canyon-hero.jpg'), destination: 'explore/grca' },
	{ label: 'Great Smoky Mountains', img: require('../../assets/images/smoky-mountains-hero.jpg'), destination: '/explore/grsm' },
	{ label: 'Yosemite', img: require('../../assets/images/yosemite-hero.jpg'), destination: '/explore/yose' },
	{ label: 'Zion', img: require('../../assets/images/zion-hero.jpg'), destination: '/explore/zion' },
];

const browseByDesignation = [
  { label: 'National Parks', img: require('../../assets/images/national-park-hero.jpg'), destination: '/explore?designations=National+Park' },
  { label: 'Monuments', img: require('../../assets/images/national-monument-hero.jpg'), destination: '/explore?designations=Monument' },
  { label: 'Preserves', img: require('../../assets/images/national-preserve-hero.jpg'), destination: '/explore?designations=Preserve' },
  { label: 'Historic Sites', img: require('../../assets/images/national-historic-site-hero.jpg'), destination: '/explore?designations=Historic' },
];

const browseByFeature = [
  { label: 'Waterfalls', img: placeholderImage, destination: '/explore?q=waterfalls' },
  { label: 'Volcanoes', img: placeholderImage, destination: '/explore?q=volcanoes' },
  { label: 'Beaches', img: placeholderImage, destination: '/explore?q=beach' },
];

const LandingPage = () => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [cardsPerView, setCardsPerView] = useState(1);
	const [isTransitioning, setIsTransitioning] = useState(true);

	// Update cardsPerView based on viewport
	useEffect(() => {
		const handleResize = () => setCardsPerView(window.innerWidth >= 768 ? 3 : 1);
		handleResize();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	// Auto-scroll with infinite loop
	useEffect(() => {
		const interval = setInterval(() => {
		setCurrentIndex(prev => prev + 1);
		setIsTransitioning(true);
		}, 6000);
		return () => clearInterval(interval);
	}, []);

	// Handle looping for infinite effect
	const maxIndex = features.length - cardsPerView;
	useEffect(() => {
		if (currentIndex > maxIndex) {
			// jump instantly to start
			setIsTransitioning(false);
			setCurrentIndex(0);
		} else {
			setIsTransitioning(true);
		}
	}, [currentIndex, maxIndex]);

	// Calculate translateX % for carousel
	const translateXPercent = -(currentIndex * (100 / cardsPerView));

	return (
		<div className="landing-container">
			{/* Hero Section */}
			<section className="hero-container">
				<div className="hero-overlay" />
				<div className="hero landing-page-content-section">
					<div className="hero-text">
						<h1>Explore America's National Parks</h1>
						<p>Discover parks, track your visits, and get answers to your questions</p>
						<Link className='cta-button' to={'/explore'}>
							Start Exploring
						</Link>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="features-container">
				<div className="features landing-page-content-section">
					<h2>Tools for Every Trip</h2>
					<div className="feature-cards-wrapper">
						<div
							className={`feature-cards ${isTransitioning ? 'transition' : ''}`}
							style={{ transform: `translateX(${translateXPercent}%)` }}
						>
							{features.map((feature, idx) => (
								<div key={idx} className="feature-card">
									<div className='feature-icon-container'>
										<div className="feature-icon">
											<i className={`${feature.icon}`}></i>
										</div>
									</div>
									<h3>{feature.title}</h3>
									<div>{feature.description}</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* Most popular */}
			<section className="popular-container">
				<div className="popular landing-page-content-section">
					<h2>Popular Parks</h2>
					<div className="popular-wrapper">
						<div className="popular-scroll">
							{popularParks.map((item, idx) => (
								<Link key={idx} className="popular-item" to={item.destination} state={{ fromIndex: true }}>
									<div className="popular-image-wrapper">
										<img src={item.img} alt={item.label} />
										<div className="popular-overlay" />
										<div className="popular-label">{item.label}</div>
									</div>
								</Link>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* Browse by */}
			<section className="browse-by-container">
				<div className="browse-by landing-page-content-section">
					<h2>Browse by</h2>
					<div className="browse-section">
						<div className="browse-wrapper">
							<div className="browse-scroll">
								{browseByDesignation.map((item, idx) => (
									<Link key={idx} className="browse-item" to={item.destination}>
										<img src={item.img} alt={item.label} />
										<div>{item.label}</div>
									</Link>
								))}
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="landing-footer">
				<p>&copy; Marshall 2025. All rights reserved.</p>
			</footer>
		</div>
	);
};

export default LandingPage;
