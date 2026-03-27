import styles from './Loading.module.css';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
}

export function Loading({ size = 'medium', text }: LoadingProps) {
  return (
    <div className={styles.container}>
      <div className={`${styles.spinner} ${styles[size]}`} />
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );
}

export function Skeleton({ width, height, borderRadius = '4px' }: {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
}) {
  return (
    <div 
      className={styles.skeleton}
      style={{ 
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius,
      }}
    />
  );
}
