import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-bg-0">
      <div className="flex flex-col items-center gap-4">
        <div className="cosmic-loading-pulse w-24 h-24 rounded-xl flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-accent/50 border-t-accent rounded-full animate-spin" />
        </div>
        <p className="cosmic-title text-text-med text-sm">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
