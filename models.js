'use strict';

const mongoose = require('mongoose');

const stubsSchema = mongoose.Schema({
  tag: {type: String, required: true, unique: true},
  artists: [{
    name: String,
    id: {type: String, unique: true},
    related: Array,
    genres: Array,
    tags: Array,
  }],
  songs: Array,
  albums: Array,
});

const artistsSchema = mongoose.Schema({
  artist: {type: String, required: true, unique: true},
  tags: Array
});

const songsSchema = mongoose.Schema({
  song: {
    artist: String,
    album: String,
    title: String
  },
  tags: Array
});

const albumsSchema = mongoose.Schema({
  album: {
    artist: String,
    title: String,
  },
  tags: Array
});

const currentArtist = {
  name:'',
  id:'',
  related:[],
  genres:[],
  tags:[],
  imageUrl:''
};

const db = {
  savedArtists:[],
};

function createCurrentArtistObj() {
  const storage = Object.create(currentArtist);
  return storage;
}

function createDbObj() {
  const storage = Object.create(db);
  return storage;
}
const stubsModel = mongoose.model('Stubs', stubsSchema);
const artistModel = mongoose.model('Artists', artistsSchema);
const songModel = mongoose.model('Songs', songsSchema);
const albumModel = mongoose.model('Albums', albumsSchema);

module.exports = {CurrentArtist: createCurrentArtistObj(), Stubs: stubsModel, Artists: artistsSchema, Songs: songsSchema, Albums: albumsSchema};