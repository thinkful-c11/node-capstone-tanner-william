'use strict';
const fetch = require('node-fetch');
const {getCredentials, baseUrl, bigImg, sReqByAlbumForSongs, sReqForArtistBySearch, sReqByArtistForTopTracks, sReqBySearch, sReqBySongIdForSong, sReqBySongTitleForSongs, sReqForAlbumById, sReqForAlbumBySearch, sReqForAlbumsByArtist, sReqRelated} = require('./functions');

const sUserSearchForArtist = (userQuery, res)=>{
  let artistObj;
  let credentials;
  getCredentials().then(_credentials =>{
    credentials = _credentials;
    sReqForArtistBySearch(userQuery, credentials)
    .then(artistsObj => {
      const artist = artistsObj.artists.items[0];
      artistObj = {
        name: artist.name,
        id: artist.id,
        imageUrl: artist.images[bigImg(artist)],
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
      artistObj.related.push(relatedArtists);
      return sReqForAlbumsByArtist(artistObj.id, credentials);
    })
    .then(res => {
      res.items.forEach(album => {
        let currentAlbum = {
          title: album.name,
          id: album.id,
          imageUrl: album.images[bigImg(album)],
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
          imageUrl: track.album.images[bigImg(track)],
          tags: []
        };
        artistObj.topTracks.push(currentTrack);
      });
      res.json(artistObj);
    });
  });
};

module.exports = {sUserSearchForArtist};