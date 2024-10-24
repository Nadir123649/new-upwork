import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Navbar from '../../components/Navbar/Navbar';
import './About.css';
import linkedinIcon from './images/linkedin.png';
import discordIcon from './images/discord.png';
import seminarSeriesImage from './images/seminar_series.png';

const About = () => {
  return (
    <div className="about-container">
      <Header />
      <div className="about-content">
        <Navbar />
        <div className="about-main">
          <section className="about-header">
            <h1>About CrossValidation.ai</h1>
          </section>

          <section className="about-description">
            <p>
              CrossValidation.ai is a Catholic AI Investing Spiritual Guide that analyzes generative AI metrics of public companies, assesses how well these align with Catholic values, then scores the companies current efficiency to identify the best Catholic AI-Efficiency companies.
            </p>
          </section>

          <section className="about-section">
            <h2>Our Product</h2>
            <div className="about-grid">
              <div className="about-column">
                <ol>
                  <li>Research public company initiatives in Generative AI, Catholic Values, and Efficiency Metrics.</li>
                  <li>Analyze rankings and activities of companies and sectors of your interest.</li>
                  <li>Catholic gospel messages are integrated in our research to share Jesus' teachings related to Generative AI activity.</li>
                </ol>

                <h3>Current Application Capabilities</h3>
                <p>
                  Our application currently allows for researching S&P 500 companies. Soon live investing will be supported via the platform. 
                </p>

                <h3>Major AI Topics</h3>
                <ul>
                  <li><strong>AI Product Traction:</strong> Analyzing company's AI-driven products and their market impact.</li>
                  <li><strong>Research and Development:</strong> Evaluating AI research initiatives and technological advancements.</li>
                  <li><strong>Financial Impact:</strong> Assessing the influence of AI on company financials and market position.</li>
                  <li><strong>Future Plans:</strong> Exploring strategic AI initiatives and projected growth areas.</li>
                </ul>
              </div>

              <div className="about-column">
                <h3>Catholic Values Assessment</h3>
                <ul>
                  <li>Family Values</li>
                  <li>Economic Justice</li>
                  <li>Conflict Resolution</li>
                  <li>Worker Rights</li>
                  <li>Charitable Efforts</li>
                  <li>Education</li>
                  <li>Healthcare</li>
                  <li>Common Good</li>
                  <li>Social Justice</li>
                </ul>
                <h3>Our Story</h3>
                <p>
                  CrossValidation.ai was founded by Adrian Bialonczyk, who previously founded the quantitative hedge fund Algo Depth in 2016. Adrian is an active member of the Catholic community around Menlo Park. The startup's mission includes biblical teachings, aligning AI best practices with corporate activity, and growing faith-based communities.
                </p>
              </div>
            </div>
          </section>

          <section className="about-section events-section">
            <h2>Catholic Generative AI Investing Events</h2>
            <p className="section-description">During the summer we hosted Quant AI Seminar series where speakers shared valuable insights on best practices for startups and enterprise companies to follow.</p>
            <div className="event-content">
              <img src={seminarSeriesImage} alt="Seminar Series" className="event-image" />
              <div className="event-details">
                <p>Stay Tuned For Future Events</p>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>Research Publications</h2>
            <div className="research-links">
              <a href="https://drive.google.com/file/d/1soRjFO82p6qPOI87q9H-p9q5AhVL6AK8/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="research-box">
                <h4>Quarterly S&P Machine Learning Alpha Strategy</h4>
                <p>Systematic analysis and trading strategy for S&P sectors</p>
              </a>
              <a href="https://drive.google.com/file/d/1_c1vPSzcMCqgWrbjTMYvI4clnzdiw-CE/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="research-box">
                <h4>Twitter NLP Breaking News</h4>
                <p>Analyzing breaking news on Twitter using Natural Language Processing</p>
              </a>
              <a href="https://drive.google.com/file/d/13YM9NJ-vNfVdAcmQCWOdsWvuo2j7ObfQ/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="research-box">
                <h4>FinBert Market Moving Text Analysis</h4>
                <p>Using FinBert for market-moving text analysis in financial markets</p>
              </a>
            </div>
          </section>

          <section className="about-section contact-section" id="contact-section">
            <h2>Contact Information</h2>
            <p><strong>Address:</strong> 500 Fremont Street #A, Menlo Park, CA 94025</p>
            <p><strong>Email:</strong> Adrian@CrossValidation.ai</p>
            <p><strong>Phone:</strong> (401) 935-4878</p>
            <div className="social-links">
              <a href="https://www.linkedin.com/company/trycrossvalidation/?viewAsMember=true" target="_blank" rel="noopener noreferrer">
                <img src={linkedinIcon} alt="LinkedIn" /> LinkedIn
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;