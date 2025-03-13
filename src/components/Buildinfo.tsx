import React from 'react';
import './BuildInfo.css';

interface BuildInfoProps {
  buildTime: string;
  author: string;
}

export const BuildInfo: React.FC<BuildInfoProps> = ({ buildTime, author }) => {
  return (
    <div className="build-info">
      <span>Build Time: {buildTime}</span>
      <span>Author: {author}</span>
    </div>
  );
};
