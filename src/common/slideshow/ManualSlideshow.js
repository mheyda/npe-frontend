import { useEffect, useState, useRef } from 'react';
import Image from '../../common/image/Image.js';
import './Slideshow.css';


export default function ManualSlideshow( { images } ) {

    const imagesWithBlankStart = [{ url: '', altText: '' }, ...images];
    const lastIndex = imagesWithBlankStart.length - 1;
    const [imgIndex, setImgIndex] = useState(1);
    const [dotsStyling, setDotsStyling] = useState({ transform: 'translateX(0px)', transition: '0.8s' })
    const [touchStartX, setTouchStartX] = useState(null);
    const [touchEndX, setTouchEndX] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [touchStartTime, setTouchStartTime] = useState(null);

    const slideshowRef = useRef(null);

    const safeSetImgIndex = (newIndex) => {
        if (isTransitioning) return;

        if (newIndex === 0) {
            newIndex = 1; // Snap back to first real image
        }
        setIsTransitioning(true);
        setImgIndex(newIndex);
    };

    const onTouchStart = (e) => {
        setTouchStartX(e.touches[0].clientX);
        setTouchStartTime(Date.now());
        setIsDragging(true);
    };

    const onTouchMove = (e) => {
        if (touchStartX === null) return;
        const currentX = e.touches[0].clientX;
        const delta = currentX - touchStartX;
        setTouchEndX(currentX);
        setDragOffset(delta);
    };

    const onTouchEnd = () => {
        if (touchStartX === null || touchEndX === null) {
            setIsDragging(false);
            return;
        }

        const distance = touchEndX - touchStartX;
        const time = Date.now() - touchStartTime;
        const velocity = Math.abs(distance) / time;

        const containerWidth = slideshowRef.current?.offsetWidth || 0;
        const minDistance = containerWidth * 0.5;
        const minVelocity = 0.3;

        const shouldSwipe = Math.abs(distance) > minDistance || velocity > minVelocity;

        setDragOffset(0);
        setIsDragging(false);

        if (shouldSwipe) {
            if (distance < 0 && imgIndex < lastIndex) {
                safeSetImgIndex(imgIndex + 1);
            } else if (distance > 0 && imgIndex > 1) {
                safeSetImgIndex(imgIndex - 1);
            } else if (imgIndex === 1 && distance > 0) {
                safeSetImgIndex(1); // snap back to first
            }
        }

        // Always reset touch tracking
        setTouchStartX(null);
        setTouchEndX(null);
        setTouchStartTime(null);
    };

    useEffect(() => {
        const realIndex = imgIndex - 1;

        if (images.length > 4) {
            if (realIndex > 1 && realIndex < images.length - 2) {
                setDotsStyling({ transform: `translateX(calc(${-realIndex * 22}px + 44px))`, transition: '0.8s' });
            } else if (realIndex === 0) {
                setDotsStyling({ transform: 'translateX(0px)', transition: '0.8s' });
            } else if (realIndex === images.length - 1) {
                setDotsStyling({ transform: `translateX(calc(${-realIndex * 22}px + 88px))`, transition: '0.8s' });
            }
        }
    }, [imgIndex, images.length]);

    useEffect(() => {
        if (!isTransitioning) return;

        const timeout = setTimeout(() => {
            setIsTransitioning(false);
        }, 300);

        return () => clearTimeout(timeout);
    }, [isTransitioning]);

    return (
        <div className='slideshow' ref={slideshowRef}>
            <div className='slideshow-btns'>
                <i 
                    className='slideshow-left fa-solid fa-circle-arrow-left' 
                    onClick={(e) => {
                        e.preventDefault();
                        imgIndex === 1 ? safeSetImgIndex(lastIndex) : safeSetImgIndex(imgIndex - 1); 
                    }}
                ></i>
                <i 
                    className="slideshow-right fa-solid fa-circle-arrow-right" 
                    onClick={(e) => {
                        e.preventDefault();
                        imgIndex === lastIndex ? safeSetImgIndex(1) : safeSetImgIndex(imgIndex + 1); 
                    }}
                ></i>
            </div>
            <div className="slides" 
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                {imagesWithBlankStart.map((image, index) => {   

                    const baseTranslate = -imgIndex * 100;
                    let dragTranslate = 0;
                    const containerWidth = slideshowRef.current?.offsetWidth || window.innerWidth;

                    if (isDragging && !isTransitioning) {
                        if (imgIndex === 1 && dragOffset > 0) {
                            dragTranslate = (dragOffset / containerWidth) * 30;
                        } else if (imgIndex === lastIndex && dragOffset < 0) {
                            dragTranslate = (dragOffset / containerWidth) * 30;
                        } else {
                            dragTranslate = (dragOffset / containerWidth) * 100;
                        }
                    }

                    const translateX = baseTranslate + dragTranslate;

                    if (index === 0) {
                        return (
                            <div
                                key="blank-slide"
                                className="slide"
                                style={{
                                    backgroundColor: 'inherit',
                                    transform: `translateX(${translateX}%)`,
                                    transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.25, 0.8, 0.5, 1)'
                                }}
                            />
                        );
                    }
                    return (                
                        <Image 
                            className='slide' 
                            key={index} 
                            src={image.url} 
                            alt={image.altText} 
                            style={{ transform: `translateX(${translateX}%)`, transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.25, 0.8, 0.5, 1)' }} 
                            loading='lazy' 
                        />
                    );
                })}
            </div>
            <div className='slideshow-dots-container'>
                <div className="slideshow-dots" style={dotsStyling} >
                    {imagesWithBlankStart.map((_, index) => {
                        if (index === 0) return null; // skip blank slide dot
                        return (
                            <div
                                key={index}
                                className={`slideshow-dot${imgIndex === index ? " active" : ""}`}
                                onClick={() => safeSetImgIndex(index)}
                            ></div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
