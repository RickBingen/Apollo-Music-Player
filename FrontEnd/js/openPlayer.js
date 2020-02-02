const app = new Vue({
  el: '#app',
  data: {
    objList: {},
    songs: [],
    albums: [],
    artists: [],
    playlists: [],
    currentPage: "songs"
  },
  methods: {
    setVolume: function(val){
      var asJSON = JSON.stringify({'volume':val});

      fetch('http://localhost:5000/api/volume', {
                method: 'POST',
                mode: "cors",
                body: asJSON,
                headers:{
                    "Content-Type": 'application/json'
                }
      }).then(function(response){
        return response.text();
      }).then(function(text){});
    },
    progressBar: function(obj){
      var bar = document.getElementById("progBar");
      barPercent = (obj.elapsed / obj.duration) * 100;
      bar.style.width = String(barPercent) + '%';
    },
    secondsTo_MMSS: function(seconds){
      durMin = seconds / 60;
      durSec = seconds % 60;
      durMin = durMin.toFixed(0);
      durSec = durSec.toFixed(0);
      function pad(value) {
        if(value < 10) {
            return '0' + value;
        } else {
            return value;
        }
      }
      durMin = pad(durMin);
      durSec = pad(durSec);
      durMinStr = String(durMin);
      durSecStr = String(durSec);
      return durMinStr + ':' + durSecStr;
    }, 
    currentlyPlaying: function(){
      fetch('http://localhost:5000/api/get_current', {method: 'GET', mode: 'cors'})
      .then(function(response) {
        return response.json();
      })
      .then(function (obj) {
        var r = obj.palette[0][0];
        var g = obj.palette[0][1];
        var b = obj.palette[0][2];
        var r2 = obj.palette[1][0];
        var g2 = obj.palette[1][1];
        var b2 = obj.palette[1][2];
        document.getElementById('currentlyPlaying').style.backgroundImage = 'linear-gradient(to bottom, rgba('+r+','+g+','+b+','+1+'), rgba('+r2+','+g2+','+b2+','+0+'))';
        if (obj.pic == '' || obj.pic == null || obj.pic == 'none') {
          document.getElementById('currentAlbum').setAttribute('src', "./images/AlbumArt-01.png");
        }
        else {
          document.getElementById('currentAlbum').setAttribute('src', obj.pic);
        }
        document.getElementById('returnCurrentSong').innerHTML = obj.title;
        document.getElementById('returnCurrentArtist').innerHTML = obj.artist;
        document.getElementById('returnCurrentDuration').innerHTML = app.secondsTo_MMSS(obj.duration);
        document.getElementById('returnCurrentElapsed').innerHTML = app.secondsTo_MMSS(obj.elapsed);
        setInterval(app.currentlyPlaying(), 1000);
        setInterval(app.progressBar(obj), 500);
        delete obj
      });
    },
    generateLibrary: function(){
      console.log(this.objList);
      for (var i = 0; i < this.objList.songs.length; i++) {
        songLength = this.objList.songs[i].duration;
        minutes = (songLength/60);
        minutes = minutes.toFixed(2);
        this.objList.songs[i].duration = minutes;
      }
      this.songs = this.objList.songs;
    },
    addAlbums: function(){
      for (var i = 0; i < this.objList.albums.length; i++){
        if (this.objList.albums[i].pic === null || this.objList.albums[i].pic ==="none"){
          this.objList.albums[i].pic = "./images/AlbumArt-01.png"
        }
      }

      this.albums = this.objList.albums;
      /*for(var i = 0; i < this.albums.length; i++){
        if ((library[i].pic == null) || (library[i].pic == "none")){
          var img = document.createElement('img');
          img.setAttribute("src", "./images/AlbumArt-01.png");
          img.classList.add("square");
          img.classList.add("albumType");
          img.setAttribute("id", library[i].pic);
          document.getElementById("mainAlbums").append(img);
        }
        else 
        {
          var img = document.createElement('img');
          img.setAttribute("src" , library[i].pic);
          img.classList.add("square");
          img.classList.add("albumType");
          img.setAttribute("id" , library[i].pic);
          document.getElementById("mainAlbums").append(img);
        }
      }*/
    },
    addPlaylists: function(){
      var img = document.createElement('img');
      img.setAttribute('onclick', function newPlaylist(){
        document.getElementById("mainPlaylist").append(img);
      });
      img.src = "https://cdn.pixabay.com/photo/2018/11/13/21/43/instagram-3814051_1280.png"
      img.classList.add("square");
      img.setAttribute("onclick" , "current()")
      document.getElementById("mainPlaylists").append(img);
    },
    addArtists: function(){
      var library = [];
      library = this.objList.artists;
      let artistSet = new Set();
      var artistTable = document.createElement('table');
      artistTable.classList.add("artistDisplay");

      for (var i=0; i < library.length; i++){
        artistSet.add(library[i].name);
      };

      let artistArray = Array.from(artistSet);
      artistArray.sort();
      for(var i =0; i<artistArray.length; i++){

        var row = document.createElement("tr");

        var artistName = document.createElement("td");
        var artist = document.createTextNode(artistArray[i]);
        artistName.append(artist);
        row.append(artistName);
        row.setAttribute("id" , "artist-" + artistArray[i]);
        artistTable.append(row);
      } 
      document.getElementById("mainArtists").append(artistTable);
    },
    boot2: function(){
      this.currentlyPlaying();
      this.addAlbums();
      //this.addPlaylists();
      //this.addArtists();
      this.generateLibrary();
    },
    fetchAllSongs: function(){
      fetch('http://localhost:5000/api/obj_list', {method: 'GET', mode: 'cors'})
        .then(function(response) {
            return response.json();
          }).then(function (obj) {
          app.objList = obj;
          app.boot2();
        });
    }, 
    boot: function(){
      $("#volume").slider({
        min: 0,
        max: 100,
        value: 50,
        range: "min",
        slide: function(event, ui) {
          app.setVolume(ui.value);
        }
      });

      this.fetchAllSongs();
    },
    go2Songs: function(){
      this.currentPage = "songs";
    },
    go2Playlists: function(){
      this.currentPage = "playlists";
    },
    go2Albums: function(){
      this.currentPage = "albums"
    },
    go2Artists: function(){
      this.currentPage = "artists"
    },
    current: function(){
      if (document.getElementById("currentCue").style.display = "none"){
        document.getElementById("currentCue").style.display = "block";
      }
    },
    closeCurrent: function(){
      if (document.getElementById("currentCue").style.display = "block"){
        document.getElementById("currentCue").style.display = "none";
      }
    },
    shuffle: function(){
      var x = document.getElementById("shuffle");
      if (x.style.color === "white") {
        x.style.color = "#f7931E";
        /* shuffle on*/
        var j = fetch('http://localhost:5000/api/shuffle', { method: 'POST', mode: 'cors' });
        j.then(function (response) {  
          return response.text();
        }).then(function (text) {
          app.currentlyPlaying();
        });
      } else {
        x.style.color = "white";
        /* shuffle off*/
      }
    },
    repeat: function(){
      var j = fetch('http://localhost:5000/api/repeat', { method: 'POST', mode: 'cors' });
      j.then(function (response) {
        return response.text();
      }).then(function (text) {
        console.log('POST response (repeat playlist): ');
        console.log(text);
      });

      var x = document.getElementById("rewind");
      if (x.style.color === "white") {
        x.style.color = "#f7931E";
        /* repeat playlist on*/
      } else {
        x.style.color = "white";
        /* repeat off*/
      }
    },
    repeatOff: function(){
      var j = fetch('http://localhost:5000/api/repeatoff', { method: 'POST', mode: 'cors' });
      j.then(function (response) { 
          return response.text();
      }).then(function (text) {
          console.log('POST response (repeat off): ');
          console.log(text);
      });

      var x = document.getElementById("rewind");
      var y = document.getElementById("rewindSong");

      if (y.style.display === "inline" || x.style.color === "#f7931E") {
          x.style.color = "white";
          x.style.display = "inline";
          y.style.display = "none";
          /* repeat song off*/
      }
    },    
    idSendPlay: function(val){
      console.log(val);
      var asJSON = JSON.stringify({'id':val});fetch('http://localhost:5000/api/play_selected', {
      method: 'POST',
      mode: "cors",
      body: asJSON,
      headers:{"Content-Type": 'application/json'}
      }).then(function(response){
        return response.text();
      }).then(function(text){
      });
    },    
    togglePlaying: function(){
      document.getElementById("pause").style.display = "inline";
      document.getElementById("play").style.display = "none";
      
      var j =fetch('http://localhost:5000/api/play', {method: 'POST', mode: 'cors'});
        j.then(function(response) {
        return response.text();
        }).then(function (text) {
        app.currentlyPlaying();
      });
    },
    toggleStopped: function(){
      document.getElementById("pause").style.display = "none";
      document.getElementById("play").style.display = "inline";
      fetch('http://localhost:5000/api/play', {method: 'POST', mode: 'cors'}).then(function(response) {
      });
    },
    nextSong: function(){
      fetch('http://localhost:5000/api/next', {method: 'GET', mode: 'cors'}).then(function(response) {
        return response.text();
        }).then(function (text) {
        app.currentlyPlaying();
      });
    },
    prevSong: function(){
      fetch('http://localhost:5000/api/previous', {method: 'GET', mode: 'cors'}).then(function(response) { 
      return response.text();
      }).then(function (text) {
        app.currentlyPlaying();
      });
    }
  },
  mounted(){
    this.boot();
  }
})


//TO DO redo repeat song/playlist
function repeatSong(){
  var j = fetch('http://localhost:5000/api/repeatSong', { method: 'POST', mode: 'cors' });
  j.then(function (response) { 
    return response.text();
  }).then(function (text) {
    console.log('POST response (repeat song): ');
    console.log(text);
  });

  var x = document.getElementById("rewind");
  var y = document.getElementById("rewindSong");
  if (x.style.display === "inline") {
    x.style.display = "none";
    y.style.display = "inline";
    /* repeat song on*/
  } else {
    x.style.color = "white";
    x.style.display = "inline";
    y.style.display = "none";
    /* repeat off*/
  }
}