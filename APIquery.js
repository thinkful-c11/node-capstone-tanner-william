'use strict';
const fetch = require('node-fetch');
const {getCredentials, baseUrl, getTagsFromSongWithId, getTagsFromArtistWithId, getTagsFromAlbumWithId, bigImg, sReqByAlbumForSongs, sReqForArtistBySearch, sReqByArtistForTopTracks, sReqBySearch, sReqBySongIdForSong, sReqBySongTitleForSongs, sReqForAlbumById, sReqForAlbumBySearch, sReqForAlbumsByArtist, sReqRelated} = require('./functions');

function sUserSearchForArtist (userQuery){
  let artistObj;
  let credentials;
  let promisesArray = [];
  return getCredentials()
  .then(_credentials =>{
    credentials = _credentials;
    return sReqForArtistBySearch(userQuery, credentials);
  })
    .then(artistsObj => {
      const artist = artistsObj.artists.items[0];
      artistObj = {
        name: artist.name,
        id: artist.id,
        imageUrl: artist.images[bigImg(artist.images)],
        genres: artist.genres,
        albums: [],
        topTracks: [],
        tags: [],
        related: []
      };
      return sReqRelated(artistObj.id, credentials);
    })
    .then(_res => _res)
    .then(relatedArtists => {
      relatedArtists.artists.forEach(artist => {
        let relatedArtistObj = {
          name: artist.name,
          id: artist.id
        };
        artistObj.related.push(relatedArtistObj);
      });
      return sReqForAlbumsByArtist(artistObj.id, credentials);
    })
    .then(res => {
      res.items.forEach(album => {
        let currentAlbum = {
          title: album.name,
          id: album.id,
          imageUrl: album.images[bigImg(album.images)],
          tags: []
        };
        artistObj.albums.push(currentAlbum);
      });
      return sReqByArtistForTopTracks(artistObj.id, credentials);
    })
    .then(topTracks =>{
      topTracks.tracks.forEach(track =>{
        let currentTrack = {
          title: track.name,
          id: track.id,
          albumId: track.album.id,
          imageUrl: track.album.images[bigImg(track.album.images)],
          tags: []
        };
        artistObj.topTracks.push(currentTrack);
      });
      return artistObj;
    })
    .then(artist =>{
      return Promise.all(
       artist.albums.map((album) => {
         return getTagsFromAlbumWithId(album.id);
       })
      );
    }).then((tagIdArr) => {
      for(let i = 0; i < artistObj.albums.length; i++){
        artistObj.albums[i].tags = tagIdArr[i];
      }
      return artistObj;
    })    
    .then(artist =>{
      return Promise.all(
      [getTagsFromArtistWithId(artist.id)]
      );
    })
    .then((tagIdArr) => {
      artistObj.tags = tagIdArr[0];
      return artistObj;
    })
    .then(artist =>{
      return Promise.all(
       artist.topTracks.map((track) => {
         return getTagsFromSongWithId(track.id);
       })
      );
    }).then((tagIdArr) => {
      for(let i = 0; i < artistObj.topTracks.length; i++){
        artistObj.topTracks[i].tags = tagIdArr[i];
      }
      return artistObj;
    });   
}

module.exports = {sUserSearchForArtist};