'use strict';

const express = require('express');
const bodyParser = require('body-parser').json();
const fetch = require('node-fetch');
const morgan = require('morgan');
const mongoose = require('mongoose');
const {Stubs, Tags, Artists, Songs, Albums} = require('./models');
const {DATABASE_URL, PORT} = require('./config');
const dotenv = require('dotenv').config();
const base64 = require('base-64');
const {getCredentials, bigImg, sReqRelated, sReqBySearch, evaluateTag, sReqForAlbumsByArtist, sReqForAlbumBySearch, sReqForAlbumById} = require('./functions');

const app = express();

app.use(morgan(':method :url :status - :response-time ms'));
app.use(bodyParser);

app.use(express.static('public'));

const baseUrl = 'https://api.spotify.com/v1/';

//Serve static assets
app.get('/', (req, res)=>{
  res.sendFile(__dirname + '/public/index.html');
});

//Create or update a tag - Probably don't need it.
// app.put('/tags', (req, res)=>{
//   const tag = req.body.tag;
//   Tags
//     .find({tag: tag})
//     .count()
//     .then(num => {
//       if(num > 0){
//         console.log('That tag already exists.');
//       }else{
//         Tags
//           .create({tag: tag})
//           .then(_res => {
//             console.log('Item successfully created.');
//             console.log(_res);
//           });
//       }
//     });
// });

///TEST ENDPOINT FOR FUNCTION WRITING///
app.get('/testing/:albumId', (req,res)=>{
  getCredentials()
  .then(credentials=>{
    return sReqForAlbumById(req.params.albumId, credentials);
  })
  .then(_res =>{
    res.status(200).json(_res);
  })
  .catch(err=> console.error(err));
});

//Create or update Artist / Tag
app.put('/tags/artists', (req, res)=>{
  const artist = req.body.artist;
  const artistId = req.body.artistId;
  const tag = req.body.tags;
  let tagId;
  Artists
    .find({artist: artist})
    .count()
    .then(count => {
      if(count > 0){
        evaluateTag(tag, Tags)
        .then(res=>{
          tagId = res.doc._id;
          return Artists
          .update({artist}, {$addToSet: {tags: tagId}});
        })
        .then(_res => res.status(202).send(_res))
        .catch(err => res.status(500).send(`No need to panic! Except maybe. Here's what went wrong, you tell me: ${err}`));
      }else{
        evaluateTag(tag, Tags).then((res)=> {
          tagId = res.doc._id;
          return Artists
          .create({artist: artist, artistId: artistId, tags: tagId});
        })
        .then(_res => {
          res.status(201).send(_res);
        })
        .catch(err=> console.error(err));
      }
    });
});

//Create or update album / tag
app.put('/tags/albums', (req, res)=>{
  const albumId = req.body.albumId;
  const albumTitle = req.body.albumTitle;
  const tag = req.body.tags;
  const artist = req.body.artist;
  let tagId;
  Albums
    .find({title: albumTitle})
    .count()
    .then(count => {
      if(count > 0){
        evaluateTag(tag, Tags)
        .then(res=>{
          tagId = res.doc._id;
          return Albums
          .update({title: albumTitle}, {$addToSet: {tags: tagId}})
        })
        .then(_res => res.status(202).send(_res))
        .catch(err => res.status(500).send(`No need to panic! Except maybe. Here's what went wrong, you tell me: ${err}`));
      }else{
        evaluateTag(tag, Tags)
        .then(res =>{
          tagId = res.doc._id;
          return Albums
          .create({title: albumTitle, artist: artist, tags: tagId, albumId: albumId});
        })
        .then(_res => res.status(201).send(_res))
        .catch(err => console.error(err));
      }
    });
});

//Create or update song / tag
app.put('/tags/songs', (req, res)=>{
  const songTitle = req.body.songTitle;
  const albumTitle = req.body.albumTitle;
  const albumId = req.body.albumId;
  const songId = req.body.songId;
  const tag = req.body.tags;
  const artist = req.body.artist;
  let tagId;
  Songs
    .find({title: songTitle})
    .count()
    .then(count => {
      if(count > 0){
        evaluateTag(tag, Tags)
        .then(res => {
          tagId = res.doc._id;
          return Songs
            .update({title: songTitle}, {$addToSet: {tags: tagId}});
        })
        .then(_res => res.status(202).send(_res))
        .catch(err => res.status(500).send(`No need to panic! Except maybe. Here's what went wrong, you tell me: ${err}`));
      }else{
        evaluateTag(tag, Tags)
        .then(res => {
          tagId = res.doc._id;
          return Songs
            .create({title: songTitle, artist: artist, tags: tagId, albumTitle: albumTitle, albumId: albumId, songId: songId});
        })
        .then(_res => {
          res.status(201).send(_res);
        }).catch(err => console.error(err));
      }
    });
});

//Main search function
app.get('/search/:type/:query', (req, clientRespond)=>{
  getCredentials().then(credentials=> {
    sReqBySearch(baseUrl, req.params.type, req.params.query, clientRespond, credentials);
  });
});

///Get all Tags
app.get('/tags', (req, res)=>{
  Tags
    .find()
    .then(_res=> res.status(200).json(_res));
});

//Get a specific artist
app.get('/tags/artists/:artistId',(req, res)=>{
  Artists
    .find({artistId: req.params.artistId})
    .then(_res=> res.status(200).json(_res));
});

//Get specific album
app.get('/tags/albums/:albumId',(req, res)=>{
  Albums
    .find({albumId: req.params.albumId})
    .then(_res=> res.status(200).json(_res));
});

//Get specific song
app.get('/tags/Songs/:songId',(req, res)=>{
  Songs
    .find({songId: req.params.songId})
    .then(_res=> res.status(200).json(_res));
});

//Get specific tag
app.get('/tags/:tagId',(req,res)=>{
  Tags
    .findById(req.params.tagId)
    .then(_res=> res.status(200).json(_res));
});

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