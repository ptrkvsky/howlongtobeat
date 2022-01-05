import { RefObject, useEffect } from 'react';

/**
 * Hook that alerts clicks outside of the passed ref
 */
const useOutsideAlerter = (
  ref: RefObject<HTMLDivElement>,
  action: () => void,
) => {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event: any) {
      if (ref.current && !ref.current.contains(event.target)) {
        action();
      }
    }

    // Bind the event listener
    document.addEventListener(`mousedown`, handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener(`mousedown`, handleClickOutside);
    };
  }, [ref]);
};

export default useOutsideAlerter;
