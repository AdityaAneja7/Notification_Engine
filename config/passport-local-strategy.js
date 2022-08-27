// const passport = require('passport');


// const LocalStrategy = require('passport-local').Strategy;

// var User={
//     id:1,
// email:'lakshya.arora@minditsystems.com',
// password:'123'
// }

// //authentication using passport
// passport.use(new LocalStrategy({
//     usernameField: 'email'
// },function(email,password,done){
//     //find a user and establish the identity
//     User.findOne({email:email},function(err,user){
//         if(err){
//             console.log('error in finding user --> passport');
//             return done(err);
//         }
//         if(!user || user.password!=password){
//             console.log('Invalid username/password');
//             return done(null,false);
//         }
//         return done(null,user);
//     });
// }
// ));


// //seralizing the user to decide which key to be kept in the coookie
// passport.serializeUser(function(user,done){
//     done(null,user.id)
// })




// //deserialzing the user from the key in the cookie

// passport.deserializeUser(function(id,done){
//     User.findById(id,function(err, user){
//         if(err){
//         console.log('error in finding user');
//         return done(err);
//         }
//         return done(null , user);
//     })
// })