import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "../styles/dashboard-template.css";
import { searchUser } from "../api/userProfile";
import { Typewriter } from "react-simple-typewriter";
import searchIcon from "../assets/search.svg";


export default function Dashboard() {

  const navigate = useNavigate();

  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  // const [searched, setSearched] = useState(false);

  const greetings = [
    "Welcome back",
    "Hello",
    "Hi there",
    "Great to see you",
    "Hey",
    "Nice to have you here",
    "Good to see you again",
  ];

  const randomGreeting =
    greetings[Math.floor(Math.random() * greetings.length)];


  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchUser(query); // 🔥 await it
        setResults(res.data); // 🔥 axios → res.data
      } catch (err) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>

        <div className="search-container">
          <img src={searchIcon} alt="Search" className="search-icon" />

          <input
            type="text"
            placeholder="Search Courses by name or tags..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {loading && <div className="search-hint">Searching...</div>}

          {results.length > 0 && (
            <div className="search-results">
              {results.map((user) => (
                <div
                  key={user.username}
                  className="user-card"
                  onClick={() => navigate(`/u/${user.username}`)}
                >
                  <img
                    src={
                      user.profile_photo
                        ? `http://localhost:5000${user.profile_photo}`
                        : profilePlaceholder
                    }
                    alt={user.name}
                  />
                  <div>
                    <strong>{user.name}</strong>
                    <span> </span>
                    <span>@{user.username}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Greeting Card */}
      <div className="card">
        <h3>
          <Typewriter
            words={[`${randomGreeting} ${user?.name || "User"}`]}
            cursor
            cursorStyle="_"
            typeSpeed={60}
            deleteSpeed={50}
            delaySpeed={1000}
            className="greeting-typewriter"
          />
        </h3>
        <p>
          <strong>Email:</strong> {user?.email || "—"}
        </p>
      </div>

    </div >
  );
}
