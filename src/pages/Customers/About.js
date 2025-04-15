import React from 'react';
import Nav from './Nav';
import './about.css';

function About() {
  return (
    <>
      <Nav />
      <h1 className="about-heading">About BazaarHub</h1>
      <section className="split-hero">
        <div className="hero-text">
          <h1>
            Bringing Bazaar Culture to <span className="highlight">Your Fingertips.</span>
          </h1>
          <p>
            At <strong> BazaarHub</strong>, we believe tradition and technology go hand in hand. With just one tap, explore Nepal’s rich culinary culture and support local businesses without stepping out.
          </p>
          <p className="secondary-text">
            Join our mission to empower communities, reduce waste, and serve food with soul. Because a better future starts with better choices today.
          </p>
          <button className="hero-btn">Explore BazaarHub</button>
        </div>
        <div className="hero-image">
          <img src="food.jpeg" alt="Delicious food from BazaarHub" />
        </div>
      </section>
    </>
  );
}

export default About;
