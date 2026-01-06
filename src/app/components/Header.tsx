import React from 'react';

interface HeaderProps {
  progress: number;
}

export function Header({ progress }: HeaderProps) {
  return (
    <header className="app-header">
      <h1>Resume Generator</h1>
      <div className="form-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="progress-text">{progress}% Complete</span>
      </div>
    </header>
  );
}