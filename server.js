

// ========== Dependencies =====================

const express = require("express");

const bodyParser = require("body-parser");
const logger = require("morgan");
const mongoose = require("mongoose");



//==============================================


// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

// Initialize Express
const app = express();

// Use morgan & body parser 
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
    extended: false
}));

const db = mongoose.connection;

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/newsdb");

// Show any mongoose errors

db.on("error", (error) => {
    console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", () => {
    console.log("Mongoose connection successful.");
});



const exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({
  defaultLayout: "main"
}));
app.set("view engine", "handlebars");

const routes = require("./controllers/controller.js");
app.use("/", routes);

// Make public a static dir
app.use(express.static(__dirname + "/public"));







// Listen on port 3000
app.listen(3000, function() {
    console.log("App running on port 3000!");
});
