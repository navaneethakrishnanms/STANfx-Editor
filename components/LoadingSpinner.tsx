import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--accent-secondary)" stopOpacity="1" />
          <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g transform="translate(24, 24)">
        <path
          d="M 22 0 A 22 22 0 0 1 0 22"
          fill="none"
          stroke="url(#spinner-gradient)"
          strokeWidth="4"
          strokeLinecap="round"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 0 0"
            to="360 0 0"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </path>
      </g>
    </svg>
  );
};