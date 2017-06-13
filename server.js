'use strict';

const express = require('express');
const bodyParser = require('body-parser').json();
const fetch = require('node-fetch');
const morgan = require('morgan');
const mongoose = require('mongoose');
const {CurrentArtist, Db} = require('./models');
const {DATABASE_URL, PORT} = require('./config');
const dotenv = require('dotenv').config();
const base64 = require('base-64');

const app = express();

app.use(morgan(':method :url :status - :response-time ms'));
app.use(bodyParser);

app.use(express.static('public'));

app.get("/", (req, res)=>{
  res.sendFile(__dirname + '/public/index.html');
});

app.get("/search/:type/:query", (req, clientRespond)=>{
  getCredentials().then(res=> console.log(res));
  // sReqBySearch(baseUrl, req.params.type, req.params.query, clientRespond);
});

const baseUrl = `https://api.spotify.com/v1/`;

function getCredentials(){
  return fetch('https://accounts.spotify.com/api/token',{
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${base64.encode('f397ddf305dd4fb1a348e110c2d0f2ca:fd2e4d4c99494bdc9da125ea768078ba')}`
    }
  })
  .then(uglyStream=> uglyStream.json())
  .then(niceJson=> niceJson.access_token);
}

function bigImg(artist){
  let biggest = 0;
  let bigIndex = 0;
  let i = 0;
  artist.images.forEach(obj=>{
    if(obj.width > biggest){
      bigIndex = i;
      biggest= obj.width;
    }
    i++;
  });
  return bigIndex;
}

function sReqRelated (id){
  let relatedUrl = `${baseUrl}artists/${id}/related-artists`;
  return fetch(relatedUrl, {
    method: 'get',
    headers: {
      authorization: 'Bearer BQBGON2piG9zz14uRZGDSR6uYw0oZlY77PJ1ITt7FCCWfckpqhFFjtWl3Nypza181_0ItnE7xKH7yizYVI7xgw'
    }});
}

function sReqBySearch(baseUrl,type,query,clientRespond){
  const searchUrl = `${baseUrl}search?type=${type}&q=${query}`;

  return fetch(searchUrl,{
    method: 'get',
    headers: {
      authorization: 'Bearer BQBGON2piG9zz14uRZGDSR6uYw0oZlY77PJ1ITt7FCCWfckpqhFFjtWl3Nypza181_0ItnE7xKH7yizYVI7xgw'
    }
  })
  // .header('authorization','Bearer BQBCLP5TS6G33wjIn60CXZlMJNCj_BGDFyzFEFLrcZILGRbqhMb64oxXU9fO1ZCWkg21DjuIdDKj8sEzFf5t4Q')
  .then(response => {
    return response.json();
  })
  .then(res=>{
    console.log(res);
    let responseArtist = res.artists.items[0];

    // console.log(responseArtist);

    CurrentArtist.name = responseArtist.name;
    CurrentArtist.id = responseArtist.id;
    CurrentArtist.imageUrl = responseArtist.images[bigImg(responseArtist)].url;
    CurrentArtist.genres = responseArtist.genres;
    CurrentArtist.related = [];

    return sReqRelated(CurrentArtist.id);
  })
  .then(res=>{
    return res.json();
  })
  .then(res=>{
    console.log(res);
    res.artists.forEach(obj=>{
      let relatedArtist = {
        name: obj.name,
        id: obj.id,
        genres:obj.genres,
        tags:[],
        imageUrl:obj.images[bigImg(obj)].url
      };
      CurrentArtist.related.push(relatedArtist);
    });
    clientRespond.json(CurrentArtist);
    console.info('sent current artist json to client');
  })
  .catch(err => console.error(err.message));
}

// app.listen(8080, ()=>{
//   console.log('Listening on port 8080');
// });

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