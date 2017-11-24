express = require('express')
app = express()
port = process.env.PORT || 4000
mongoose = require('mongoose')
mongoose.Promise = Promise;
User = require('./model')
bodyParser = require('body-parser')
fetch = require('node-fetch');
hat = require('hat');
util = require('util')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const constants = {
  db:{
    path: 'mongodb://localhost/myapp'
  },
  zaps:{
    signup: 'https://hooks.zapier.com/hooks/catch/2003878/ssrlnv/',
    delete: '', 
    reset: ''  
  },
  headers: {'Content-Type':'application/json'}
}

const db_promise = mongoose.connect(constants.db.path, {
  useMongoClient: true,
});
db_promise.then(function(db) {
  //if you want to do some logging or checking when the DB is initialized?
});

//ROUTES (eventually can refactor to be more modular)

//create new account
app.post('/user', (req, res) => {
  if(req.body.email){
    User.find({ email:req.body.email }, (err, users) => {
      if(err){
        res.status(500).send('Error querying the database: ' + err)
        return console.error(err);
      }
      if(users.length===0){
        var key = hat();
        var user = new User({ email: req.body.email, key: key});
        user.save((err,user) => {
          if (err) {
            res.status(500).send('Error creating a new account: ' + err)
          } else {
            res.status(201).send('Created a new user account. You should get an email with your API key in the next few minutes')
            zapEmail(constants.zaps.signup, {email:user.email,key:user.key});
          }
        })  
      } else {
        res.status(409).send('This email address is already associated with an account')
      }
    }); 
  } else {
  	res.status(202).send('No email address included in request, can\'t create account')
  }
})

//get existing account
app.get('/user', (req, res) => {
  if(req.query.email && req.query.key){
    User.find({ email:req.query.email }, (err, users) => {
      if(users.length===1){
        let user = Object.assign({}, users[0]._doc,{
          _id: 'REDACTED'
        });
        if(user.key===req.query.key){
          res.status(200).send(user);
        } else {
          res.status(400).send('api key doesn\'t match')
        }
      } else {
        res.status(400).send('No user with this email address')
      }
    })
  } else {
    res.status(409).send('Missing email or API key: please try logging in again')
  }
})

//reset API key
app.post('/reset', (req, res) => {
})

//push to zap trigger URLs
app.post('/push', (req, res) => {
})

//save changes to buttons
app.post('/save', (req, res) => {
})

//add zap trigger URL to button
app.post('/register',  (req, res) => {

})

app.listen(port);
console.log('pushboard_server started on: ' + port);

//helper functions (put these in another file and import them later)
const zapEmail = (zapURL, userInfo) => {
  fetch(zapURL, { method: 'POST', headers: constants.headers, body: JSON.stringify(userInfo) })
      .then((res) => {
          return res.json();
      }).then((json) => {
          console.log(json);
          return "something returned!"
      });
}




