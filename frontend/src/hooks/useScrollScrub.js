import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Ensure plugins are registered
gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * A reusable hook for creating GSAP ScrollTrigger timelines with proper cleanup.
 * @param {Object} options
 * @param {React.MutableRefObject} options.trigger - Ref to the trigger element
 * @param {React.MutableRefObject} options.scope - Ref to the scope element (usually same as trigger)
 * @param {string} [options.start="top top"] - ScrollTrigger start position
 * @param {string|number} [options.end="+=1000"] - ScrollTrigger end position
 * @param {boolean|number} [options.scrub=1] - Scrub value
 * @param {boolean} [options.pin=true] - Whether to pin the trigger
 * @param {Function} animationCallback - Callback to define animations on the created timeline
 */
export const useScrollScrub = ({
    trigger,
    scope,
    start = "top top",
    end = "+=2000",
    scrub = 1,
    pin = true,
    ...config
}, animationCallback) => {

    useGSAP(() => {
        if (!trigger.current) return;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: trigger.current,
                start,
                end,
                scrub,
                pin,
                anticipatePin: 1,
                ...config
            }
        });

        // Execute user animation logic
        if (animationCallback) {
            animationCallback(tl);
        }

    }, { scope: scope || trigger }); // Auto-scope to trigger if scope not provided
};
