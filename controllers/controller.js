// Dependencies
const express = require("express");
const router = express.Router();
const path = require('path');

// Our scraping tools
const request = require("request");
const cheerio = require("cheerio");

const Note = require("../models/Note.js");
const Article = require("../models/Article.js");

// ********************** ROUTES ************************

// // Main route 
// router.get("/", (req, res) => {
//     res.render("articles");
// });


// A GET request to scrape the NY times website
router.get("/scrape" , (req, res) => {
    // First, we grab the body of the html with request
    request('http://www.theverge.com/tech', (error, response, html) => {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        let $ = cheerio.load(html);
        // Now, we grab every h2 within an article tag, and do the following:
        $('.c-entry-box--compact__title').each((i, element) => {

            // Save an empty result object
            let result = {};
            let titlesArray = [];
            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this).children("a").text();
            result.link = $(this).children("a").attr("href");

            //ensures that no empty title or links are sent to mongodb
            if (result.title !== "" && result.link !== "") {
                //check for duplicates
                if (titlesArray.indexOf(result.title) == -1) {

                    // push the saved title to the array 
                    titlesArray.push(result.title);

                    // only add the article if is not already there
                    Article.count({ title: result.title }, (err, test) => {
                        //if the test is 0, the entry is unique and good to save
                        if (test == 0) {

                            //using Article model, create new object
                            let entry = new Article(result);

                            //save entry to mongodb
                            entry.save((err, doc) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log(doc);
                                }
                            });

                        }
                    });
                }
                // Log that scrape is working, just the content was missing parts
                else {
                    console.log('Article already exists.')
                }

            }
            // Log that scrape is working, just the content was missing parts
            else {
                console.log('Not saved to DB, missing data')
            }
        });
        // after scrape, redirects to index
        res.redirect('/');
        
    });
});






// This will get the articles we scraped from the mongoDB

//this will grab every article an populate the DOM
router.get('/', (req, res) => {
    //allows newer articles to be on top
    Article.find().sort({_id: -1})
        //send to handlebars
        .exec(function(err, doc) {
            if(err){
                console.log(err);
            } else{
                let artcl = {article: doc};
                res.render('index', artcl);
            }
    });
});




// This will get the articles we scraped from the mongoDB in JSON
router.get('/articles-json', function(req, res) {
    Article.find({}, (err, doc) => {
        if (err) {
            console.log(err);
        } else {
            res.json(doc);
        }
    });
});




router.get("/savedArticles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ "_id": req.params.id })
  // ..and populate all of the notes associated with it
  .populate("note")
  // now, execute our query
  .exec(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the doc to the browser as a json object
    else {
      res.render("saved",doc);
    }
  });
});

// Create a new comment
router.post('/note/:id', function(req, res) {
  var user = req.body.name;
  var content = req.body.comment;
  var articleId = req.params.id;

  //submitted form
  var noteObj = {
    name: user,
    body: content
  };
 
  //using the Comment model, create a new comment
  var newNote = new Note(noteObj);

  newNote.save(function(err, doc) {
      if (err) {
          console.log(err);
      } else {
          console.log(doc._id)
          console.log(articleId)
          Article.findOneAndUpdate({ "_id": req.params.id }, {$push: {'note':doc._id}}, {new: true})
            //execute everything
            .exec(function(err, doc) {
                if (err) {
                    console.log(err);
                } else {
                    res.redirect('/savedArticles/' + articleId);
                }
            });
        }
  });
});








router.get("/saved", function(req, res) {
    // send us to the next get function instead.
    res.render("saved");
});

module.exports = router;
