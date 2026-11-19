import './LoadingIndicator.css';

/** 不确定时长的资源加载提示 */
interface LoadingIndicatorProps {
  /** 同时用于可见文字与进度元素的可访问名称 */
  label: string;
}

/** 不提供虚假的百分比，也不通过 live region 反复播报短暂的中间状态。 */
export const LoadingIndicator = ({ label }: LoadingIndicatorProps) => (
  <div className="loading-indicator">
    <progress className="loading-indicator__spinner" aria-label={label} />
    <span aria-hidden="true">{label}</span>
  </div>
);
