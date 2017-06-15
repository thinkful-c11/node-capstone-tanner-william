const appState = {

  currentArtist: {
    name: '',
    id: '',
    genres: [],
    tags: [],
    photoUrl: '',
    albums:{
      display: true, //by default, all of an artists albums will display in albums pane
      items:[
        {
          title: '',
          id: '',
          photoUrl: '',
          tags:[]
        },
        {
          title: '',
          id: '',
          photoUrl: '',
          tags:[]
        }
      ]
    },
    topTracks:{
      display: true, //by default, when an artist is selected their top albums will display in albums pane
      items:[
        {
          title: '',
          id: '',
          albumId: '',
          photoUrl: '',
          tags: []
        },
        {
          title: '',
          id: '',
          albumId: '',
          photoUrl: '',
          tags: []
        }
      ]
    },
    relatedArtists:[
      {
        name: '',
        id: ''
      },
      {
        name: '',
        id: ''
      }
    ],
  },

  currentAlbum:{
    display: false, //by default, all albums will render in the albums pane, this will be tru when an album is selected
    title: '',
    id: '',
    tags:[],
    tracks:[
      {
        title: '',
        id: '',
        tags:[]
      },
      {
        title: '',
        id: '',
        tags:[]
      }
    ]
  },

  currentSong:{
    display: false, //use this to determine weather or not to highlight a song
    id: ''
  },

  search:{
    hasSearched: false, // this will change once - the first time a user searches. use to render landing vs main
    searchFor: null, //could be artist, song, or album.
    narrowSearch:{
      display: false, //will turn to true when searching for song or album
      items:[
        {
          type: '', // could be song or album
          title:'',
          id:'',
          artistName:''
        }
      ]
    }
  },

  tagsPane:{
    displayAll: true, //by deault, the tags pane will display all of the tags, when clicked, this can change to false
    displayId: '',
    artists:[
      {
        name:'',
        id: ''
      }
    ],
    albums:[
      {
        title:'',
        artistName:'',
        id:''
      }
    ],
    songs:[
      {
        title:'',
        trackId:'',
        artistName:'',
        artistId:'',
        albumName:'',
        albumId:'',
      }
    ]
  }
};