import { RefObject } from 'react';

interface Props {
  refOverlay: RefObject<SVGPathElement>;
}

const Overlay = ({ refOverlay }: Props) => {
  return (
    // Edit the paths here: https://yqnn.github.io/svg-path-editor/ -->
    <svg
      className="overlay"
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <path
        className="overlay__path"
        vectorEffect="non-scaling-stroke"
        d="M 0 100 V 100 Q 50 100 100 100 V 100 z"
        ref={refOverlay}
      />
    </svg>
  );
};

export default Overlay;
