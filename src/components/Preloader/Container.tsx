import { FC, useEffect, useRef } from 'react';
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

  //const callBackTransition = () => null;
  const callBackTransition = () => dispatch(setIsLoaded());

  useEffect(() => {
    if (!isLoaded) {
      gsap.set(refTemplate.current, {
        display: `none`,
      });
      transition(refPreloader, refTemplate, callBackTransition);
    }
  }, []);

  return (
    <>
      {!isLoaded && <Preloader ref={refPreloader} />}

      <div className="wrapper-template" ref={refTemplate}>
        <Template />
      </div>
    </>
  );
};

export default PreloaderContainer;
