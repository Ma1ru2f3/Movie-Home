// src/Admin.js
import React, { useState } from "react";
import VideoUpload from "./VideoUpload";

const Admin = () => {
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const handleLogin = () => {
    if(password === "admin123"){ // Simple password for demo
      setIsAdmin(true);
    } else {
      alert("Wrong Password!");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      {isAdmin ? (
        <VideoUpload />
      ) : (
        <div>
          <input 
            type="password" 
            placeholder="Admin Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
          <button onClick={handleLogin}>Login as Admin</button>
        </div>
      )}
    </div>
  );
};

export default Admin;
