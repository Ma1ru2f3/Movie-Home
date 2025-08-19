// src/Navbar.js
import React from "react";

const Navbar = () => {
  return (
    <nav style={{ display: "flex", gap: "20px", padding: "10px", background: "#eee" }}>
      <a href="/">Home</a>
      <a href="/search">Search</a>
      <a href="/favourite">Favourite</a>
      <a href="/profile">Profile</a>
      <a href="/admin">Admin</a>
    </nav>
  );
};

export default Navbar;
