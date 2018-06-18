var express = require('express');
var bodyParser = require("body-parser");
var db = require("./database.js")
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/',indexPage);
app.post('/create',createUser);
app.get('/retrieve/:userID',retrieveUser);
app.put('/update',updateUser);
app.delete('/delete',deleteUser);

app.use('',function(req, res, next){
  res.status(404).send('Page not found');
})

function indexPage(req, res, next){

  res.send('HELLO WORLD');
}

function createUser(req, res, next){
  var firstName = req.body.firstname;
  var lastName = req.body.lastname;
  var email = req.body.email;
  var age = req.body.age;

  db.createUser(firstName,lastName,email,age,'password',123);

  res.send('create user : '+firstName+' '+lastName+', '+email+', '+age);
}

function retrieveUser(req, res, next){
  res.send('retreive user: '+req.params.userID);
}

function updateUser(req, res, next){
  var firstName = req.body.firstname;
  var lastName = req.body.lastname;
  var email = req.body.email;
  var age = req.body.age;
  var userID = req.body.userID;
  res.send('update user '+userID+':\nFirst name= '+firstName+'\nLast name= '+lastName+'\nemail= '+email+'\nage= '+age);
}

function deleteUser(req, res, next){
  var userID = req.body.userID;
  res.send('delete user '+userID);
}

app.listen(3000, function(){
  console.log('App listening on port 3000');
});
