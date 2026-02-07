import React from "react";
import "../styles/search.css";

import searchIcon from "../assets/search.svg";

const SearchBar = ({ onSearch }) => {
    return (
        <div className="search-bar-container">
            <img src={searchIcon} alt="Search" className="search-icon" />
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
