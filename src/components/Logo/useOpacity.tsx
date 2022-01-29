import { useState, useEffect } from 'react';

const useAnimation = () => {
  const [isOpacity, setIsOpacity] = useState(true);

  useEffect(() => {
    setIsOpacity(false);
  }, []);

  return isOpacity;
};

export default useAnimation;
