import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState<boolean>(false);
    
    useEffect(() => {
        const media = window.matchMedia(query);
        
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        
        const listener = (event: MediaQueryListEvent) => {
            setMatches(event.matches);
        };
        
        if (media.addEventListener) {
            media.addEventListener('change', listener);
        } else {
            media.addListener(listener);
        }
        
        return () => {
            if (media.removeEventListener) {
                media.removeEventListener('change', listener);
            } else {
                media.removeListener(listener);
            }
        };
    }, [query, matches]); 
    
    return matches;
}