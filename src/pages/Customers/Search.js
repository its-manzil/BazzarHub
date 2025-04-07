import React from "react";
import "./search.css";
import { FiSearch } from "react-icons/fi";

function Search() {
  return (
    <div className="search-container">
      <form method="get" className="search-form">
        <div className="search-input-group">
          <FiSearch className="search-icon" />
          <input
            type="search"
            className="search-input"
            placeholder="Search Your Products..."
            aria-label="Search Your Products"
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