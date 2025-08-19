// src/Profile.js
import React, { useState } from "react";
import { auth, provider } from "./firebase";
import { signInWithPopup, signOut } from "firebase/auth";

const Profile = () => {
  const [user, setUser] = useState(null);

  const handleLogin = async () => {
    const result = await signInWithPopup(auth, provider);
    setUser(result.user);
  };

  const handleLogout = () => {
    signOut(auth);
    setUser(null);
  };

  return (
    <div style={{ padding: "20px" }}>
      {user ? (
        <div>
          <img src={user.photoURL} alt="profile" width={50} />
          <h3>{user.displayName}</h3>
          <p>{user.email}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login with Google</button>
      )}
    </div>
  );
};

export default Profile;
