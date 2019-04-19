// node and routes in server.js
// mongoose and schema in models
// instructions:



// Whenever a user visits your site, the app should scrape stories from a news outlet of your choice and display them for the user. Each scraped article should be saved to your application database. At a minimum, the app should scrape and display the following information for each article:


// * Headline - the title of the article

// * Summary - a short summary of the article

// * URL - the url to the original article

// * Feel free to add more content to your database (photos, bylines, and so on).

// Users should also be able to leave comments on the articles displayed and revisit them later. The comments should be saved to the database as well and associated with their articles. Users should also be able to delete comments left on articles. All stored comments should be visible to every user.

var express = require('express');
var logger = require('morgan');
var mongoose = require('mongoose');
var axios = require('axios');
var cheerio = require('cheerio');

// req all models
var db = require('./models');
var PORT = 8080;
// init express
var app = express();

// mid ware
app.use(logger('dev'));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static('public'));

// MONGO DB
mongoose.connect("mongodb://localhost/mongoHeadlines", { useNewUrlParser:true});

// ROUTES
app.get('/scrape',function(req,res){
    axios.get('https://www.nytimes.com/').then(function(response){
        var $ = cheerio.load(response.data);
        $('article.css-8atqhb').each(function(i,el){
            var results = 
            {};
            // var title = $(el).text();
            // var link = $(el).find('a').attr('href');
            // results.push({
            //     title:title,
            //     link:link
            // });
            results.title = $(this).text();
            results.link = $(this).find('a').attr('href');
            results.summary = $(this).find('h2 span').text();
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
app.get('/all',function(req,res){
    db.Article.find({}).then(function(dbArticle){
        res.json(dbArticle)
    }).
    catch(function(err){
        res.json(err)
    });
});


// RETRIEVING SPECFIC ARTILE BY ID & POPULATE NOTES
app.get('/articles/:id', function(req,res){
    db.Article.find({ _id:req.params.id}).populate('note').then(function(dbArticle){
        res.json(dbArticle);
    })
    .catch(function(err){
        res.json(err)
    })
})

// SAVING NOTES ASSOCIATED WITH AN ARTICLE

app.post('/articles/:id', function(req,res){
    db.Note.create(req.body).then(function(dbNote){
        return db.Article.findOneAndUpdate({_id: req.params.id},
            {note:dbNote._id},
            {new:true});
    })
    .then(function(dbArticle){
        res.json(dbArticle)
    })
    .catch(function(err){
        res.json(err);
    })
});

app.listen(PORT,function(){
    console.log('app running on port', PORT)
});