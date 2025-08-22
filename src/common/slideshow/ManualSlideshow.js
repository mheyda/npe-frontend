import { useEffect, useState } from 'react';
import Image from '../../common/image/Image.js';
import './Slideshow.css';


export default function ManualSlideshow( { images } ) {

    const [imgIndex, setImgIndex] = useState(0);
    const [dotsStyling, setDotsStyling] = useState({ transform: 'translateX(0px)', transition: '0.8s' })
    const [touchStartX, setTouchStartX] = useState(null);
    const [touchEndX, setTouchEndX] = useState(null);

    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
    };

    const onTouchMove = (e) => {
    setTouchEndX(e.touches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStartX || !touchEndX) return;
        const distance = touchStartX - touchEndX;

        if (Math.abs(distance) > minSwipeDistance) {
            if (distance > 0) {
            // swipe left
                setImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                } else {
                // swipe right
                setImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
            }
        }

        // reset
        setTouchStartX(null);
        setTouchEndX(null);
    };

    useEffect(() => {
        if (images.length > 4) {
            if (imgIndex > 1 && imgIndex < images.length - 2) {
                setDotsStyling({ transform: `translateX(calc(${-imgIndex  * 22}px + 44px))`, transition: '0.8s' });
            } else if (imgIndex === 0) {
                setDotsStyling({ transform: 'translateX(0px)', transition: '0.8s' });
            }
            else if (imgIndex === images.length - 1) {
                setDotsStyling({ transform: `translateX(calc(${-imgIndex * 22}px + 88px))`, transition: '0.8s'})
            }
        }
    }, [imgIndex, images.length])

    return (
        <div className='slideshow'>
            <div className='slideshow-btns'>
                <i className='slideshow-left fa-solid fa-circle-arrow-left' onClick={(e) => {imgIndex === 0 ? setImgIndex(images.length - 1) : setImgIndex(imgIndex - 1); e.preventDefault()}}></i>
                <i className="slideshow-right fa-solid fa-circle-arrow-right" onClick={(e) => {imgIndex === images.length - 1 ? setImgIndex(0) : setImgIndex(imgIndex + 1); e.preventDefault()}}></i>
            </div>
            <div className="slides" 
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                {images.map((image, index) => (                    
                    <Image 
                        className='slide' 
                        key={index} 
                        src={image.url} 
                        alt={image.altText} 
                        style={{ transform: `translateX(${-imgIndex * 100}%)`, transition: '0.5s' }} 
                        loading='lazy' 
                    />
                ))}
            </div>
            <div className='slideshow-dots-container'>
                <div className="slideshow-dots" style={dotsStyling} >
                    {images.map((_, index) => (
                        <div key={index} className={`slideshow-dot${imgIndex === index ? " active" : ""}`} onClick={() => {setImgIndex(index);}}></div>
                    ))}
                </div>
            </div>
        </div>
    );
}
