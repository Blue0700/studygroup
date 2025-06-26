const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://studygroup:NxWHBgqUkJTHo0Aw@cluster0.ezh9ul4.mongodb.net/studygroup?retryWrites=true&w=majority&appName=Cluster0")
.then(() => {
    console.log("Connected to MongoDB");
}).catch((error) => {
    console.log("Error connecting to MongoDB:", error);
});