import React from 'react';
import './OptimalPortfolio.css';


const OptimalPortfolio = ({ portfolio }) => {
  const totalAllocation = portfolio.reduce((sum, position) => sum + position.percentage, 0);

  return (
    <div className="optimal-portfolio">
      <h2 className="portfolio-title">Your Optimal Portfolio</h2>
      <div className="portfolio-summary">
        <p>Total Allocation: {totalAllocation.toFixed(2)}%</p>
        <p>Number of Positions: {portfolio.length}</p>
      </div>
      <div className="portfolio-table-container">
        <table className="portfolio-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Company Name</th>
              <th>Allocation</th>
              <th>Shares</th>
              <th>Current Price</th>
              <th>Sector</th>
              <th>Catholic AI Score</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.map((position, index) => (
              <tr key={index}>
                <td>{position.symbol}</td>
                <td>{position.name}</td>
                <td>{position.percentage.toFixed(2)}%</td>
                <td>{position.shares}</td>
                <td>${position.close_price.toFixed(2)}</td>
                <td>{position.sector}</td>
                <td>{position.catholic_ai_efficiency_score.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="portfolio-explanation">
        <h3>Portfolio Explanation</h3>
        <p>{portfolio[0]?.granular_info_explanation || 'No explanation available.'}</p>
      </div>
    </div>
  );
};

export default OptimalPortfolio;