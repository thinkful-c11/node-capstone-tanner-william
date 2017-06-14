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


// db.artists.find("tags": "5bafbab45215212");
const tagSchema = mongoose.Schema({
  tag: {type: String}
});

const artistsSchema = mongoose.Schema({
  artist: {type: String, required: true, unique: true},
  tags: [String]
});

const songsSchema = mongoose.Schema({
  song: {
    artist: String,
    album: String,
    title: String
  },
  tags: [{tag: {type: String}}]
});

const albumsSchema = mongoose.Schema({
  artist: String,
  title: String,
  tags: [{tag: String}]
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
const artistsModel = mongoose.model('Artists', artistsSchema);
const songsModel = mongoose.model('Songs', songsSchema);
const albumsModel = mongoose.model('Albums', albumsSchema);
const tagsModel = mongoose.model('Tags', tagSchema);

module.exports = {CurrentArtist: createCurrentArtistObj(), Stubs: stubsModel, Artists: artistsModel, Songs: songsModel, Albums: albumsModel, Tags: tagsModel};