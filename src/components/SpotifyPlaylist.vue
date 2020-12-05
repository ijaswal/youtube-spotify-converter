<template>
  <v-container>
    <v-flex xs12>
      <v-btn @click="triggerSignIn" class="my-5" dark fab x-large color="white">
        <v-icon dark x-large color="green" :class="{ loadSpin: isLoggingIn }">fab fa-spotify</v-icon>
      </v-btn>
    </v-flex>
    <v-expand-transition>
      <v-card style="background-color: #121212;" flat v-show="testSignIn">
        <v-btn
          v-show="!isSignedIn"
          class="ma-2"
          color="success"
          @click="getSpotifyPlaylists()"
        >Get Playlists</v-btn>
        <v-content v-show="selectedPlaylist.songs === null">
          <blockquote
            style="color: #fff;"
            class="blockquote"
            v-show="isSignedIn"
          >Hello, {{username}}</blockquote>
          <v-row>
            <v-col>
              <v-btn
                @click="getSpotifyPlaylists"
                v-show="isSignedIn"
                :loading="retreivingPlaylists"
                :disabled="retreivingPlaylists"
                color="#b3b3b3"
                icon
                class="text-left"
              >
                <v-icon>mdi-refresh</v-icon>
              </v-btn>
            </v-col>
            <v-col>
              <v-menu offset-y>
                <template v-slot:activator="{ on }">
                  <v-btn v-show="isSignedIn" icon color="#b3b3b3" class="text-right" dark v-on="on">
                    <v-icon>mdi-sort</v-icon>
                  </v-btn>
                </template>
                <!-- <v-list>
                  <v-list-item
                    v-for="(option, index) in sortOptions"
                    :key="index"
                    @click="sortPlaylists(option)"
                    link
                  >
                    <v-list-item-title :class="{'primary--text': option.active}">{{ option.text }}</v-list-item-title>
                  </v-list-item>
                </v-list>-->
              </v-menu>
            </v-col>
          </v-row>
        </v-content>
        <blockquote
          style="color: #fff;"
          class="blockquote"
          v-show="selectedPlaylist.songs != null"
        >{{selectedPlaylist.name}}</blockquote>
        <v-btn
          @click="selectedPlaylist = {
              name: null,
              total: null,
              songs: null,
              id: null,
              offset: 5
            }"
          v-show="selectedPlaylist.songs != null"
          color="#b3b3b3"
          icon
          class="text-left"
        >
          <v-icon>mdi-undo</v-icon>
        </v-btn>
        <v-row v-show="selectedPlaylist.songs != null">
          <v-col>
            <v-btn
              :loading="retreivingPlaylistItems"
              :disabled="retreivingPlaylistItems"
              block
              text
              class="text-left"
              @click="()=>{if(selectedPlaylist.offset < selectedPlaylist.total){selectedPlaylist.offset + 5 < selectedPlaylist.total ? selectedPlaylist.offset = selectedPlaylist.offset + 5: selectedPlaylist.offset = selectedPlaylist.total; getSpotifyPlaylistItems(selectedPlaylist.id, selectedPlaylist.total, selectedPlaylist.name)}}"
            >
              <v-icon color="#b3b3b3">mdi-chevron-left</v-icon>
            </v-btn>
          </v-col>
          <v-col>
            <v-btn
              :loading="retreivingPlaylistItems"
              :disabled="retreivingPlaylistItems"
              block
              text
              class="text-left"
              @click="()=>{if(selectedPlaylist.offset > 5) {selectedPlaylist.offset - 5 > 0 ? selectedPlaylist.offset = selectedPlaylist.offset - 5: selectedPlaylist.offset = 5; getSpotifyPlaylistItems(selectedPlaylist.id, selectedPlaylist.total, selectedPlaylist.name)}}"
            >
              <v-icon color="#b3b3b3">mdi-chevron-right</v-icon>
            </v-btn>
          </v-col>
        </v-row>
        <v-list style="background-color: #121212;" v-show="selectedPlaylist.songs === null">
          <v-content v-for="playlist in playListResponse" :key="playlist.id">
            <v-list-item
              class="spotify-list"
              link
              @click="getSpotifyPlaylistItems(playlist.id, playlist.tracks.total, playlist.name)"
            >
              <v-img class="list-thumbnail" :src="playlist.images[0].url"></v-img>
              <v-list-item-title style="color: #fff" class="text-left" v-text="playlist.name" />
              <v-list-item-subtitle
                style="color: #919191"
                class="text-right pr-5"
              >{{playlist.tracks.total}} songs</v-list-item-subtitle>
            </v-list-item>
            <v-flex xs12>
              <v-divider></v-divider>
            </v-flex>
          </v-content>
        </v-list>
        <v-list style="background-color: #121212;" v-show="selectedPlaylist.songs != null">
          <v-content v-for="song in selectedPlaylist.songs" :key="song.track.id">
            <v-list-item class="spotify-list" link>
              <v-img class="list-thumbnail" :src="song.track.album.images[0].url"></v-img>
              <v-list-item-title style="color: #fff" class="text-left" v-text="song.track.name" />
              <v-list-item-title
                style="color: #919191"
                class="text-right"
                v-text="song.track.artists[0].name"
              />
            </v-list-item>
            <v-flex xs12>
              <v-divider></v-divider>
            </v-flex>
          </v-content>
        </v-list>
      </v-card>
    </v-expand-transition>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  name: "SpotifyPlaylist",
  data: () => ({
    clientID: "245459384a594a7285e57cbc01ee4e21",
    playListResponse: null,
    isSignedIn: false,
    testSignIn: true,
    isLoggingIn: false,
    retreivingPlaylists: false,
    username: null,
    sortOptions: [
      { text: "Video Count", active: true },
      { text: "Alpabetical", active: false }
    ],
    retreivingPlaylistItems: false,
    selectedPlaylist: {
      name: null,
      total: null,
      songs: null,
      id: null,
      offset: 5
    },
    urlParam: null
  }),
  methods: {
    getLoginURL() {
      let self = this;
      return (
        "https://accounts.spotify.com/authorize?client_id=" +
        self.clientID +
        "&response_type=token" +
        "&redirect_uri=" +
        encodeURIComponent("http://localhost:8080/#/spotify")
      );
    },
    triggerSignIn() {
      let self = this;
      self.isLoggingIn = true;
      var width = 450,
        height = 730,
        left = screen.width / 2 - width / 2,
        top = screen.height / 2 - height / 2;

      window.open(
        self.getLoginURL(),
        "Spotify",
        "menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=" +
          width +
          ", height=" +
          height +
          ", top=" +
          top +
          ", left=" +
          left
      );
    },
    getUrlVars() {
      var vars = {};
      window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(
        m,
        key,
        value
      ) {
        vars[key] = value;
      });
      this.urlParam = vars;
      console.log(JSON.stringify(vars));
    },
    getSpotifyPlaylists() {
      let self = this;
      axios
        .get("https://api.spotify.com/v1/me/playlists", {
          headers: {
            Authorization: "Bearer " + self.$store.getters.getSpotifyToken
          }
        })
        .then(response => {
          console.log(response.data);
          self.playListResponse = response.data.items;
          self.username = response.data.items[0].owner.display_name;
          self.isSignedIn = true;
          self.$store.commit("setSpotifySignedIn", true);
        });
    },
    getSpotifyPlaylistItems(playlistId, total, name) {
      let self = this;
      self.retreivingPlaylists = true;
      self.selectedPlaylist.name = name;
      self.selectedPlaylist.id = playlistId;
      self.selectedPlaylist.total = total;
      let requestOffset = total - self.selectedPlaylist.offset;
      console.log(total);
      console.log(requestOffset);
      axios
        .get(
          "https://api.spotify.com/v1/playlists/" +
            playlistId +
            "/tracks?limit=5&offset=" +
            requestOffset,
          {
            headers: {
              Authorization: "Bearer " + self.$store.getters.getSpotifyToken
            }
          }
        )
        .then(response => {
          console.log(response.data);
          self.selectedPlaylist.songs = response.data.items.reverse();
          self.retreivingPlaylists = false;
        });
    }
  },
  computed: {
    spotifyToken() {
      return this.$store.getters.getSpotifyToken;
    }
  },
  created: function() {
    this.getUrlVars();
  }
};
</script>

<style>
.spotify-list {
  height: 101px;
  padding-top: 16px;
  padding-bottom: 16px;
  font-family: "Proxima Nova", sans-serif;
  font-size: 24px;
  color: #fff;
  background-color: #121212;
  font-weight: 500;
}

.spotify-list:hover {
  background-color: #282828;
}

.loadSpin {
  -webkit-animation: spin 2500ms infinite linear;
  animation: spin 2500ms infinite linear;
}

@-webkit-keyframes spin {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(359deg);
    transform: rotate(359deg);
  }
}
@keyframes spin {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(359deg);
    transform: rotate(359deg);
  }
}
</style>