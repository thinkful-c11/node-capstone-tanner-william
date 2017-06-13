'use strict';

function StorageException(message) {
   this.message = message;
   this.name = "StorageException";
}

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

module.exports = {CurrentArtist: createCurrentArtistObj(), Db: createDbObj()};