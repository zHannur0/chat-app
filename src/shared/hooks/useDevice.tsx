import { useMediaQuery } from './useMediaQuery';

interface DeviceConfig {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    isLargeScreen: boolean;
    isTouchDevice: boolean;
    isPortrait: boolean;
    isLandscape: boolean;
}

export function useDevice(): DeviceConfig {
    const isMobile = useMediaQuery('(max-width: 640px)');
    const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
    const isDesktop = useMediaQuery('(min-width: 1025px)');
    const isLargeScreen = useMediaQuery('(min-width: 1536px)');
    
    const isTouchDevice = useMediaQuery('(hover: none) and (pointer: coarse)');
    
    const isPortrait = useMediaQuery('(orientation: portrait)');
    const isLandscape = useMediaQuery('(orientation: landscape)');

    return {
        isMobile,
        isTablet,
        isDesktop,
        isLargeScreen,
        isTouchDevice,
        isPortrait,
        isLandscape,
    };
}