var express = require('express');
var bodyParser = require("body-parser");
var db = require("./database.js");
var auth = require('basic-auth');

var app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/',indexPage);
app.post('/create',createUser);
app.get('/retrieve/:userID',retrieveUser);
app.put('/update',updateUser);
app.delete('/delete',deleteUser);

app.get('/login',db.authenticateUser,login);
app.get('/grant/:clientID',db.authenticateUser,db.grantAccessCode);

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

  db.createUser(firstName,lastName,email,age,'password',1234);

  res.send('create user : '+firstName+' '+lastName+', '+email+', '+age);
}

function retrieveUser(req, res, next){
  var userID = req.params.userID;

  db.retrieveUser(userID,function(docs){
    if(docs[0]){
      res.send('retreive user: '+userID+' , name: '+docs[0].firstName+' '+docs[0].lastName);
    }else{
      res.send('User not found');
    }
  });

}

function updateUser(req, res, next){
  var firstName = req.body.firstname;
  var lastName = req.body.lastname;
  var email = req.body.email;
  var age = req.body.age;
  var password = req.body.password;
  var userID = req.body.userID;

  db.updateUser(userID,firstName,lastName,email,age,password)

  res.send('update user '+userID+':\nFirst name= '+firstName+'\nLast name= '+lastName+'\nemail= '+email+'\nage= '+age);
}

function deleteUser(req, res, next){
  var userID = req.body.userID;

  db.deleteUser(userID);

  res.send('delete user '+userID);
}

function login(req, res, next){// authenticate the user using basic-auth
    res.send('User login successful');
}

app.listen(3000, function(){
  console.log('App listening on port 3000');
});
