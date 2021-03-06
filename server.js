

// ========== Dependencies =====================

const express = require("express");

const bodyParser = require("body-parser");
const logger = require("morgan");

var mongoose = require('mongoose');


//==============================================


// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

// Initialize Express
const app = express();

var port = process.env.PORT || 3000;


// Use morgan & body parser 
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
    extended: false
}));

// Make public a static dir
app.use(express.static(__dirname + "/public"));



// Database configuration with mongoose

//---------- Define local MongoDB URI -------------
 // mongoose.connect("mongodb://localhost/newsdb");
mongoose.connect("mongodb://heroku_7n3425x0:nnpotvnp8u2c9ufdip6dekh5jc@ds123722.mlab.com:23722/heroku_7n3425x0")

//-------------------------------------------------

// if (process.env.MONGODB_URI) {

// mongoose.connect(process.env.MONGODB_URI)

// } else {

//   mongoose.connect("mongodb://localhost/newsdb"); 
// }

//-------------------------------------------------

const db = mongoose.connection;

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









// Listen on port 3000
app.listen(port, function() {
    console.log("App running on port!" + port);
});
