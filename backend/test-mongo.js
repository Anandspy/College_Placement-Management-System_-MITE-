const mongoose = require('mongoose');

const uri = "mongodb://anandraj:AnandRaj%40123@ac-8mxemrx-shard-00-00.ac2z1dl.mongodb.net:27017,ac-8mxemrx-shard-00-01.ac2z1dl.mongodb.net:27017,ac-8mxemrx-shard-00-02.ac2z1dl.mongodb.net:27017/?ssl=true&replicaSet=atlas-13c5p1-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri)
  .then(() => {
    console.log("Connected to MongoDB successfully!");
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection error:", err);
    process.exit(1);
  });
