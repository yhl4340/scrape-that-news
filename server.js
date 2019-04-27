
var mongojs = require('mongojs');
var express = require('express');
var logger = require('morgan');
var mongoose = require('mongoose');
var axios = require('axios');
var cheerio = require('cheerio');
var app = express();
var path = require('path');

// req all models
var Db = require('./models');
var PORT = process.env.PORT || 8080;

// mid ware
app.use(logger('dev'));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static('public'));

// Database configuration
var databaseUrl = 'mongodb://localhost/mongoHeadlines';

  if(process.env.MONGODB_URI){
    mongoose.connect(process.env.MONGODB_URI);
    console.log('process.env')
  }
  else {
    mongoose.connect(databaseUrl);
    console.log('mongoose connection is a go');
  }

var db = mongoose.connection;

var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// ROUTES

app.get('/',function(req,res){
    Db.Article.find({}).then( function(dbArticle){
     res.render('index' ) 
    
    })    
});

app.get('/saved',function(req,res){
  Db.Article.find({}).then( function(dbArticle){
   res.render('savedArticles',{articles: dbArticle} ) 
  
  })    
});

app.get('/scrape',function(req,res){
    axios.get('https://www.nytimes.com/').then(function(response){
        var $ = cheerio.load(response.data);
        $('article.css-8atqhb').each(function(i,el){
            var results = 
            {};
            results.title = $(this).text();
            results.link = $(this).find('a').attr('href');
            results.summary = $(this).find('p').text();
            // used the attr of 'aria-lable' to get the time
            results.dateCreated = $(this).find('time')
             .attr('aria-label');
            console.log(results);

            // creating a new article using the results obj from above
            Db.Article.create(results).then(function(dbArticle){
               console.log(dbArticle,"!!");
           
            })
            .catch(function(err){
                console.log(err);
            });
        });
      res.send('Done!');
    });
});

app.get('/all', function(req,res) {
  console.log('got all');
  Db.Article
  .find({})
  .limit(5)
  .sort({dateCreated:1})
  .then(function(dbArticle){
    console.log('db:', dbArticle);
      res.render('index', {articles:dbArticle})
  }).
  catch(function(err){
      res.json(err)
  });
});



// RETRIEVING SPECFIC ARTILE BY ID & POPULATE NOTES
app.get('/articles/:id', function(req,res){
  
    // Yes, it's a valid ObjectId, proceed with `findById` call.
  
    Db.Article.findById(
      {
         _id:req.params.id
      })
      .populate('note')
      .then(function(dbArticle){
        res.render('articles',dbArticle);
    })
    .catch(function(err){
        res.json(err)
    })

})

// SAVING NOTES ASSOCIATED WITH AN ARTICLE
app.post('/notes/:id', function(req, res) {
  console.log('reqBody:', req.body);
  console.log('ArticledId:', req.params.id);
  Db.Note.create(req.body)
    .then(function(dbNote) {
      console.log('Note:', dbNote);
      return Db.Article.findOneAndUpdate(
        { _id: req.params.id }, {$push:{note: dbNote._id }}, {new: true});
  })
  .then(function(dbArticle) {
    res.json(dbArticle);
  })
  .catch(function(err) { res.json(err);
  });
});


// DEL FROM DB
app.get("/delete/:id", function(req, res) {
  Db.Article.remove(
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
    Db.Article
    .find({})
    .limit(5)
    .sort({dateCreated:1})
    .then(function(dbArticle){
        res.render( {articles:dbArticle})
    }).
    catch(function(err){
        res.json(err)
    });
});

app.put('/saved/:id',function(req,res){
  Db.Article.findByIdAndUpdate(
    {_id:req.params.id},
    {$set:{isSaved:true}}
    )
    .then(function(dbArticle){
      console.log('saving',dbArticle)
      res.json(dbArticle)
      // res.redirect('saved', {articles:dbArticle});
    })
    .catch(function(err){
      res.json(err);
    })
});

app.get('/saved/:id', function(req,res){
  Db.Article.find({_id:req.params.id}).then(function(data){
    res.json(data)
  })
})
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