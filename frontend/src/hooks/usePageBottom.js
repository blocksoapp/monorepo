/*
 * Hook to detect when a user has scrolled to the bottom of the page.
 * https://designcode.io/react-hooks-handbook-usepagebottom-hook
 */
import { useState, useEffect } from "react";


export const usePageBottom = () => {
  const [reachedBottom, setReachedBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offsetHeight = document.documentElement.offsetHeight;
      const innerHeight = window.innerHeight;
      const scrollTop = document.documentElement.scrollTop;

      // 10px from bottom of window is considered bottom of page
      const hasReachedBottom = offsetHeight - (innerHeight + scrollTop) <= 10;
      setReachedBottom(hasReachedBottom);
    };

    // add event listener to user scrolling
    window.addEventListener("scroll", handleScroll);

    // clean up on component unmount
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return reachedBottom
};
