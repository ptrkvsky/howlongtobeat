import styles from './circularBar.module.css';

// Static port of react-circular-progressbar (same geometry): no client JS
const STROKE_WIDTH = 8;
const RADIUS = 50 - STROKE_WIDTH / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const PATH = `M 50,50 m 0,-${RADIUS} a ${RADIUS},${RADIUS} 0 1 1 0,${2 * RADIUS} a ${RADIUS},${RADIUS} 0 1 1 0,-${2 * RADIUS}`;

interface Props {
  percentage: number;
}

const CircularBar = ({ percentage }: Props) => {
  const offset =
    (1 - Math.min(Math.max(percentage, 0), 100) / 100) * CIRCUMFERENCE;

  return (
    <div className={styles.wrapper}>
      <svg className={styles.svg} viewBox="0 0 100 100">
        <path
          className={styles.trail}
          d={PATH}
          strokeWidth={STROKE_WIDTH}
          fillOpacity={0}
          strokeDasharray={`${CIRCUMFERENCE}px ${CIRCUMFERENCE}px`}
        />
        <path
          className={styles.path}
          d={PATH}
          strokeWidth={STROKE_WIDTH}
          fillOpacity={0}
          strokeDasharray={`${CIRCUMFERENCE}px ${CIRCUMFERENCE}px`}
          strokeDashoffset={`${offset}px`}
        />
        <text className={styles.text} x={50} y={50}>
          {percentage}%
        </text>
      </svg>
    </div>
  );
};

export default CircularBar;
