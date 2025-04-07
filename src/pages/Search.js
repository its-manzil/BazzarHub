import React from "react";
import "./search.css";
function Search() {
  return (
    <div id="search">
      <form method="get" className="searchForm">
        <input
          type="search"
          className="search"
          placeholder="Restaurant Name"
          required
        />
        <select id="dropdown" className="Restaurants">
          <option value="Auto">-Auto-</option>
          <option value="Birtamod">Birtamod</option>
          <option value="Damak">Damak</option>
          <option value="Urlabari">Urlabari</option>
          <option value="Bhadrapur">Bhadrapur</option>
          <option value="kakarvita">Kakarvita</option>
        </select>
        <button className="find">SEARCH</button>
      </form>
    </div>
  );
}

export default Search;
