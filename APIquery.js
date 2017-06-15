'use strict';
const fetch = require('node-fetch');
const {getCredentials, baseUrl, sReqByAlbumForSongs, sReqForArtistBySearch, sReqByArtistForTopTracks, sReqBySearch, sReqBySongIdForSong, sReqBySongTitleForSongs, sReqForAlbumById, sReqForAlbumBySearch, sReqForAlbumsByArtist, sReqRelated} = require('./functions');

const sUserSearchForArtist = (userQuery, res)=>{
  getCredentials().then(credentials =>{
    sReqForArtistBySearch(userQuery, credentials)
    .then(artistsObj => {
      artistsObj.artists.items.forEach(artist => {
        console.log(artist.name);
      });
    });
  });
};

module.exports = {sUserSearchForArtist};