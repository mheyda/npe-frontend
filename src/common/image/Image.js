import { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import './Image.css';

export default function Image({ src, alt, style, className }) {

    const [isLoading, setIsLoading] = useState(true);

    const { ref, inView } = useInView({
        threshold: 0,
        triggerOnce: true,
    });

    return (
        <div className={className} ref={ref} style={style} >
            <img 
                className={`slide-img fade-in-image ${isLoading ? '' : 'loaded'}`}
                src={inView ? src : null} 
                alt={alt} 
                onLoad={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
            />
        </div>
    );
}
