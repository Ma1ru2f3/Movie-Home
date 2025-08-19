import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav style={styles.nav}>
      <Link style={styles.link} to="/">Home</Link>
      <Link style={styles.link} to="/search">Search</Link>
      <Link style={styles.link} to="/favourite">Favourite</Link>
      <Link style={styles.link} to="/profile">Profile</Link>
    </nav>
  );
};

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    padding: "10px 0",
    backgroundColor: "#1a1a1a",
    color: "#fff",
    position: "fixed",
    width: "100%",
    bottom: 0,
  },
  link: { color: "#fff", textDecoration: "none", fontWeight: "500", fontSize: "16px" },
};

export default Navbar;
