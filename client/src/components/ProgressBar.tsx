import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to max
  max?: number;
  label?: string;
  showPercent?: boolean;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label = 'Progress',
  showPercent = false,
  color,
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  return (
    <div style={{ width: '100%' }}>
      {showPercent && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <span>{label}</span>
          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{percentage}%</span>
        </div>
      )}
      <div
        className="progress-container"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div
          className="progress-bar-fill"
          style={{
            width: `${percentage}%`,
            ...(color ? { background: color } : {}),
          }}
        />
      </div>
    </div>
  );
};
