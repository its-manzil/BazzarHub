import React from 'react';
import Nav from './Nav';
import './about.css';
import Logo from "./Logo";
import CartLogo from "./CartLogo";

function About() {
  return (
    <>
      <Nav />
      <Logo/>
      <CartLogo/>
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Revolutionizing <span className="highlight">Nepali Commerce</span>, One Connection at a Time
          </h1>
          <p className="hero-subtitle">
            BazaarHub isn't just a platform - it's a movement to digitize Nepal's vibrant marketplace culture while preserving its authentic soul.
          </p>
          <button className="cta-button">Join Our Marketplace</button>
        </div>
        <div className="hero-image-container">
          <img 
            src="/images/BazaarHub.png" 
            alt="BazaarHub Marketplace" 
            className="hero-image"
          />
          <div className="image-overlay"></div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="mission-content">
          <h2 className="section-title">Our <span className="highlight">Mission</span></h2>
          <div className="mission-grid">
            <div className="mission-card">
              <div className="card-icon">🛒</div>
              <h3>Digitizing Tradition</h3>
              <p>Bringing Nepal's age-old bazaar culture into the digital age without losing its authentic charm.</p>
            </div>
            <div className="mission-card">
              <div className="card-icon">🤝</div>
              <h3>Empowering Communities</h3>
              <p>Creating economic opportunities for local vendors and artisans across Nepal.</p>
            </div>
            <div className="mission-card">
              <div className="card-icon">🌱</div>
              <h3>Sustainable Commerce</h3>
              <p>Promoting eco-friendly practices that reduce waste in traditional market systems.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="story-section">
        <div className="story-container">
          <div className="story-image-wrapper">
            <img 
              src="/images/market-scene.jpg" 
              alt="Traditional Nepali Market" 
              className="story-image"
            />
          </div>
          <div className="story-content">
            <h2 className="section-title">Our <span className="highlight">Story</span></h2>
            <p className="story-text">
              Founded in 2023, BazaarHub began as a simple idea: what if we could capture the energy of Nepal's bustling markets and make it accessible to everyone, everywhere?
            </p>
            <p className="story-text">
              Our team of tech enthusiasts and cultural preservationists came together to build a bridge between tradition and innovation. We've grown from a small Kathmandu startup to a nationwide platform serving thousands of vendors and customers daily.
            </p>
            <div className="milestones">
              <div className="milestone">
                <span className="milestone-number">500+</span>
                <span className="milestone-text">Local Vendors</span>
              </div>
              <div className="milestone">
                <span className="milestone-number">10K+</span>
                <span className="milestone-text">Happy Customers</span>
              </div>
              <div className="milestone">
                <span className="milestone-number">15+</span>
                <span className="milestone-text">Cities Served</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <h2 className="section-title centered">Our Core <span className="highlight">Values</span></h2>
        <div className="values-container">
          <div className="value-card">
            <h3>Authenticity</h3>
            <p>We preserve the true essence of Nepali market culture in every digital interaction.</p>
          </div>
          <div className="value-card">
            <h3>Innovation</h3>
            <p>We constantly evolve our platform to better serve both vendors and customers.</p>
          </div>
          <div className="value-card">
            <h3>Community</h3>
            <p>We believe commerce should strengthen social bonds, not replace them.</p>
          </div>
          <div className="value-card">
            <h3>Sustainability</h3>
            <p>We promote practices that honor both people and the planet.</p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <h2 className="section-title centered">Meet The <span className="highlight">Team</span></h2>
        <p className="team-subtitle">The passionate minds behind BazaarHub's success</p>
        <div className="team-grid">
          <div className="team-member">
            <div className="member-image"></div>
            <h3>John Doe</h3>
            <p>Founder & CEO</p>
          </div>
          <div className="team-member">
            <div className="member-image"></div>
            <h3>Jane Smith</h3>
            <p>Head of Product</p>
          </div>
          <div className="team-member">
            <div className="member-image"></div>
            <h3>Raj Sharma</h3>
            <p>Tech Lead</p>
          </div>
          <div className="team-member">
            <div className="member-image"></div>
            <h3>Priya Gurung</h3>
            <p>Community Manager</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2 className="cta-title">Ready to Experience <span className="highlight">BazaarHub</span>?</h2>
        <p className="cta-text">Join thousands of customers and vendors in Nepal's fastest growing digital marketplace.</p>
        <div className="cta-buttons">
          <button className="cta-button primary">Shop Now</button>
          <button className="cta-button secondary">Sell With Us</button>
        </div>
      </section>
    </>
  );
}

export default About;