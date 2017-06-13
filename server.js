'use strict';

const express = require('express');
const bodyParser = require('body-parser').json();
const fetch = require('node-fetch');
const morgan = require('morgan');
const mongoose = require('mongoose');
const {Stubs, CurrentArtist} = require('./models');
const {DATABASE_URL, PORT} = require('./config');
const dotenv = require('dotenv').config();
const base64 = require('base-64');
const {getCredentials, bigImg, sReqRelated, sReqBySearch} = require('./functions');

const app = express();

app.use(morgan(':method :url :status - :response-time ms'));
app.use(bodyParser);

app.use(express.static('public'));

app.get('/', (req, res)=>{
  res.sendFile(__dirname + '/public/index.html');
});

// app.post('/tags/evaluate', (req, res)=>{
//   const tag = req.body.tag;
//   const type = req.body.type;
//   const data = JSON.stringify(req.body.data);
//   const url1 = `http://localhost:8080/tags/${type}`;
//   const url2 = `http://localhost:8080/tags/${type}/${tag}`;
//   Stubs
//     .find({tag})
//     .count()
//     .then(count => {
//       if(count > 0){
//         return fetch(url1, {method: 'PUT', body: data, 'content-type': 'application/json'});
//       }else {
//         return fetch(url2, {method: 'POST', body: data, 'content-type': 'application/json'})
//         .then(_res => console.log(_res)).catch(err => console.error(err));
//       }
//     });
// });

app.put('/tags/:type/:tag', (req, res)=>{
  Stubs
    .find({tag: req.params.tag})
    .count()
    .then(count => {
      if(count > 0){
        console.log('oops that already exists');
      }else {
        if(req.params.type === 'artist'){
          console.log('########passing.');
          Stubs
            .create({
              tag: req.params.tag,
              artists: [{
                name: req.body.artist.name,
                id: req.body.artist.id,
                related: req.body.artist.related,
                genres: req.body.artist.genres,
                tags: req.body.artist.tags
              }],
              songs: [],
              albums: [],
            }).then(_res => res.status(201).json(_res))
            .catch(err=> {
              console.error(err);
              res.sendStatus(500);
            });
        }else if(req.params.type === 'song'){
          Stubs
            .create({
              tag: req.body.tag,
              artist: [{
                name: req.body.artist.name,
                id: req.body.artist.id,
                related: req.body.artist.related,
                genres: req.body.artist.genres,
                tags: req.body.artist.tags
              }],
              songs: [],
              albums: [],
            });
        }
      }
    });
});

app.get('/search/:type/:query', (req, clientRespond)=>{
  getCredentials().then(credentials=> {
    sReqBySearch(baseUrl, req.params.type, req.params.query, clientRespond, credentials);
  });
});

const baseUrl = 'https://api.spotify.com/v1/';

app.listen(process.env.PORT || 8888, () => {
  console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
  
});

app.use('*', function(req, res) {
  res.status(404).json({message: 'Not Found'});
});

let server;

function runServer(databaseUrl=DATABASE_URL, port=PORT) {
  return new Promise((resolve, reject) => {
    console.log(databaseUrl);
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = {app, runServer, closeServer};