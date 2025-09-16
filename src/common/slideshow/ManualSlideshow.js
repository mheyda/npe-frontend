import { useEffect, useState, useRef } from 'react';
import Image from '../../common/image/Image.js';
import './Slideshow.css';


export default function ManualSlideshow( { images } ) {

    const slidesRef = useRef(null);
    const [imgIndex, setImgIndex] = useState(0);
    const [dotsStyling, setDotsStyling] = useState({ transform: 'translateX(0px)', transition: '0.5s' })
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const mql = window.matchMedia('(pointer: coarse)');
        setIsMobile(mql.matches);

        const handler = (e) => setIsMobile(e.matches);
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, []);

     useEffect(() => {
        if (!isMobile) return;

        const container = slidesRef.current;
        if (!container) return;

        const onScroll = () => {
            const slideWidth = container.offsetWidth;
            const newIndex = Math.round(container.scrollLeft / slideWidth);
            setImgIndex(newIndex);
        };

        container.addEventListener('scroll', onScroll);
        return () => container.removeEventListener('scroll', onScroll);
    }, [isMobile]);

    useEffect(() => {
        if (images.length > 4) {
            if (imgIndex > 1 && imgIndex < images.length - 2) {
                setDotsStyling({ transform: `translateX(calc(${-imgIndex  * 22}px + 44px))`, transition: '0.5s' });
            } else if (imgIndex === 0) {
                setDotsStyling({ transform: 'translateX(0px)', transition: '0.5s' });
            }
            else if (imgIndex === images.length - 1) {
                setDotsStyling({ transform: `translateX(calc(${-imgIndex * 22}px + 88px))`, transition: '0.5s'})
            }
        }
    }, [imgIndex, images.length])

    return (
        <div className='slideshow'>
            <div className='slideshow-btns'>
                <i className='slideshow-left fa-solid fa-circle-arrow-left' onClick={(e) => {imgIndex === 0 ? setImgIndex(images.length - 1) : setImgIndex(imgIndex - 1); e.preventDefault()}}></i>
                <i className="slideshow-right fa-solid fa-circle-arrow-right" onClick={(e) => {imgIndex === images.length - 1 ? setImgIndex(0) : setImgIndex(imgIndex + 1); e.preventDefault()}}></i>
            </div>
            <div className="slides" ref={slidesRef} style={{ overflowX: isMobile ? 'auto' : 'hidden' }}>
                {images.map((image, index) => {
                    const style = isMobile
                        ? {}
                        : { transform: `translateX(${-imgIndex * 100}%)`, transition: '0.5s' };

                    return (
                        <Image
                            className="slide"
                            key={index}
                            src={image.url}
                            alt={image.altText}
                            style={style}
                            loading="lazy"
                        />
                    );
                })}
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