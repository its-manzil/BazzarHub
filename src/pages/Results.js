import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./results.css";
import Search from "./Search";
import Nav from "./Nav";
import ProductCard from "./ProductCard";

function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:8099/api/categories");
        const data = await response.json();
        if (data.success) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error("Couldn't fetch categories:", err);
      }
    };
    
    fetchCategories();
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get("q");
    const category = searchParams.get("category");

    if (!query) {
      navigate("/");
      return;
    }

    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        setSuggestion(null);
        
        let url = `http://localhost:8099/api/search?q=${encodeURIComponent(query)}`;
        if (category) {
          url += `&category=${encodeURIComponent(category)}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || "Search failed");
        }
        
        setResults(data.results || []);
        setSuggestion(data.suggestion);
        setSelectedCategory(category || "");
      } catch (err) {
        console.error("Search error:", err);
        setError(err.message || "Failed to fetch search results");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [location.search, navigate]);

  const handleCategoryChange = (category) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("category", category);
    navigate(`/results?${searchParams.toString()}`);
  };

  const handleSuggestionClick = () => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("q", suggestion);
    navigate(`/results?${searchParams.toString()}`);
  };

  if (loading) {
    return <div className="results-container">Loading...</div>;
  }

  if (error) {
    return <div className="results-container">Error: {error}</div>;
  }

  return (
  <>
  <Search/>
  <Nav/>
    <div className="results-container">
      <div className="search-filters">
        <h3>Categories</h3>
        <div className="category-filters">
          <button 
            className={!selectedCategory ? "active" : ""}
            onClick={() => handleCategoryChange("")}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category}
              className={selectedCategory === category ? "active" : ""}
              onClick={() => handleCategoryChange(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <h2 className="results-title">Search Results</h2>
      
      {suggestion && (
        <div className="search-suggestion">
          Did you mean: 
          <button onClick={handleSuggestionClick}>{suggestion}</button>?
        </div>
      )}

      {results.length === 0 ? (
        <div className="no-results">
          No products found. Try different keywords.
        </div>
      ) : (
        <div className="results-grid">
          {results.map((product) => (
            <ProductCard 
              key={product.product_id} 
              product={product} 
              showPriceRange={true}

            />
          ))}
        </div>
      )}
    </div>
    </>
  );
}

export default Results;