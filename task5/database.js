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

function findUser(email,callback){
  user.find({email : email},function(err,docs){
    if(err) throw err;

    if(callback){
      callback(docs);
    }
  });
}

function saveAccessGrant(email, clientID, code, callback){
  var newAccessCode = new accessGrant({
    email : email,
    code : code,
    clientID : clientID
  });

  newAccessCode.save(function(err){
    if(err) throw err;

    if(callback){
      callback(true);
    }
  });
}

function findAccessGrant(clientID, accessCode, callback){
  // console.log();
  accessGrant.find({code : accessCode, clientID : clientID},function(err,docs){
    // console.log(docs);
    if(callback){
      callback(docs);
    }
  });
}

function saveAccessToken(email, clientID, authorizationToken, callback){
  var newAuthToken = new authToken({
    email : email,
    accessToken : authorizationToken,
    clientID : clientID
  });

  newAuthToken.save(function(err){
    if(err) throw err;

    accessGrant.deleteOne({email : email, clientID : clientID},function(err, docs){
      if(err) throw err;
      if(callback){
        callback(true);
      }
    });
  });
}

function deleteAccessToken(email, clientID, callback){
  authToken.deleteOne({email : email, clientID : clientID},function(err,docs){
    if(err) throw err;

    if(callback){
      callback(true);
    }
  });
}

function retreiveAccessToken(email, clientID, accessToken, callback){
  authToken.find({accessToken : accessToken, email : email, clientID : clientID},function(err, docs){
    if(err) throw err;

    if(callback){
      callback(docs);
    }
  });
}

module.exports = {
  createUser : createUser,
  retrieveUser : retrieveUser,
  deleteUser : deleteUser,
  updateUser : updateUser,
  getAllUsers : getAllUsers,
  ////////////////////////
  findUser : findUser,
  saveAccessGrant : saveAccessGrant,
  findAccessGrant : findAccessGrant,
  saveAccessToken : saveAccessToken,
  deleteAccessToken : deleteAccessToken,
  retreiveAccessToken : retreiveAccessToken
};
