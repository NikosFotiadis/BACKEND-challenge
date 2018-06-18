var mongoose = require('mongoose');

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

var user = mongoose.model('user', userSchema);

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

module.exports = {
  createUser : createUser,
  retrieveUser : retrieveUser,
  deleteUser : deleteUser,
  updateUser : updateUser
}
