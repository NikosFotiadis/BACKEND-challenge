var mongoose = require('mongoose');
var auth = require('basic-auth');
var rand = require("random-key");

mongoose.connect('mongodb://admin:admin123@localhost:27017/myappdb?authSource=admin');
// mongoose.connect('mongodb://localhost/myappdb');

mongoose.Promise = global.Promise;

db = mongoose.connection;

//there was an error connecting to the database
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//connection to database was established
db.on('open', function(){console.log("MongoDB connection successful");});

var userSchema = new mongoose.Schema({
  firstName : String,
  lastName : String,
  email : String,
  age : Number,
  pwd : String,
  userID : Number
});

var accessTokensSchema = new mongoose.Schema({
  clientID : String,
  userID : String,
  accessToken : String
});

var accessGrantSchema = new mongoose.Schema({
  email : String,
  code : String,
  clinetID : String
});

var user = mongoose.model('user', userSchema,'users');

var accessGrant = mongoose.model('accessGrant',accessGrantSchema,'access_grant');

function createUser(firstName, lastName, email, age, pwd, userID){
  var User = new user({
    firstName : firstName,
    lastName : lastName,
    email : email,
    age : age,
    pwd : pwd,
    userID : userID
  });

  User.save(function(err){
    if(err) throw err;

    console.log('User '+firstName+' '+lastName+' created');
  });
}

function retrieveUser(userID, callback){
  user.find({'userID':userID},function(err,docs){
    if(err) throw err;

    console.log('Retrieve user '+userID+' successful');

    if(callback){
      callback(docs);
    }
  });
}

function deleteUser(userID, callback){
  user.deleteOne({'userID':userID},function(err,docs){
    if(err) throw err;

    console.log('Delete user '+userID+' successful');

    if(callback){
      callback(docs);
    }
  });
}

function updateUser(userID, firstName, lastName, email, age, password, callback){
  user.update({'userID':userID},{ 'firstName':firstName,
                                  'lastname':lastName,
                                  'email':email,
                                  'age':age,
                                  'password':password},
                                  function(err){
                                    if(err) throw err;

                                    if(callback){
                                      callback();
                                    }
                                  });
}


function authenticateUser(req, res, next){
  var credentials = auth(req);
  var email = credentials.name;
  var password = credentials.pass;
  user.find({'email':email},function(err, docs){
    if(err) throw err;
    if(docs[0].pwd === password){
      console.log('User authentication successful');
      next();
    }else{
      console.log('User authentication failed');
      res.send('Authentication failed');
    }
  });
}

function grantAccessCode(req, res, next){
  var email = auth(req).name;
  var clientID = req.params.clientID;
  var code = rand.generate(32);
  var newAccessCode = new accessGrant({
    email : email,
    code : code,
    clientID : clientID
  });
  console.log(code);

  newAccessCode.save(function(err){
    if(err) throw err;

    console.log('Access code stored successfully');
    res.send('Granted access code to \''+clientID+'\' for \''+email+'\'');

  });
}

function revokeAccess(email, clientID){}//TODO

function getAccessToken(email, clientID){}//TODO

function authorizeAccessToken(email, token, clientID){}//TODO


module.exports = {
  createUser : createUser,
  retrieveUser : retrieveUser,
  deleteUser : deleteUser,
  updateUser : updateUser,
  ////////////////////////
  authenticateUser : authenticateUser,
  grantAccessCode : grantAccessCode
}
