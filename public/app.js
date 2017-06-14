const appState = {
  currentArtist:{},
};

/// Search Function - should work regardless of search type... hopefully. ////////
function submitSearch(type, query){
  fetch(`./search/${type}/${query}`)
  .then(response=>{return response.json();})
  .then(response=>{
    appState.currentArtist = response;
    appState.currentArtist.tags = response.genres;
    appState.currentArtist.tags.sort(function(a, b){
      return a.length - b.length;
    });
  })
  .then(()=>{
    render();
  });
}

////// Main render function ////////
function render(){

  ///Renders the current artist with their stubs & related artists///

  let html = `
    <div class="artistBanner container">
      <img class="artistPhoto main" src="${appState.currentArtist.imageUrl}">
      <h3>${appState.currentArtist.name}</h3>
    </div>
    <div class="currentArtist">
      <div class="artistDescription">
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod, lorem molestie accumsan ultrices, libero elit mollis nibh, non pellentesque dolor urna at libero. Proin ac rhoncus massa. Nulla facilisi. Vestibulum eu tristique lorem, id semper erat. Vestibulum eget justo ac mauris fringilla aliquam. Nullam feugiat purus sed justo ullamcorper bibendum. Pellentesque venenatis et lectus sed ornare. Nullam et luctus dui. Praesent varius purus et dolor rhoncus ornare.

        In vestibulum volutpat ligula, eget pellentesque risus aliquet a. Donec gravida nisi eros, at porta nulla sollicitudin eu. Sed quis imperdiet metus. Praesent a nisi sit amet tortor vestibulum lacinia a ac enim. Praesent eleifend neque varius, ornare est ut, interdum ante. Aliquam erat volutpat. Cras leo elit, gravida nec urna et, pretium pulvinar risus. Etiam dignissim tristique rhoncus. Quisque lacinia at nisl ut placerat. Duis nec tempus sem. Pellentesque cursus ligula vitae lorem vestibulum scelerisque. Nullam consectetur orci ac magna eleifend semper. Maecenas sagittis, arcu at suscipit dapibus, augue orci rhoncus ligula, ac lobortis tellus mauris eu tellus.

        Donec varius velit et elit viverra, eu porttitor urna ultrices. Vivamus ultrices neque eget odio condimentum, in pulvinar eros vehicula. Suspendisse suscipit, orci sit amet elementum tincidunt, augue libero blandit ex, in fermentum nulla neque quis nisi. Pellentesque auctor lobortis orci in ullamcorper. Maecenas sed elit libero. Vestibulum eleifend tortor eget lacus varius, in volutpat est consectetur. Suspendisse quis ornare lectus. Nunc faucibus non orci non lobortis. Nam ultricies erat a maximus lacinia.</p>
      </div>
      <div class="contentBanner"><h2>Stubs</h2></div>
      <ul class="stubs content container">
    `;
    appState.currentArtist.tags.forEach(item=>{
      html+= `<li class="container"><div class="stubStyle"><div class="dot"></div></div><div class="stub">${item}</div></li>`;
    });
    html+= `</ul>
      <div class="contentBanner"><h2>Related Artists</h2></div>
      <ul class="related content container">`;
    appState.currentArtist.related.forEach(item=>{
      html+= `<li class="relatedArtist container">
              <img class="artistPhoto" src="${item.imageUrl}">
              <div class="relatedName">${item.name}</div>
            </li>`;
    });

    html+= `</ul></div>`;

    $('.item.one').html(html);
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
  
}

$(function(){eventHandler();});


