var express = require('express');
var bodyParser = require("body-parser");
var db = require("./database.js");
var auth = require('basic-auth');
var authorize = require('./oauth.js')

var app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/*
 * Routes to create and manage users.
 * These routes do not use any authentication.
 */
app.get('/',indexPage);
app.post('/create',createUser);
app.get('/retrieve_all',retrieveAllUsers);
app.get('/retrieve/:userID',retrieveUser);
app.put('/update',updateUser);
app.delete('/delete',deleteUser);
/************************************************/

/*
 * Actuall server routes.
 * Email-password authentication is required for actions by users.
 * Clients need to get an authentication token before getting acces to user info
 */
app.get('/login',authorize.authenticateUser, login);//user login
app.get('/grant/:clientID',authorize.authenticateUser, authorize.grantAccessCode);//user grants access to client
app.get('/access_token/:clientID',authorize.authorizeAccessCode, authorize.getAccessToken);//client get authentication token from server
app.get('/get_user_info',authorize.authorizeAccessToken, authorize.getUserInfo);//client gets user info from db using the authentication token
app.get('/revoke_access/:clientID',authorize.authenticateUser, authorize.revokeAccess);//user revokes access from client

app.use('',function(req, res, next){
  res.status(404).send('Page not found');
})

function indexPage(req, res, next){

  res.send('HELLO WORLD');
}

function retrieveAllUsers(req, res, next){
  db.getAllUsers(function(docs){
    res.send(docs);
  });
}

function createUser(req, res, next){
  var firstName = req.body.firstname;
  var lastName = req.body.lastname;
  var email = req.body.email;
  var age = req.body.age;
  var password = req.body.password;
  var userID = req.body.userID;

  db.createUser(firstName,lastName,email,age,password,userID);

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

function login(req, res, next){
    res.send('User login successful');
}

app.listen(3000, function(){
  console.log('App listening on port 3000');
});
