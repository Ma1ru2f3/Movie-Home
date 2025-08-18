const express = require("express");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(fileUpload());

cloudinary.config({
  cloud_name: "dlxa4684c",
  api_key: "488983136699335",
  api_secret: "Q0pMZ3qtVHouepBUcWzPaDpZ7lI"
});

// Admin login middleware
const checkAdmin = (req,res,next)=>{
  const {user, pass} = req.body;
  if(user==="admin" && pass==="1234"){
    next();
  }else{
    res.status(401).send("Unauthorized");
  }
}

// Admin login route
app.post("/admin/login", checkAdmin, (req,res)=>{
  res.send("Login success");
})

// Upload route
app.post("/upload", checkAdmin, async(req,res)=>{
  try{
    const file = req.files.video;
    const result = await cloudinary.uploader.upload(file.tempFilePath,{
      resource_type:"video",
      folder:"Moviebox",
      use_filename:true,
      unique_filename:false
    });
    res.json(result);
  }catch(err){
    res.status(500).send(err.message);
  }
})

// Delete route
app.post("/delete", checkAdmin, async(req,res)=>{
  try{
    const {public_id} = req.body;
    const result = await cloudinary.uploader.destroy(public_id,{resource_type:"video"});
    res.json(result);
  }catch(err){
    res.status(500).send(err.message);
  }
})

app.listen(3000,()=>console.log("Server running on port 3000"));