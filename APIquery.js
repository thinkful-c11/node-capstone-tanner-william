'use strict';
const fetch = require('node-fetch');
const {getCredentials, baseUrl, bigImg, sReqByAlbumForSongs, sReqForArtistBySearch, sReqByArtistForTopTracks, sReqBySearch, sReqBySongIdForSong, sReqBySongTitleForSongs, sReqForAlbumById, sReqForAlbumBySearch, sReqForAlbumsByArtist, sReqRelated} = require('./functions');

const sUserSearchForArtist = (userQuery)=>{
  let artistObj;
  let credentials;
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
      console.log(topTracks.tracks[0].album)
      topTracks.tracks.forEach(track =>{
        let currentTrack = {
          title: track.name,
          id: track.id,
          albumId: track.album.id,
          imageUrl: track.album.images[bigImg(track.album)],
          tags: []
        };
        artistObj.topTracks.push(currentTrack);
      });
      return artistObj;
    });
};

module.exports = {sUserSearchForArtist};