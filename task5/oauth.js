var bodyParser = require("body-parser");
var db = require("./database.js");
var auth = require('basic-auth');
var auth = require('basic-auth');
var rand = require("random-key");


/*
 * Authenticate user with email-password
 * using basic-auth
 */
function authenticateUser(req, res, next){
  var credentials = auth(req);
  var email = credentials.name;
  var password = credentials.pass;
  db.findUser(email,function(docs){
    if(!docs[0]){
      res.send('Authentication failed');
    }else{
      if(docs[0].pwd === password){
        console.log('User authentication successful');
        next();
      }else{
        console.log('User authentication failed');
        res.send('Authentication failed');
      }
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

  db.saveAccessGrant(email, clientID, code, function(status){
    if(status === true){
      console.log('Access code stored successfully');
      res.send(code);
    }else{
      res.status(500).send('There was an error saving access grant code to database');
    }
  });
}

/*
 * Authorize access based on the access code, client id
 */
function authorizeAccessCode(req, res, next){
  // console.log(req);
  var accessCode = req.headers.authorization.split(' ')[1];
  var clientID = req.params.clientID;
//   console.log(clientID);
// console.log(accessCode);
  db.findAccessGrant(clientID, accessCode,function(docs){
    if(docs.length == 0){
      // res.send(docs);
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
  var authorizationToken = rand.generate(48);
  var email = req.email;
  var clientID = req.params.clientID;

  db.saveAccessToken(email, clientID, authorizationToken, function(status){
    if(status === true){
      console.log('Authentication token stored successfully');
      res.send(authorizationToken);
    }
  });
}

/*
 * Generate and store a new access token for a client
 */
function getAccessToken(req, res, next){
  var authorizationToken = rand.generate(48);
  var email = req.email;
  var clientID = req.params.clientID;

  db.saveAccessToken(email, clientID, authorizationToken, function(status){
    if(status === true){
      console.log('Authentication token stored successfully');
      res.send(authorizationToken);
    }
  });
}

/*
 * Revoke the access granted to a client on a users data
 */
function revokeAccess(req, res, next){
  var email = auth(req).name;
  var clientID = req.params.clientID;

  db.deleteAccessToken(email, clientID, function(status){
    if(status === true){
      res.send('Acces revoked from client \''+clientID+'\' for user \''+email+'\'');

    }
  });
}

/*
 * Authorize access based on the access token, client id
 */
function authorizeAccessToken(req, res, next){
  var accessToken = req.headers.authorization.split(' ')[1];
  var email = req.headers.email;
  var clientID = req.headers.clientid;
  db.retreiveAccessToken(email, clientID, accessToken, function(docs){
    if(docs.length == 0){
      res.send('Unauthorized action');
    }else{
      next();
    }
  });
}


/*
 * Get the personal information of a user
 */
function getUserInfo(req, res, next){
  var email = req.headers.email;

  db.findUser(email, function(docs){
    res.send( 'First name: '+docs[0].firstName+
              '\nLast name: '+docs[0].lastName+
              '\nemail : '+docs[0].email+
              '\nage : '+docs[0].age);

  });
}

module.exports = {
  authenticateUser : authenticateUser,
  grantAccessCode : grantAccessCode,
  authorizeAccessCode : authorizeAccessCode,
  getAccessToken : getAccessToken,
  authorizeAccessToken : authorizeAccessToken,
  revokeAccess : revokeAccess,
  getUserInfo : getUserInfo
};
