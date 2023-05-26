require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// body-parser
let bodyParser = require('body-parser');

// Mount body parser before other uses it
app.use(bodyParser.urlencoded({ extended: false }));
app.use(("/api", bodyParser.json()));

//  Install and Set Up Mongoose
const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URI);

// Create a mongoDB Model / SCHEMA
const urlSchema = new mongoose.Schema({
  original_url: {
    type: String,
    required: true,
    unique: true
  },
  short_url: {
    type: Number,
    required: true,
    unique: true
  }
});
const Url = mongoose.model('Url', urlSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// find link from mongoDB and direct user to
app.get('/api/shorturl/:word', async function(req, res) {
  console.log("get")
  const shortUrlNumber = parseInt(req.params.word)

  // query mongoDB and get orignalUrl.
  const response = await Url.find( {short_url : shortUrlNumber})

  // console.log(response);
  originalUrl=response[0].original_url
  
  // redirect to Url
  res.redirect(originalUrl);
  // res.json({ greeting: `hello get shortUrl ${shortUrlNumber} ${originalUrl} ` });
})

// post , create url number and insert into mongoDB
app.post('/api/shorturl', async function(req, res) {
  console.log("post")
  // console.log(req.body)

  const postUrl = req.body.url
  console.log(postUrl)
  // error catching
  if ( ! /http(s)*:\/\/(\w)*.(\w)*.(\w)*/.test(postUrl)){
    return res.json({  error: 'invalid url'}) ;
  }

  // query mongoDB to get newest Number
  const response = await Url.find().sort({short_url : -1}).limit(1)
  // console.log(response)
  const lastNumber = response[0].short_url;
  const newNumber = lastNumber + 1;

  // create new instance  
  const newUrl = new Url({ original_url: postUrl, short_url: newNumber });
  // insert into mongoDB
  newUrl.save(function(err, data){
    if (err) console.log(err);
  })
  
  res.json({ original_url: postUrl, short_url: newNumber });
})


//
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

// // mongoose related
// const saveShorternURL = function(done){
//   newUrl.save(function(err, data) {
//     if (err) return console.log(err);
//     console.log(data);
//     done(null, data);
//   });
// }