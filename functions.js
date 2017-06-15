'use strict';
const fetch = require('node-fetch');
const {CurrentArtist} = require('./models');
const base64 = require('base-64');
const {Albums} = require('./models');

const baseUrl = 'https://api.spotify.com/v1/';

function getCredentials(){
  return fetch('https://accounts.spotify.com/api/token',{
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${base64.encode('f397ddf305dd4fb1a348e110c2d0f2ca:fd2e4d4c99494bdc9da125ea768078ba')}`
    }
  })
  .then(uglyStream=> uglyStream.json())
  .then(niceJson=> niceJson.access_token);
}

function evaluateTag(tag, DB){
  return DB.findOrCreate({tag: tag})
  .then(res=> {
    return res;
  });
}

function bigImg(imagesArr){
  let biggest = 0;
  let bigIndex = 0;
  let i = 0;
  imagesArr.forEach(obj=>{
    if(obj.width > biggest){
      bigIndex = i;
      biggest= obj.width;
    }
    i++;
  });
  return bigIndex;
}

function sReqRelated (id, credentials){
  let relatedUrl = `${baseUrl}artists/${id}/related-artists`;
  return fetch(relatedUrl, {
    method: 'get',
    headers: {
      authorization: `Bearer ${credentials}`
    }})
    .then(res => res.json())
    .then(json => json)
    .catch(err => console.error(err));
}

const sReqForArtistBySearch = (userQuery, credentials)=>{
  const searchUrl = `${baseUrl}search?type=artist&q=${userQuery}`;
  return fetch(searchUrl,{
    method: 'get',
    headers: {
      authorization: `Bearer ${credentials}`
    }
  })
  .then(res => res.json())
  .catch(err => console.error(err));
};

function sReqBySearch(baseUrl,type,query,clientRespond, credentials){
  const searchUrl = `${baseUrl}search?type=${type}&q=${query}`;

  return fetch(searchUrl,{
    method: 'get',
    headers: {
      authorization: `Bearer ${credentials}`
    }
  })
  .then(response => {
    //This just makes an ugly stream into an object
    return response.json();
  })
  .then(res=>{
    let responseArtist = res.artists.items[0];
    CurrentArtist.name = responseArtist.name;
    CurrentArtist.id = responseArtist.id;
    CurrentArtist.imageUrl = responseArtist.images[bigImg(responseArtist)].url;
    CurrentArtist.genres = responseArtist.genres;
    CurrentArtist.related = [];

    return sReqRelated(CurrentArtist.id, credentials);
  })
  .then(res=>{
    return res.json();
  })
  .then(res=>{
    res.artists.forEach(obj=>{
      let relatedArtist = {
        name: obj.name,
        id: obj.id,
        genres:obj.genres,
        tags:[],
        imageUrl:obj.images[bigImg(obj)].url
      };
      CurrentArtist.related.push(relatedArtist);
    });
    clientRespond.json(CurrentArtist);
    console.info('sent current artist json to client');
  })
  .catch(err => console.error(err.message));
}

function sReqForAlbumsByArtist(artistId, credentials){
  const searchUrl = `${baseUrl}artists/${artistId}/albums?market=US`;
  return fetch(searchUrl,{
    method: 'get',
    headers: {
      authorization: `Bearer ${credentials}`
    }
  })
  .then(_res => {
    return _res.json();
  })
  .then(_res => _res)
  .catch(err => console.error(err));
}

function sReqForAlbumBySearch(query, credentials){
  const searchUrl = `${baseUrl}search?type=album&q=${query}`;

  return fetch(searchUrl,{
    method: 'get',
    headers: {
      authorization: `Bearer ${credentials}`
    }
  })
  .then(_res => {
    return _res.json();
  })
  .then(_res => _res)
  .catch(err => console.error(err));
}

function sReqForAlbumById(albumId, credentials){
  const searchUrl = `${baseUrl}albums/${albumId}`;

  return fetch(searchUrl,{
    method: 'get',
    headers: {
      authorization: `Bearer ${credentials}`
    }
  })
  .then(_res => {
    return _res.json();
  })
  .then(_res => _res)
  .catch(err => console.error(err));
}

const sReqByArtistForTopTracks = (id, credentials)=>{
  let topTracksUrl = `${baseUrl}artists/${id}/top-tracks?country=US`;
  return fetch(topTracksUrl, {
    method: 'get',
    headers: {
      authorization: `Bearer ${credentials}`
    }}).then(_res => _res.json()).then(res => res)
    .catch(err => console.error(err));
};

const sReqByAlbumForSongs = (albumId, credentials) => {
  let albumTracksUrl = `${baseUrl}albums/${albumId}/tracks`;
  return fetch(albumTracksUrl, {
    method: 'get',
    headers: {
      authorization: `Bearer ${credentials}`
    }}).then(_res => _res.json()).then(res => res)
    .catch(err => console.error(err));
};

const sReqBySongIdForSong = (songId, credentials) => {
  let songUrl = `${baseUrl}tracks/${songId}`;
  return fetch(songUrl, {
    method: 'get',
    headers: {
      authorization: `Bearer ${credentials}`
    }}).then(_res => _res.json()).then(res => res)
    .catch(err => console.error(err));
};

const sReqBySongTitleForSongs = (songTitle, credentials)=>{
  const queryUrl = `${baseUrl}search?type=track&q=track:${songTitle}`;
  return fetch(queryUrl, {
    method: 'get',
    headers: {
      authorization: `Bearer ${credentials}`
    }}).then(_res => _res.json()).then(res => res)
    .catch(err => console.error(err));
};

const getTagsFromAlbumWithId = (albumId)=>{
  return Albums 
    .find({albumId: albumId})
    .then(album => {
      if(album[0] === undefined){
        return [];
      }else{
        return album[0].tags;
      }
    });
};

module.exports = {getCredentials, getTagsFromAlbumWithId, bigImg, sReqRelated, sReqForArtistBySearch, sReqBySearch, evaluateTag, sReqByArtistForTopTracks, sReqByAlbumForSongs, sReqBySongIdForSong, sReqBySongTitleForSongs, sReqForAlbumsByArtist, sReqForAlbumBySearch, sReqForAlbumById, baseUrl};
