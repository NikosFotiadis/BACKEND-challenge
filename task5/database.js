var mongoose = require('mongoose');
var auth = require('basic-auth');
var rand = require("random-key");

mongoose.connect('mongodb://admin:admin123@localhost:27017/myappdb?authSource=admin');

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

var authTokensSchema = new mongoose.Schema({
  email : String,
  accessToken : String,
  clientID : String
});

var accessGrantSchema = new mongoose.Schema({
  email : String,
  code : String,
  clientID : String
});

var user = mongoose.model('user', userSchema,'users');

var accessGrant = mongoose.model('accessGrant',accessGrantSchema,'access_grant');

var authToken = mongoose.model('authToken',authTokensSchema,'auth_tokens')

/***************************************************************/

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

function getAllUsers(callback){
  user.find({},function(err, docs){
    if(err) throw err;

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

/***************************************************************/

/*
 * Authenticate user with email-password
 * using basic-auth
 */
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

/*
 * Generate and store a new access code for a client
 */
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
    res.send(code);
  });
}

/*
 * Authorize access based on the access code, client id
 */
function authorizeAccessCode(req, res, next){
  // console.log(req);
  var accessCode = req.headers.authorization.split(' ')[1];
  var clientID = req.params.clientID;

  accessGrant.find({code : accessCode, clientID : clientID},function(err,docs){
    if(docs.length == 0){
      res.send('Access code authentication failed');
    }else{
      req.email = docs[0].email;
      next();
    }
  });
}

/*
 * Generate and store a new access token for a client
 */
function getAccessToken(req, res, next){
  var authenticationToken = rand.generate(48);
  var email = req.email;
  var clientID = req.params.clientID;

  var newAuthToken = new authToken({
    email : email,
    accessToken : authenticationToken,
    clientID : clientID
  });

  newAuthToken.save(function(err){
    if(err) throw err;

    console.log('Authentication token stores successfully');

    /*delete acces grant code for this client and user*/
    accessGrant.deleteOne({email : email, clientID : clientID},function(err, docs){
      if(err) throw err;
    })

    /*send authentication token back to the client*/
    res.send(authenticationToken);
  });
}

/*
 * Revoke the access granted to a client on a users data
 */
function revokeAccess(req, res, next){
  var email = auth(req).name;
  var clientID = req.params.clientID;
  authToken.deleteOne({email : email, clientID : clientID},function(err,docs){
    if(err) throw err;

    res.send('Acces revoked from client \''+clientID+'\' for user \''+email+'\'');
  });
}

/*
 * Authorize access based on the access token, client id
 */
function authorizeAccessToken(req, res, next){
  var accessToken = req.headers.authorization.split(' ')[1];
  var email = req.headers.email;
  var clientID = req.headers.clientid;
  // console.log(accessToken);
  // console.log(email);
  // console.log(clientID);
  // console.log(req);
  authToken.find({accessToken : accessToken, email : email, clientID : clientID},function(err, docs){
    if(err) throw err;

    if(docs.length == 0){
      res.send('Unauthorized action');
    }else{
      next();
    }
  })

}

/*
 * Get the personal information of a user
 */
function getUserInfo(req, res, next){
  var email = req.headers.email;

  user.find({email : email},function(err, docs){
    if(err) throw err;

    res.send( 'First name: '+docs[0].firstName+
              '\nLast name: '+docs[0].lastname+
              '\nemail : '+docs[0].email+
              '\nage : '+docs[0].age);

  });
}


module.exports = {
  createUser : createUser,
  retrieveUser : retrieveUser,
  deleteUser : deleteUser,
  updateUser : updateUser,
  getAllUsers : getAllUsers,
  ////////////////////////
  authenticateUser : authenticateUser,
  grantAccessCode : grantAccessCode,
  authorizeAccessCode : authorizeAccessCode,
  getAccessToken : getAccessToken,
  authorizeAccessToken : authorizeAccessToken,
  revokeAccess : revokeAccess,
  getUserInfo : getUserInfo
}
