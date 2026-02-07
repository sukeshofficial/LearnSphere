import React from "react";
import "../styles/search.css";

const SearchBar = ({ onSearch }) => {
    return (
        <div className="search-bar-container">
            <input
                type="text"
                className="search-input"
                placeholder="Search courses..."
                onChange={(e) => onSearch(e.target.value)}
            />
        </div>
    );
};

export default SearchBar;
