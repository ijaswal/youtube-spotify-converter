import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    youtubeToken: "",
    spotifyToken: "BQA3v76AAlQuN0OhnrMnYZpvTS9IqfA_Q9sZCs29TPgi6y-YQRAuD98foj4ULE6VSjVUpEttcvsPNBQR4xgQpKq237pDnO3n9bkNkNskdWQEvyHXnxbYrU7N70CJul6RE83i5xciAUw",
    youtubeSignedIn: false,
    spotifySignedIn: false,
    selectedSongs: []
  },
  mutations: {
    setYoutubeToken(state, newToken){
      state.youtubeToken = newToken;
    },
    setSpotifyToken(state, newToken){
      state.spotifyToken = newToken;
    },
    setSpotifySignedIn(state, signIn){
      state.spotifySignedIn = signIn;
    },
    setYoutubeSignedIn(state, signIn){
      state.youtubeSignedIn = signIn;
    },
    addSong(state, song){
      console.log(state.selectedSongs)
      if(state.selectedSongs.find(elem => {song.snippet.title === elem.name}) === undefined){
        state.selectedSongs.push({"name": song.snippet.title, "thumbnail": song.snippet.thumbnails.default.url, "matched": null, "converted": false});
      }
    },
    removeSong(state, songName){
      if(state.selectedSongs.includes(songName)){
        state.selectedSongs = state.selectedSongs.splice(state.selectedSongs.findIndex((song)=>{ song.name != songName}), 1);
      }
    },
    shiftSongs(state){
      state.selectedSongs = state.selectedSongs.shift();
    }
  },
  getters: {
    getSpotifyToken: state => {
      return state.spotifyToken;
    },
    spotifyIsSignedIn: state => {
      return state.spotifySignedIn;
    },
    getYoutubeToken: state => {
      return state.youtubeToken;
    },
    youtubeIsSignedIn: state => {
      return state.youtubeSignedIn;
    },
    getSongs: state => {
      return state.selectedSongs;
    }
  },
  actions: {
  },
  modules: {
  }
})
