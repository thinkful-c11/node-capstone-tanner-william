const appState = {
  hasSearched: false,
  currentArtist:{},
  allTags:[]
};

/// Search Function - should work regardless of search type... hopefully. ////////
// function submitSearch(type, query){
//   fetch(`./search/${type}/${query}`)
//   .then(response=>{return response.json();})
//   .then(response=>{
//     appState.currentArtist = response;
//     appState.currentArtist.tags = response.genres;
//     appState.currentArtist.tags.sort(function(a, b){
//       return a.length - b.length;
//     });
//   })
//   .then(()=>{
//     render();
//   });
// }

function getSetTags(identify){
  return fetch(`http://localhost:8080/tags/${identify[0]}/${identify[1]}`)
    .then(_res => _res)
    .then(stream => stream.json())
    .then(json => {
      if(identify[0] === 'artists'){
        console.log(json);
        appState.currentArtist.tags = json[0].tags;
      }
      else if (identify[0] === 'albums'){
        appState.currentArtist.albums.forEach(album=>{
          if(album.id === json[0].albumId){
            album.tags = json[0].tags;
          }
        });
      }
      else if(identify[0] === 'songs'){
        appState.currentArtist.topTracks.forEach(song=>{
          if(song.id === json[0].songId){
            song.tags = json[0].tags;
          }
        });
      }
    });
}

function getTagsPane(){
  fetch('./alltags')
  .then(stream=> stream.json())
  .then(allTags=> {
    appState.allTags = allTags;
    console.log(appState);
  });
}

getTagsPane();

function submitSearch(type, query){
  fetch(`./testing/${query}`)
  .then(stream => stream.json())
  .then(json => {
    appState.hasSearched = true;
    appState.currentArtist = json;
    console.log(appState);
    return getTagsPane();
  })
  .then(()=> render());
}

function buildBody(type, id, tag){
  let body;
  if(type === 'artists'){
    body = {
      artist: appState.currentArtist.name,
      artistId: id,
      tags: tag
    };
  }
  else if(type === 'albums'){
    let albumId;
    let albumTitle;
    appState.currentArtist.albums.forEach(album=>{
      if(album.id === id){
        albumId = album.id;
        albumTitle = album.title;
      }
    });
    body = {
      albumId: albumId,
      albumTitle: albumTitle,
      tags: tag,
      artist: appState.currentArtist.name
    };
  }
  else if(type === 'songs'){
    let songTitle;
    let albumTitle;
    let albumId;
    let songId;
    appState.currentArtist.topTracks.forEach(song=>{
      if (song.id === id){
        songTitle = song.title;
        albumTitle = song.albumTitle;
        albumId = song.albumId;
        songId = song.id;
      }
    });
    body = {
      songTitle,
      albumTitle,
      albumId,
      songId,
      tags: tag,
      artist: appState.currentArtist.name,
      artistId: appState.currentArtist.id
    };
  }
  return body;
}

////// Main render function ////////
function render(){

  ///Renders the current artist with their stubs & related artists///

  let html = `
    <div class="artistBanner container">
      <div class="artistPhoto main"><img class="aP"src="${appState.currentArtist.imageUrl.url}"></div>
      <div class="artistName"><h3>${appState.currentArtist.name}</h3></div>
    </div>
    <div class="currentArtist">
      <div class="contentBanner"><h2>Stubs</h2></div>
      <ul class="stubs content container">
    `;
  appState.currentArtist.tags.forEach(item=>{
    html+= `<li class="oh container"><div class="stubStyle"><div class="dot"></div></div><div class="stub">${item}</div></li>`;
  });
  html+= `<li class="oh container"><div class="stubStyle"><div class="dot"></div></div><div class="addStub stub" id="artists/${appState.currentArtist.id}">+</div></li>
      </ul>
      <div class="contentBanner"><h2>Related Artists</h2></div>
      <ul class="content container column">`;
  appState.currentArtist.related.forEach(item=>{
    html+= `<li class="oh relatedArtist container">
              <div class="relatedName">${item.name}</div>
            </li>`;
  });

  html+= '</ul></div>';

  $('.item.one').html(html);

    // Renders albums w/ images, names, & stubs

  $('.albums.contentHeader').html(`<h2>Albums by ${appState.currentArtist.name}</h2>`);

  html = `
      <ul class="albums content container center">
     `;

  appState.currentArtist.albums.forEach(album=>{
    html+= `
      <li class="album container"><img class="albumThumb" src=${album.imageUrl.url}><div class="albumTitle container"><div>${album.title}</div></div></li><ul class="stubs container albumStubs">
      `;
    album.tags.forEach(tag=>{
      html+= `
        <li class="oh container"><div class="stubStyle"><div class="dot"></div></div><div class="stub">${tag}</div></li>
        `;
    });
    html+= `<li class="oh container"><div class="stubStyle"><div class="dot"></div></div><div class="stub addStub" id="albums/${album.id}">+</div></li></ul>`;
  });

  html+= '</ul>';

  $('.albumsPane').html(html);

    // Renders top tracks w/ stubs
  
  $('.songs.contentHeader').html(`<h2>${appState.currentArtist.name}'s Top Tracks</h2>`);

  html=`
    <ul class="topTracks content container">
    `;

  appState.currentArtist.topTracks.forEach(song=>{
    html+=`
        <li class="song container"><h2>${song.title}</h2></li><ul class="stubs content container songStubs">
      `;
    song.tags.forEach(tag=>{
      html+= `
          <li class="oh container"><div class="stubStyle"><div class="dot"></div></div><div class="stub">${tag}</div></li>
        `;
    });
    html+= `<li class="oh container"><div class="stubStyle"><div class="dot"></div></div><div class="stub addStub" id="songs/${song.id}">+</div></li></ul>`;
  });
  html+= '</ul>';

  $('.songsPane').html(html);

  getTagsPane();

  html=`
      <ul class="allTags content container">
    `;

  appState.allTags.forEach(tag=>{
    html+=`
        <div class="stubStyle"><div class="dot"></div></div><div class="stub">${tag.tag}</div>
        <br><div><h2>Artists</h2></div><br>
      `;
    tag.artists.forEach(artist=>{
      if(!(artist.artist === undefined)){
        html+=`
          <p>${artist.artist}</p>
        `;
      }
    });
    html+= `
      <br><div><h2>Albums</h2></div><br>
    `;
    tag.albums.forEach(album=>{
      if(!(album.title === undefined)){
        html+=`
          <p>${album.title}</p>
        `;
      }
    });
    html+= `
      <br><div><h2>Songs</h2></div><br>
    `;
    tag.songs.forEach(song=>{
      if(!(song.title === undefined)){
        html+=`
          <p>${song.title}</p>
        `;
      }
    });
  });

  html+=`
      </ul>
    `;

  $('.tagsPane').html(html);
      
    
}


//Event Handler
function eventHandler(){

  $('#search').submit(
    event=>{
      event.preventDefault();
      let type='artist';
      let query= $('#queryString').val();
      submitSearch(type,query);
    });

  $('.pane').on('click', '.addStub', function(e){
    e.stopPropagation();
    $(this).removeClass('addStub');
    $(this).html(`<form class="stubForm" id="${$(this).attr('id')}"><input class="stubInput" type="text"></form><span class="cancelAdd">X</span>`);
  });

  $('.pane').on('submit', '.stubForm', function(e){
    e.stopPropagation();
    e.preventDefault();
    const input = $('.stubInput').val();
    const identify = $(this).attr('id').split('/');
    const body = buildBody(identify[0], identify[1], input);
    console.log('this is body',body);
    console.log('THIS IS IDENTIFY',identify[0], identify[1]);
    fetch(`http://localhost:8080/tags/${identify[0]}`,{
      method: 'PUT',
      headers:{
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    .then(res => {
      return getSetTags(identify);
    })
    .then(()=> getTagsPane())
    .then(()=> render())
    .catch(err=>{
      console.log(err);
    });

  });

  $('.veggieBurger').click(e=>{
    $('.myArtists').show();
  });
  
}

$(function(){eventHandler();});


