// node and routes in server.js
// mongoose and schema in models
// instructions:



// Whenever a user visits your site, the app should scrape stories from a news outlet of your choice and display them for the user. Each scraped article should be saved to your application database. At a minimum, the app should scrape and display the following information for each article:


// * Headline - the title of the article

// * Summary - a short summary of the article

// * URL - the url to the original article

// * Feel free to add more content to your database (photos, bylines, and so on).

// Users should also be able to leave comments on the articles displayed and revisit them later. The comments should be saved to the database as well and associated with their articles. Users should also be able to delete comments left on articles. All stored comments should be visible to every user.
 var mongojs = require('mongojs');
var express = require('express');
var logger = require('morgan');
var mongoose = require('mongoose');
var axios = require('axios');
var cheerio = require('cheerio');
var path = require('path');

// req all models
var db = require('./models');
var PORT = 8080;
var app = express();

// mid ware
app.use(logger('dev'));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static('public'));

// // Database configuration
// var databaseUrl = "mongoHeadlines";
// var collections = ["articles"];

// // Hook mongojs config to db variable
// var db = mongojs(databaseUrl, collections);
// // MONGO DB
mongoose.connect("mongodb://localhost/mongoHeadlines", { useNewUrlParser:true});

var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// ROUTES

app.get('/',function(req,res){
  var hbsObj = {
    articles:data
  };
    res.render('index',{articles:'articles'} )
});

app.get('/scrape',function(req,res){
    axios.get('https://www.nytimes.com/').then(function(response){
        var $ = cheerio.load(response.data);
        $('article.css-8atqhb').each(function(i,el){
            var results = 
            {};
            results.title = $(this).text();
            results.link = $(this).find('a').attr('href');
            results.summary = $(this).find('span.balancedHeadline').text();
            results.dateCreated = $(this).text();
            console.log(results);

            // creating a new article using the results obj from above
            db.Article.create(results).then(function(dbArticle){
                console.log(dbArticle);
            })
            .catch(function(err){
                console.log(err);
            });
        });
        res.send('done!')
    });
});

// all articles


// RETRIEVING SPECFIC ARTILE BY ID & POPULATE NOTES
app.get('/articles/:id', function(req,res){
  
    // Yes, it's a valid ObjectId, proceed with `findById` call.
  
    db.Article.findOne(
      {
         _id:mongojs.ObjectId(req.params.id)
      })
      .populate('note')
      .then(function(dbArticle){
        res.json(dbArticle);
    })
    .catch(function(err){
        res.json(err)
    })

})

// SAVING NOTES ASSOCIATED WITH AN ARTICLE
app.post('/notes/:id', function(req, res) {
  console.log('reqBody:', req.body);
  console.log('ArticledId:', req.params.id);
  db.Note.create(req.body)
    .then(function(dbNote) {
      console.log('Note:', dbNote);
      return db.Article.findOneAndUpdate(
        { _id: req.params.id }, {$push:{note: dbNote._id }}, {new: true});
  })
  .then(function(dbArticle) {
    res.json(dbArticle);
  })
  .catch(function(err) { res.json(err);
  });
});


// app.post('/articles/:id', function(req,res){
//     db.Note.create(req.body)
//     .then(function(dbNote){
//         return db.Article.find(
//             {_id: mongojs.ObjectId(req.params.id)},
//             {note:dbNote._id},
//             {new:true});
//     })
//     .then(function(dbArticle){
//         res.json(dbArticle)
//     })
//     .catch(function(err){
//         res.json(err);
//     })
// });

// DEL FROM DB
app.get("/delete/:id", function(req, res) {
  db.Article.remove(
    {
      _id: mongojs.ObjectId(req.params.id)
    },
    function(err, removed) {
      if (err) {
        console.log("err", err);
        res.send(err);
      } else {
        console.log(removed, ":removed");
        res.send(removed);
      }
    }
  );
});

app.get('/all', function(req,res) {
    console.log('got all');
    db.Article
    .find({})
    .limit(5)
    .sort({dateCreated:1})
    .then(function(dbArticle){
        res.json(dbArticle)
    }).
    catch(function(err){
        res.json(err)
    });
});

app.put('/saved/:id',function(req,res){
  db.Article.findByIdAndUpdate(
    {_id:req.params.id},
    {$set:{isSaved:true}}
    )
    .then(function(dbArticle){
      console.log('saving',dbArticle)
      res.json(dbArticle);
    })
    .catch(function(err){
      res.json(err);
    })
});


// app.get("/clearall", function(req, res) {
//   db.Note.remove({}, function(err, res) {
//     if (err) {
//       console.log("err from line 135", err);
//       res.send(err);
//     } else {
//       res.send(res);
//       console.log("res from line 143", res);
//     }
//   });
// });


app.listen(PORT,function(){
    console.log('app running on port', PORT)
});