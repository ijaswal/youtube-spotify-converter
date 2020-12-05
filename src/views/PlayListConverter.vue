<template>
  <v-container style="background-image: url('./assets/interlaced.png')">
    <v-dialog v-if="youtubeVideos.length > 0" v-model="dialog" width="60%">
      <template v-slot:activator="{ on }">
        <v-btn @click="searchSong()" class="ma-2" color="success" v-on="on">
          <v-icon left>fas fa-exchange-alt</v-icon>Convert
        </v-btn>
      </template>
      <v-card>
        <v-card-title>
          <span class="headline">Convert Song?</span>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" sm="6">Video:</v-col>
            <v-col cols="12" sm="6">Found song:</v-col>
          </v-row>
          <v-row>
            <v-col cols="12" sm="6">
              <v-card>
                <v-card-text class="youtube-modal">
                  <p class="mx-auto">{{youtubeVideos[this.currentIndex].name}}</p>
                  <v-img
                    class="thumbnail mx-auto"
                    :src="youtubeVideos[this.currentIndex].thumbnail"
                  ></v-img>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" sm="6">
              <v-card dark v-if="youtubeVideos[this.currentIndex].matched != null">
                <v-card-text class="spotify-modal">
                  <p class="mx-auto">Title: {{youtubeVideos[currentIndex].matched.title}}</p>
                  <p class="mx-auto">Artist: {{youtubeVideos[currentIndex].matched.artist}}</p>
                  <v-img
                    class="thumbnail mx-auto"
                    :src="youtubeVideos[this.currentIndex].matched.thumbnail"
                  ></v-img>
                </v-card-text>
              </v-card>
              <v-col class="ma-auto" v-else cols="12" sm="6">No match found</v-col>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="dialog = false">Manual Search</v-btn>
          <v-btn color="primary" @click="convert()">Convert</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-row>
      <v-col cols="12" sm="6">
        <youtube-playlist></youtube-playlist>
      </v-col>
      <v-col cols="12" sm="6">
        <spotify-playlist></spotify-playlist>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import YoutubePlaylist from "@/components/YoutubePlaylist.vue";
import SpotifyPlaylist from "@/components/SpotifyPlaylist.vue";
import axios from "axios";
export default {
  name: "PlayListConverter",
  components: {
    "youtube-playlist": YoutubePlaylist,
    "spotify-playlist": SpotifyPlaylist
  },
  data: () => ({
    dialog: false,
    currentIndex: 0
  }),
  computed: {
    spotifyLoggedIn() {
      return this.$store.getters.spotifyIsSignedIn;
    },
    youtubeLoggedIn() {
      return this.$store.getters.youtubeIsSignedIn;
    },
    youtubeVideos() {
      return this.$store.getters.getSongs;
    },
    convertReady() {
      return (
        this.youtubeVideos.length > 0 &&
        this.youtubeLoggedIn &&
        this.spotifyLoggedIn
      );
    }
  },
  methods: {
    convert() {
      if (this.youtubeVideos.length > 0) {
        console.log("Converting", this.youtubeVideos[0].name);
        this.$store.commit("shiftSongs");
        this.searchSong();
      } else {
        this.dialog = false;
      }
    },
    searchSong() {
      console.log("Searching", this.youtubeVideos[0].name.replace(/\W/g, " "));
      let self = this;
      axios
        .get(
          "https://api.spotify.com/v1/search?" +
            "q=" +
            this.youtubeVideos[0].name.replace(/\W/g, " ") +
            "&type=track&limit=1",
          {
            headers: {
              Authorization: "Bearer " + self.$store.getters.getSpotifyToken
            }
          }
        )
        .then(response => {
          console.log(response.data);
          this.youtubeVideos[0].matched = {
            title: response.data.tracks.items[0].name,
            artist: response.data.tracks.items[0].artists[0].name,
            album: response.data.tracks.items[0].album.name,
            thumbnail: response.data.tracks.items[0].album.images[0].url,
            uri: response.data.tracks.items[0].uri
          };
          console.log("Found", this.youtubeVideos[0].matched);
        });
    }
  }
};
</script>
<style>
.spotify-modal {
  font-family: "Proxima Nova", sans-serif;
  color: #fff;
  background-color: #121212;
}

.youtube-modal {
  font-family: "Roboto", sans-serif;
  color: #0d0d0d;
}

.thumbnail {
  height: 134px;
  width: 240px;
}

.list-thumbnail {
  height: 67px;
  width: 120px;
  margin-right: 10px;
}
</style>