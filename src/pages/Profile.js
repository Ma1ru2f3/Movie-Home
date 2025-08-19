import React, { useState, useEffect } from "react";
import { auth, provider } from "../firebase";
import { signInWithPopup, signOut } from "firebase/auth";

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      {!user ? (
        <button onClick={login} style={btnStyle}>Login with Google</button>
      ) : (
        <div>
          <img src={user.photoURL} alt="profile" style={{ width: 80, borderRadius: "50%" }} />
          <h3>{user.displayName}</h3>
          <p>{user.email}</p>
          <button onClick={logout} style={btnStyle}>Logout</button>
        </div>
      )}
    </div>
  );
};

const btnStyle = {
  padding: "10px 20px",
  backgroundColor: "#4285F4",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontWeight: "500",
};

export default Profile;
