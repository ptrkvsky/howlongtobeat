import { FC, useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import Preloader from '.';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setIsLoaded } from '@/features/app/slices/appSlice';
import { transition } from './animation';

interface PreloaderContainerProps {
  Template: () => JSX.Element;
}

const PreloaderContainer: FC<PreloaderContainerProps> = ({ Template }) => {
  const dispatch = useAppDispatch();
  const { isLoaded } = useAppSelector((state) => state.app);
  const refTemplate = useRef<HTMLDivElement>(null);
  const refPreloader = useRef<HTMLDivElement>(null);

  console.log(isLoaded);

  useEffect(() => {
    if (!isLoaded) {
      gsap.set(refTemplate.current, {
        display: `none`,
      });
      transition(refPreloader, refTemplate, () => dispatch(setIsLoaded()));
    }
    console.log(isLoaded);
  }, []);

  return (
    <>
      {!isLoaded && (
        <Preloader
          // shouldExit={isImagesLoaded}
          ref={refPreloader}
          // countImagesLoaded={countImagesLoaded}
        />
      )}

      <div className="wrapper-template" ref={refTemplate}>
        <Template />
      </div>
    </>
  );
};

export default PreloaderContainer;
