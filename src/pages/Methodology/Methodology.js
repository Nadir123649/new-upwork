import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Header from '../../components/Header/Header';
import Navbar from '../../components/Navbar/Navbar';
import './Methodology.css';
import SymbolList from '../../components/SymbolList/SymbolList';

const Methodology = () => {
  const [query, setQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const { userId, tempUserId } = useSelector(state => state.user);

  const effectiveUserId = userId || tempUserId;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('http://localhost:5052/historical_data_query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: effectiveUserId, query }),
      });

      if (response.ok) {
        const data = await response.json();
        setSubmitMessage(data.message);
        setQuery('');
      } else {
        setSubmitMessage('Error submitting query. Please try again.');
      }
    } catch (error) {
      setSubmitMessage('Error submitting query. Please try again.');
    }

    setIsSubmitting(false);
  };


  return (
    <div className="methodology-container">
      <Header />
      <div className="methodology-content">
        <Navbar />
        <div className="methodology-main">

          <section className="methodology-section welcome-section">
            <h1>Catholic AI Efficiency Index Methodology</h1>
            <div className="welcome-text">
              <p>
                Welcome to the Catholic AI Efficiency Index Methodology and Investment Platform. Our approach integrates Catholic teachings with AI-driven analysis for faith-guided investing.
              </p>
              <p>
                Our platform features a sophisticated chatbot that provides access to current and historical data on companies, peer groups, and overall scores. This empowers you to make informed decisions aligned with your faith and values.
              </p>
              <p>
                Explore our methodology sections below to understand our scoring system, and use our chatbot to perform detailed queries on company rankings, AI metrics, and more.
              </p>
            </div>
          </section>

          <section className="methodology-section">
            <h2>Historical and Realtime Daily Data Available In Our Investing Agent Queries</h2>
            <p>Our chat provides several key functionalities to assess and compare companies (which include Catholic gospel teachings and are updated daily). In the Investing Agent chatbot the more specifically you call these functions (by name and as relevant include their input parameters) this will ensure you are retrieving data for the specific function.</p>
            <ul>
              <li><strong>get_company_ranking:</strong> Ranks companies based on their overall AI Catholic Efficiency Score.</li>
              <li><strong>get_ai_scores:</strong> Retrieves specific AI metrics for one or multiple companies.</li>
              <li><strong>get_comprehensive_data:</strong> Provides detailed information about specific companies, including AI scores, rankings, and other relevant data.</li>
              <li><strong>get_peer_group_data:</strong> Retrieves data for all companies in a specified peer group.</li>
              <li><strong>get_top_companies_comprehensive:</strong> Provides detailed information about the top-performing companies, optionally within a specific peer group.</li>
              <li><strong>get_all_normalized_percentile_ranks:</strong> Retrieves normalized percentile ranks for all companies.</li>
              <li><strong>get_specific_ai_metric_for_all_companies:</strong> Retrieves a specific AI metric value for all companies.</li>
              <li><strong>get_all_ai_metrics_for_symbol:</strong> Retrieves all AI metric values for a specific company.</li>
            </ul>
            <p>These functions can be used with various parameters, including specific symbols, peer groups, and AI metrics.</p>
          </section>

          <section className="methodology-section">
            <h3>AI Score Calculation</h3>
            <p>The AI score is calculated based on 11 main categories, each containing multiple sub-categories:</p>
            
            <div className="ai-categories">
              <div className="ai-category">
                <h4>1. AI Products &amp; Services</h4>
                <ul>
                  <li>Number of AI consumer products</li>
                  <li>Number of AI enterprise products</li>
                  <li>AI product global TAM (dollars)</li>
                  <li>Current market share percentage</li>
                  <li>Total AI product enterprise users</li>
                  <li>Total AI product consumer users</li>
                  <li>AI product revenue</li>
                  <li>Forecasted AI product revenue (1 year)</li>
                  <li>Number of internal AI products</li>
                  <li>Number of external AI products</li>
                  <li>Average AI product user growth rate</li>
                  <li>AI product customer satisfaction score</li>
                </ul>
              </div>

              <div className="ai-category">
                <h4>2. AI Research &amp; Development</h4>
                <ul>
                  <li>AI research &amp; development budget</li>
                  <li>Number of AI-related publications</li>
                  <li>Number of AI patents filed</li>
                  <li>Number of AI researchers</li>
                  <li>Number of foundational AI models offered</li>
                  <li>Number of AI infrastructure tools offered</li>
                  <li>Number of enterprise AI applications offered</li>
                  <li>Largest AI model parameters of internally developed model</li>
                  <li>Number of AI research partnerships</li>
                </ul>
              </div>

              <div className="ai-category">
                <h4>3. AI Impact on Business Operations</h4>
                <ul>
                  <li>AI-driven cost savings</li>
                  <li>AI-driven revenue increase</li>
                  <li>AI-driven margin improvement</li>
                  <li>Percentage of processes using AI</li>
                  <li>AI-driven productivity improvement</li>
                  <li>AI-driven error reduction percentage</li>
                  <li>AI-improved customer satisfaction score</li>
                  <li>AI-driven time savings (hours)</li>
                </ul>
              </div>

              <div className="ai-category">
                <h4>4. AI Future Plans &amp; Strategy</h4>
                <ul>
                  <li>Total planned AI investment amount (next 3 years)</li>
                  <li>Number of planned AI products (next 3 years)</li>
                  <li>Projected AI revenue percentage (in 3 years)</li>
                  <li>Projected AI market share (in 3 years)</li>
                  <li>Planned AI-related acquisitions (next 3 years)</li>
                  <li>Projected AI talent growth rate</li>
                </ul>
              </div>

              <div className="ai-category">
                <h4>5. AI Ethics &amp; Governance</h4>
                <ul>
                  <li>Existence of AI ethical guidelines</li>
                  <li>Participation in government AI policy initiatives</li>
                </ul>
              </div>

              <div className="ai-category">
                <h4>6. AI Financials &amp; Investments</h4>
                <ul>
                  <li>Total AI investment, acquisitions, and expenses (last 12 months)</li>
                  <li>Number of AI-related acquisitions (last 12 months)</li>
                  <li>Total value of AI acquisitions (last 12 months)</li>
                  <li>AI revenue percentage of total revenue (last 12 months)</li>
                  <li>AI investment percentage of total R&amp;D (last 12 months)</li>
                  <li>AI infrastructure investment (last 12 months)</li>
                </ul>
              </div>

              <div className="ai-category">
                <h4>7. AI Partnerships &amp; Ecosystems</h4>
                <ul>
                  <li>Total number of AI partnerships (last 12 months)</li>
                  <li>Total value of AI partnership deals (last 12 months)</li>
                  <li>Number of academic AI partnerships (last 12 months)</li>
                  <li>Number of industry AI partnerships (last 12 months)</li>
                </ul>
              </div>

              <div className="ai-category">
                <h4>8. AI Talent &amp; Workforce</h4>
                <ul>
                  <li>Total number of AI-specific roles</li>
                  <li>Planned new AI hires (next year)</li>
                  <li>Average compensation for AI roles</li>
                  <li>AI talent retention rate</li>
                  <li>Percentage of workforce in AI roles</li>
                  <li>Number of AI training programs</li>
                  <li>AI employee satisfaction score</li>
                </ul>
              </div>

              <div className="ai-category">
                <h4>9. AI Infrastructure &amp; Capabilities</h4>
                <ul>
                  <li>Number of AI-specific data centers</li>
                  <li>AI model training cost</li>
                </ul>
              </div>

              <div className="ai-category">
                <h4>10. AI Market Perception</h4>
                <ul>
                  <li>Sentiment of company's perceived AI leadership score (0-10)</li>
                  <li>Percent of positive AI media mentions (0-100)</li>
                  <li>Number of AI conference presentations</li>
                </ul>
              </div>

              <div className="ai-category">
                <h4>11. AI Distribution &amp; Integration</h4>
                <ul>
                  <li>Number of internal channels to distribute AI products to customers</li>
                  <li>Total consumer users reachable through internal AI channels</li>
                  <li>Total enterprise users reachable through internal AI channels</li>
                  <li>Number of third-party integrations using company's AI products</li>
                </ul>
              </div>
            </div>

            <p>Each category and sub-category is weighted to create the company's overall Generative AI score. The weights are determined based on the relative importance and impact of each metric on the company's AI capabilities and potential.</p>
          </section>


          <section className="methodology-section">
            <h3>Efficiency Score Calculation</h3>
            <p>The efficiency score is based on 5 key metrics:</p>
            <ul>
              <li>Operating Profit Margin</li>
              <li>Return on Capital Employed</li>
              <li>Asset Turnover</li>
              <li>Cash Conversion Cycle</li>
              <li>Operating Cash Flow to Sales Ratio</li>
            </ul>
            <p>These metrics are weighted to create the company's overall efficiency score.</p>

            <h3>Catholic Score Calculation</h3>
            <p>The Catholic score is based on 10 categories, each rated 1-10 on the company's GenAI alignment with Catholic values:</p>
            <ul>
              <li>Human Dignity</li>
              <li>Common Good</li>
              <li>Subsidiarity</li>
              <li>Solidarity</li>
              <li>Preferential Option for the Poor</li>
              <li>Care for Creation</li>
              <li>Family Values</li>
              <li>Sanctity of Life</li>
              <li>Economic Justice</li>
              <li>Peace and Reconciliation</li>
            </ul>
          </section>

          <section className="methodology-section">
            <h2>Final Score Calculation</h2>
            <p>The final AI Catholic Efficiency Score is calculated using the following weights:</p>
            <ul>
              <li>AI Score: 50%</li>
              <li>Catholic Score: 30%</li>
              <li>Efficiency Score: 20% (lower efficiency scores are weighted more heavily due to greater growth opportunity)</li>
            </ul>
            <p>The formula for the final score can be represented as:</p>
            <pre className="formula">
              Final Score = 0.5 * AI_Score + 0.3 * Catholic_Score + 0.2 * (1 - Efficiency_Score)
            </pre>
          </section>

          <section className="methodology-section">
            <h2>Normalized Percentile Rank Calculation</h2>
            <p>To calculate the normalized percentile rank, we first compute the raw percentile rank for each company based on their final score. Then, we normalize this rank by the industry average to account for different rates of AI adoption and efficiency across industries.</p>
            <p>The process can be summarized as:</p>
            <ol>
              <li>Calculate raw percentile rank for each company</li>
              <li>Calculate industry average percentile rank</li>
              <li>Normalize company rank by industry average</li>
            </ol>
            <p>The formula for normalized percentile rank can be represented as:</p>
            <pre className="formula">
              Normalized_Percentile_Rank = (Raw_Percentile_Rank - Industry_Average_Rank) / Industry_Standard_Deviation + 0.5
            </pre>
          </section>


          <section className="methodology-section">
            <h2>Companies and Peer Groups</h2>
            
            <SymbolList />

            <div className="subsection">
              <h3>Peer Groups</h3>
              <p>Companies are categorized into the following peer groups:</p>
              <ul className="peer-group-list">
                <li>Tech Giants and AI Leaders</li>
                <li>Semiconductor and Hardware</li>
                <li>Enterprise Software and Cloud</li>
                <li>Cybersecurity and Networking</li>
                <li>Data and Analytics</li>
                <li>Fintech and Payment</li>
                <li>E-commerce and Digital Platforms</li>
                <li>Social Media and Entertainment</li>
                <li>Telecom and Communication</li>
                <li>Banking and Financial Services</li>
                <li>Healthcare Technology</li>
                <li>Biotech and Pharma</li>
                <li>Industrial Technology</li>
                <li>Automotive and Transportation</li>
                <li>Aerospace and Defense</li>
                <li>Retail and Consumer Technology</li>
                <li>Energy and Utilities</li>
                <li>Financial Market Infrastructure</li>
                <li>Emerging Tech and AI Startups</li>
                <li>Consumer Goods and Services</li>
              </ul>
            </div>
          </section>


          <section className="methodology-section">
            <h2>Limitations and Considerations</h2>
            <ul>
              <li>Data is derived from public news sources and may not always reflect the most recent or precise information.</li>
              <li>The use of generative AI models for data processing may introduce biases or inaccuracies.</li>
              <li>AI is a rapidly evolving field, and the relative importance of different metrics may change over time.</li>
              <li>The Catholic perspective provided is meant to encourage reflection and should not be considered official Church doctrine.</li>
              <li>Efficiency scores and AI scores are based on weighted calculations and may not capture all nuances of a company's performance.</li>
              <li>Investment decisions should not be made solely based on the AI Efficiency Index or platform recommendations. Always consider your personal financial situation and consult with a financial advisor.</li>
            </ul>
          </section>

          <section className="methodology-section historical-data-section">
            <h2>Historical Data Access</h2>
            <p>
              Sample historical Catholic Generative AI Efficiency Metrics to test them in mid and low frequency equity investing strategies. Provide a specific query for which metrics you'd like historical data for and we will email you a csv file with the historical data for analysis (free historical data available 1/1/2024-9/12/2024; register in the signup tab to submit your query below).
            </p>
            <p>
              Query may include specific AI_metrics for specific companies, or Overall rankings for all companies over a time period. Note that only logged-in users (free account) can submit their query to receive their free historical data for up to ten S&P 500 companies.
            </p>
            {effectiveUserId && effectiveUserId <= 4000 ? (
              <form onSubmit={handleSubmit} className="query-form">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter your query here..."
                  rows="4"
                  required
                ></textarea>
                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Query'}
                </button>
                {submitMessage && <p className="submit-message">{submitMessage}</p>}
              </form>
            ) : (
              <p className="login-message">
                Please <Link to="/signup">sign up</Link> or <Link to="/login">log in</Link> to submit a query for historical data.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Methodology;