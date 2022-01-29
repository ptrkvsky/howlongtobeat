import { useState, useEffect } from 'react';

const useFilter = () => {
  const [isFiltered, setIsFiltered] = useState(true);

  useEffect(() => {
    setIsFiltered(false);
  }, []);

  return isFiltered;
};

export default useFilter;
