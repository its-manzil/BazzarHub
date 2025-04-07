import React, { useState, useEffect } from "react";

import Nav from "./Nav";
import "./Home.css";
import Search from "./Search";
function Home() {
  const [counter, setCounter] = useState(0);
  const slides = [
    { image: "caption1.jpg", alt: "Image 1" },
    { image: "caption2.jpg", alt: "Image 2" },
    { image: "caption3.jpg", alt: "Image 3" },
    { image: "caption4.jpg", alt: "Image 4" },
  ];

  useEffect(() => {
    const interval = setInterval(goNext, 6000);
    return () => clearInterval(interval);
  }, [counter]);

  const goNext = () => {
    setCounter((prevCounter) =>
      prevCounter === slides.length - 1 ? 0 : prevCounter + 1
    );
  };

  return (
    <div className="main">
      <Nav />

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
            Everything's good <br />
            when it's about food
          </p>
          <div className="seeyou">
            <Search />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
