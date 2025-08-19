// src/VideoUpload.js
import React, { useState } from "react";
import { storage, db } from "./firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";

const VideoUpload = () => {
  const [video, setVideo] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleUpload = () => {
    if(!video) return;

    const storageRef = ref(storage, `videos/${video.name}`);
    const uploadTask = uploadBytesResumable(storageRef, video);

    uploadTask.on("state_changed",
      (snapshot) => {
        const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgress(prog);
      },
      (err) => console.log(err),
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async (url) => {
          await addDoc(collection(db, "videos"), { url, name: video.name });
          alert("Video uploaded!");
          setProgress(0);
          setVideo(null);
        });
      }
    );
  };

  return (
    <div>
      <input type="file" accept="video/*" onChange={(e) => setVideo(e.target.files[0])} />
      <button onClick={handleUpload}>Upload Video</button>
      <p>Progress: {progress}%</p>
    </div>
  );
};

export default VideoUpload;
