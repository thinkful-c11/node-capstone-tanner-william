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
const {getCredentials, bigImg, sReqRelated, sReqBySearch, evaluateTag} = require('./functions');

const app = express();

app.use(morgan(':method :url :status - :response-time ms'));
app.use(bodyParser);

app.use(express.static('public'));

app.get('/', (req, res)=>{
  res.sendFile(__dirname + '/public/index.html');
});

app.put('/tags', (req, res)=>{
  const tag = req.body.tag;
  Tags
    .find({tag: tag})
    .count()
    .then(num => {
      if(num > 0){
        console.log('That tag already exists.');
      }else{
        Tags
          .create({tag: tag})
          .then(_res => {
            console.log('Item successfully created.');
            console.log(_res);
          });
      }
    });
});

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
        Artists
          .update({artist}, {$addToSet: {tags: tag}})
          .then(_res => res.status(202).send(_res))
          .catch(err => res.status(500).send(`No need to panic! Except maybe. Here's what went wrong, you tell me: ${err}`));
      }else{
        evaluateTag(tag, Tags).then((_tagId)=> {
          tagId = _tagId;
          console.log(tagId);
          Artists
          .create({artist: artist, artistId: artistId, tags: tagId})
          .then(_res => {
            res.status(201).send(_res);
          });
        }
        );
      }
    });
});

app.put('/tags/albums', (req, res)=>{
  const albumId = req.body.albumId;
  const albumTitle = req.body.albumTitle;
  const tag = req.body.tags;
  const artist = req.body.artist;
  Albums
    .find({title: albumTitle})
    .count()
    .then(count => {
      if(count > 0){
        Albums
          .update({title: albumTitle}, {$addToSet: {tags: tag}})
          .then(_res => res.status(202).send(_res))
          .catch(err => res.status(500).send(`No need to panic! Except maybe. Here's what went wrong, you tell me: ${err}`));
      }else{
        Albums
          .create({title: albumTitle, artist: artist, tags: tag, albumId: albumId})
          .then(_res => {
            res.status(201).send(_res);
          }).catch(err => console.error(err));
      }
    });
});

app.put('/tags/songs', (req, res)=>{
  const songTitle = req.body.songTitle;
  const albumTitle = req.body.albumTitle;
  const albumId = req.body.albumId;
  const songId = req.body.songId;
  const tag = req.body.tags;
  const artist = req.body.artist;
  Songs
    .find({title: songTitle})
    .count()
    .then(count => {
      if(count > 0){
        Songs
          .update({title: songTitle}, {$addToSet: {tags: tag}})
          .then(_res => res.status(202).send(_res))
          .catch(err => res.status(500).send(`No need to panic! Except maybe. Here's what went wrong, you tell me: ${err}`));
      }else{
        Songs
          .create({title: songTitle, artist: artist, tags: tag, albumTitle: albumTitle, albumId: albumId, songId: songId})
          .then(_res => {
            res.status(201).send(_res);
          }).catch(err => console.error(err));
      }
    });
});


app.put('/tags/:type/:tag', (req, res)=>{
  const tag = req.params.tags;
  Stubs
    .find({tag: tag})
    .count()
    .then(count => {
      if(count > 0){
        console.log('Updating Existing Tag');
        if(req.params.type === 'artist'){
          Stubs
            .updateOne({tag: tag},{
              $push: {artists: req.body.artist}
            })
            .then(_res=> {res.json(_res);})
            .catch(err=> {
              console.error(err);
              res.sendStatus(500);
            });
        }
      }else {
        console.log('Creating New Tag');
        if(req.params.type === 'artist'){
          Stubs
            .create({
              tag: req.params.tag,
              artists: [{
                name: req.body.artist.name,
                id: req.body.artist.id,
                related: req.body.artist.related,
                genres: req.body.artist.genres,
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