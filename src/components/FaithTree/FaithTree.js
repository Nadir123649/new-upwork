import React from 'react';
import './FaithTree.css';

const FaithTree = ({ data, userLevel }) => {
  const calculateGrowth = (category) => {
    return data && data[category] ? (data[category] / 10) * 100 : 0;
  };

  return (
    <div className="faith-tree">
      <h2>Your Faith Journey Progress (Level {userLevel || 1})</h2>
      <div className="tree-container">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
          <defs>
            <linearGradient id="treeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" style={{stopColor:"#4A90E2", stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:"#81C784", stopOpacity:1}} />
            </linearGradient>
            <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" style={{stopColor:"#FFFFFF", stopOpacity:0.8}} />
              <stop offset="100%" style={{stopColor:"#FFFFFF", stopOpacity:0}} />
            </radialGradient>
          </defs>
          
          {/* Base Tree Structure */}
          <path d="M200 380 L200 100 M140 320 L200 100 L260 320 M100 240 L200 100 L300 240" 
                stroke="url(#treeGradient)" strokeWidth="4" fill="none" />
          
          {/* Connecting Lines */}
          <path d="M100 240 L300 240 M140 320 L260 320" 
                stroke="url(#treeGradient)" strokeWidth="2" fill="none" />
          
          {/* Growth Nodes */}
          <g id="spiritual-direction" style={{transform: `scale(${1 + calculateGrowth('Spiritual Direction') / 100})`}}>
            <circle cx="100" cy="240" r="20" fill="url(#treeGradient)" />
            <circle cx="100" cy="240" r="25" fill="url(#glowGradient)" />
          </g>
          
          <g id="faith-work" style={{transform: `scale(${1 + calculateGrowth('Faith and Work Integration') / 100})`}}>
            <circle cx="200" cy="100" r="20" fill="url(#treeGradient)" />
            <circle cx="200" cy="100" r="25" fill="url(#glowGradient)" />
          </g>
          
          <g id="prayer-sacraments" style={{transform: `scale(${1 + calculateGrowth('Prayer, Sacraments, and Community') / 100})`}}>
            <circle cx="300" cy="240" r="20" fill="url(#treeGradient)" />
            <circle cx="300" cy="240" r="25" fill="url(#glowGradient)" />
          </g>
          
          {/* Cross Symbol */}
          <path d="M190 50 L210 50 L210 70 L230 70 L230 90 L210 90 L210 110 L190 110 L190 90 L170 90 L170 70 L190 70 Z" 
                fill="#FFD700" opacity="0.8" />
          
          {/* AI-inspired Circuit Lines */}
          <path d="M50 380 L350 380 M50 360 L350 360 M70 340 L330 340" 
                stroke="#4A90E2" strokeWidth="1" fill="none" strokeDasharray="5,5" />
          
          {/* Labels */}
          <text x="100" y="290" fontFamily="Arial" fontSize="12" fill="#FFFFFF" textAnchor="middle">Spiritual Direction</text>
          <text x="200" y="80" fontFamily="Arial" fontSize="12" fill="#FFFFFF" textAnchor="middle">Faith and Work</text>
          <text x="300" y="290" fontFamily="Arial" fontSize="12" fill="#FFFFFF" textAnchor="middle">Prayer and Sacraments</text>
        </svg>
      </div>
    </div>
  );
};

export default FaithTree;