import React, { useState } from 'react';
import { Button } from './Button';
import { Eye, EyeOff } from 'lucide-react';

interface ChartWrapperProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  fallbackData?: { label: string; value: string | number }[];
  fallbackHeaders?: [string, string];
}

export const ChartWrapper: React.FC<ChartWrapperProps> = ({
  title,
  description,
  children,
  fallbackData = [],
  fallbackHeaders = ['Category', 'Value'],
}) => {
  const [showTable, setShowTable] = useState(false);

  return (
    <div className="chart-wrapper" style={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{title}</h3>
          {description && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {description}
            </p>
          )}
        </div>
        {fallbackData.length > 0 && (
          <Button
            variant="secondary"
            onClick={() => setShowTable((prev) => !prev)}
            aria-label={showTable ? 'Hide data table' : 'View accessible data table'}
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
          >
            {showTable ? <EyeOff size={14} /> : <Eye size={14} />}
            <span>{showTable ? 'Chart View' : 'Table View'}</span>
          </Button>
        )}
      </div>

      {showTable ? (
        <table className="data-table" aria-label={`${title} Data Table`}>
          <thead>
            <tr>
              <th>{fallbackHeaders[0]}</th>
              <th>{fallbackHeaders[1]}</th>
            </tr>
          </thead>
          <tbody>
            {fallbackData.map((row, idx) => (
              <tr key={idx}>
                <td>{row.label}</td>
                <td style={{ fontWeight: 600 }}>{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <>
          <div aria-hidden="true" style={{ width: '100%', minHeight: '260px' }}>
            {children}
          </div>
          {/* Always accessible screen reader text fallback */}
          {fallbackData.length > 0 && (
            <div className="sr-only">
              <h4>{title} - Screen Reader Table</h4>
              <table>
                <thead>
                  <tr>
                    <th>{fallbackHeaders[0]}</th>
                    <th>{fallbackHeaders[1]}</th>
                  </tr>
                </thead>
                <tbody>
                  {fallbackData.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.label}</td>
                      <td>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};
