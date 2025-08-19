// src/App.js
import React from "react";
import Navbar from "./Navbar";
import Profile from "./Profile";
import Admin from "./Admin";
import Home from "./Home";

function App() {
  const [page, setPage] = React.useState("home");

  const renderPage = () => {
    switch(page){
      case "home": return <Home />;
      case "profile": return <Profile />;
      case "admin": return <Admin />;
      default: return <Home />;
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ padding: "20px" }}>
        {renderPage()}
      </div>
    </div>
  );
}

export default App;
