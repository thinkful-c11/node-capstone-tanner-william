'use strict';

const mongoose = require('mongoose');

const stubsSchema = mongoose.Schema({
  tag: {type: String, required: true, unique: true},
  artists: [{
    name: String,
    id: String,
    related: Array,
    genres: Array,
    tags: Array,
  }],
  songs: Array,
  albums: Array,
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
const model = mongoose.model('Stubs', stubsSchema);
module.exports = {CurrentArtist: createCurrentArtistObj(), Stubs: model};