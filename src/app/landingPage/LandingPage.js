import './LandingPage.css';
import placeholderImage from '../../assets/images/plain-gray.webp';
import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';

const features = [
	{ title: 'Discover Parks', description: (<>Find national parks, monuments, historical sites, and recreation areas near you</>), img: placeholderImage },
	{ title: 'Get official NPS info', description: (<>Browse official information on park fees, things to do, seasonal weather patterns, and more</>), img: placeholderImage },
	{ title: 'Ask about Anything', description: (<>Get real-time answers to all your questions from our friendly park assistant</>), img: placeholderImage },
	{ title: 'Track your Adventures', description: (<>Add parks to your <em>visited</em> and <em>saved</em> lists</>), img: placeholderImage },
	{ title: 'Check the Weather', description: (<>View the current weather for any park, anytime</>), img: placeholderImage },
];

const browseBy = [
	{ label: 'National Parks', img: placeholderImage, destination: '/explore' },
	{ label: 'Monuments', img: placeholderImage, destination: '/explore' },
	{ label: 'Preserves', img: placeholderImage, destination: '/explore' },
	{ label: 'Historical Sites', img: placeholderImage, destination: '/explore' },
	{ label: 'State', img: placeholderImage, destination: '/explore' },
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
									<img src={feature.img} alt={feature.title} />
									<h3>{feature.title}</h3>
									<div>{feature.description}</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* Browse By Section */}
			<section className="browse-by-container">
				<div className="browse-by landing-page-content-section">
					<h2>Browse By</h2>

					<div className="browse-wrapper">
						<div className="browse-scroll">
							{browseBy.map((item, idx) => (
								<Link key={idx} className="browse-item" to={item.destination}>
									<img src={item.img} alt={item.label} />
									<div>{item.label}</div>
								</Link>
							))}
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
