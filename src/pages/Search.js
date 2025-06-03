import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./search.css";
import { FiSearch } from "react-icons/fi";

function Search() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/results?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-group">
          <FiSearch className="search-icon" />
          <input
            type="search"
            className="search-input"
            placeholder="Search for products or brands..."
            aria-label="Search Your Products"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="search-button">
          Search
        </button>
      </form>
    </div>
  );
}

export default Search;