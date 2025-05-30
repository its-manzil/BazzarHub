import React, { useState, useEffect, useCallback } from "react";

import Nav from "./Nav";
import "./Home.css";
import Search from "./Search";
import Trending from "./Trending";
import Logo from "./Logo";
import CartLogo from "./CartLogo";
function Home() {
  const [counter, setCounter] = useState(0);

  const slides = [
    { image: "./images/home1.jpg", alt: "Image 1" },
    { image: "./images/home2.jpg", alt: "Image 2" },
    { image: "./images/home3.jpg", alt: "Image 3" },
    { image: "./images/home4.jpg", alt: "Image 4" },
  ];

  // ✅ Memoized goNext to avoid eslint warning
  const goNext = useCallback(() => {
    setCounter((prevCounter) =>
      prevCounter === slides.length - 1 ? 0 : prevCounter + 1
    );
  }, [slides.length]);

  useEffect(() => {
    const interval = setInterval(goNext, 6000);
    return () => clearInterval(interval);
  }, [goNext]);

  return (
    <div className="main">
      <Nav />
      <Logo />
      <CartLogo />
      <div className="slideshow-container">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`slide ${index === counter ? "active" : ""}`}
          >
            <img
              className="fade"
              src={slide.image}
              alt={slide.alt}
              style={{ opacity: index === counter ? 1 : 0 }}
            />
          </div>
        ))}
        <div className="text-box">
          <h1 data-text="BazaarHub">BazaarHub</h1>
          <p>
            Shop in Grace, <br />
            Own Your Place.
          </p>
          <div className="seeyou">
            <Search />
          </div>
          <div>
            <Trending />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
