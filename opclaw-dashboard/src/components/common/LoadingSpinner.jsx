import './LoadingSpinner.css';

export default function LoadingSpinner({ size = 'md', text = '加载中...' }) {
  return (
    <div className="loading-wrapper">
      <div className={`spinner spinner-${size}`} />
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
}
