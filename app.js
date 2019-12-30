//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const user = require(__dirname+"/user.js");
let port = process.env.PORT;

//Get username and password
const password = user.getPass();
const userName = user.getUsr();

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";


const app = express();

app.set('view engine', 'ejs');

const url = 'mongodb+srv://'+userName+':'+password+'@cluster0-llc1a.mongodb.net/';

// Database Name
const dbName = 'blogDB';
const dbUrl = url+dbName;

mongoose.connect(dbUrl, {useNewUrlParser: true, useUnifiedTopology: true});

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

if(port == null || port==""){
  port = 8000;
}

app.listen(port, function() {
  console.log("Server running on port "+port);
});

// Constructing the Schema and Model of a Post for Db -->
const postSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  body:{
    type: String
  }
});

const Post = mongoose.model("post", postSchema);

const postd1 = new Post({
  title: "Default Post 1",
  body: "Click on 'Compose' to start writing a post."
});

const postd2 = new Post({
  title: "Default Post 2",
  body: "Click on 'Read More' to view full post."
});

const postd3 = new Post({
  title: "Default Post 3",
  body: "Click on 'Delete' to delete post."
});

const dPosts = [postd1, postd2, postd3];


// Naivigation routes for webapp -->
app.get("/", function(req, res){
  Post.find({}, function(err, postsFound){
    if(!err){

      if(postsFound.length===0){
        console.log("Inserting default posts");

        Post.insertMany(dPosts, function(error, docs){
          if(error){
            console.log("DGet Route - There was an error while inserting default items: ");
            console.log(error);
          }else{
            console.log("DGet Route - Successfully inserted default items");
            res.redirect("/");
          }
        });
      } else{
        res.render("home", {
          startingContent: homeStartingContent,
          posts: postsFound
        });
      }

    }else{
      console.log("DGet Route - There was an error found while searching for the posts: ");
      console.log(err);
    }
  });
});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.get("/posts/:postName", function(req, res){
  const requestedTitle = req.params.postName;

  Post.findOne({title: requestedTitle}, function(err, selectedPost){
    if(!err){
      res.render("post", {
        title: selectedPost.title,
        content: selectedPost.body
      });
    } else{
      console.log("PostGetRoute - There was an error while finding the doc: ");
      console.log(err);
    }
  });

});


app.post("/compose", function(req, res){
  const composedPost = new Post({
    title: req.body.postTitle,
    body: req.body.postBody
  });

  if((composedPost.title || composedPost.body)=="" ){
    //alert("The Title and Body of the post must NOT be empty!");
    //Insert an alert to the user
    res.redirect("/compose");
  }else{
    composedPost.save(function(err){
      if(!err){
        res.redirect("/");
      } else{
        console.log("ComposePostRoute - There was an error while saving the new post: ");
        console.log(err);
      }
    });
  }
});

app.post("/delete", function(req, res){
  const postId = req.body.pId;

  Post.findByIdAndDelete({_id: postId}, function(err){
    if(err){
      console.log("DeletePostRoute - There was an error while deleting the post: ");
      console.log(err);
    } else{
      console.log("DeletePostRoute - Post was deleted successfully");
      res.redirect("/");
    }
  });

});
