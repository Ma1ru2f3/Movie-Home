// src/Home.js
import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

const Home = () => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      const querySnapshot = await getDocs(collection(db, "videos"));
      const videoList = querySnapshot.docs.map(doc => doc.data());
      setVideos(videoList);
    };
    fetchVideos();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Home Page - Videos</h2>
      {videos.map((vid, i) => (
        <video key={i} width="300" controls style={{ display: "block", marginBottom: "10px" }}>
          <source src={vid.url} type="video/mp4" />
        </video>
      ))}
    </div>
  );
};

export default Home;
