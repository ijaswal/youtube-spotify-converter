<template>
  <v-container>
    <v-flex xs12>
      <v-btn @click="triggerSignIn" class="my-5" dark fab x-large color="white">
        <v-icon dark x-large color="red" :class="{ loadSpin: isLoggingIn }">fab fa-youtube</v-icon>
      </v-btn>
    </v-flex>
    <v-expand-transition>
      <v-card flat v-show="isSignedIn">
        <v-content v-show="selectedPlaylist === null">
          <blockquote class="blockquote" v-show="isSignedIn">Hello, {{selectedChannel}}</blockquote>
          <v-row>
            <v-col>
              <v-btn
                @click="getPlaylists"
                v-show="isSignedIn"
                :loading="retreivingPlaylists"
                :disabled="retreivingPlaylists"
                color="primary"
                icon
                class="text-left"
              >
                <v-icon>mdi-refresh</v-icon>
              </v-btn>
            </v-col>
            <v-col>
              <v-menu offset-y>
                <template v-slot:activator="{ on }">
                  <v-btn v-show="isSignedIn" icon color="primary" class="text-right" dark v-on="on">
                    <v-icon>mdi-sort</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item
                    v-for="(option, index) in sortOptions"
                    :key="index"
                    @click="sortPlaylists(option)"
                    link
                  >
                    <v-list-item-title :class="{'primary--text': option.active}">{{ option.text }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-col>
          </v-row>
        </v-content>
        <blockquote class="blockquote" v-show="selectedPlaylist != null">{{selectedPlaylistName}}</blockquote>
        <v-btn
          @click="selectedPlaylist = null"
          v-show="selectedPlaylist != null"
          color="primary"
          icon
          class="text-left"
        >
          <v-icon>mdi-undo</v-icon>
        </v-btn>
        <v-row v-show="selectedPlaylist != null">
          <v-col>
            <v-btn
              @click="getPlaylistItems(selectedPlaylist[0].snippet.playlistId, selectedPlaylistName, 2)"
              :loading="retreivingPlaylistItems"
              :disabled="retreivingPlaylistItems"
              block
              text
              class="text-left"
            >
              <v-icon color="primary">mdi-chevron-left</v-icon>
            </v-btn>
          </v-col>
          <v-col>
            <v-btn
              @click="getPlaylistItems(selectedPlaylist[0].snippet.playlistId, selectedPlaylistName, 1)"
              :loading="retreivingPlaylistItems"
              :disabled="retreivingPlaylistItems"
              block
              text
              class="text-left"
            >
              <v-icon color="primary">mdi-chevron-right</v-icon>
            </v-btn>
          </v-col>
        </v-row>
        <v-flex xs12></v-flex>

        <v-list v-show="selectedPlaylist === null">
          <v-content v-for="playlist in playListResponse" :key="playlist.id">
            <v-list-item
              class="youtube-list"
              link
              @click="getPlaylistItems(playlist.id, playlist.snippet.title, 0)"
            >
              <v-img class="list-thumbnail" :src="playlist.snippet.thumbnails.default.url"></v-img>
              <v-list-item-title class="text-left" v-text="playlist.snippet.title" />
              <v-list-item-subtitle
                class="text-right pr-5"
              >{{playlist.contentDetails.itemCount}} videos</v-list-item-subtitle>
            </v-list-item>
            <v-flex xs12>
              <v-divider></v-divider>
            </v-flex>
          </v-content>
        </v-list>
        <v-list v-show="selectedPlaylist != null">
          <v-content v-for="video in selectedPlaylist" :key="video.id">
            <v-list-item
              @click="selectVideo(video)"
              :class="{ 'selected-video': videoIsSelected(video.snippet.title)}"
              class="youtube-list"
              link
            >
              <v-img class="list-thumbnail" :src="video.snippet.thumbnails.default.url"></v-img>
              <v-list-item-title class="text-left" v-text="video.snippet.title" />
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
let gapi = window.gapi;
export default {
  name: "YoutubePlaylist",
  data: () => ({
    clientID:
      "654997631255-2ignqehv66hs230niat1sa0trsco1su4.apps.googleusercontent.com",
    apiKey: "AIzaSyDb4Yx_h1Hf8u5HvHPm25sFI5O-K6rUtSY",
    discovery: "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest",
    playListResponse: null,
    isSignedIn: false,
    isLoggingIn: false,
    retreivingPlaylists: false,
    selectedChannel: null,
    sortOptions: [
      { text: "Video Count", active: true },
      { text: "Alpabetical", active: false }
    ],
    retreivingPlaylistItems: false,
    selectedPlaylist: null,
    selectedPlaylistName: null,
    selectedPlaylistPage: {},
    selectedVideos: []
  }),
  methods: {
    triggerSignIn() {
      let self = this;
      self.isLoggingIn = true;
      window.gapi.load(
        "client:auth2",
        gapi.auth2.init({ client_id: this.clientID })
      );
      self.authenticateUserAccount();
    },
    authenticateUserAccount() {
      let self = this;

      gapi.auth2
        .getAuthInstance()
        .signIn({ scope: "https://www.googleapis.com/auth/youtube.readonly" })
        .then(
          function() {
            self.loadClient();
          },
          function(err) {
            alert("Error signing in", err);
          }
        );
    },
    loadClient() {
      let self = this;
      gapi.client.setApiKey(this.apiKey);
      return gapi.client
        .load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
        .then(
          function() {
            self.getPlaylists();
          },
          function(err) {
            alert("Error loading GAPI client for API", err);
          }
        );
    },
    getPlaylists() {
      let self = this;
      self.retreivingPlaylists = true;
      return gapi.client.youtube.playlists
        .list({
          part: "snippet,contentDetails",
          maxResults: 25,
          mine: true
        })
        .then(
          function(response) {
            // Handle the results here (response.result has the parsed body).
            self.playListResponse = response.result.items;
            self.selectedChannel =
              response.result.items[0].snippet.channelTitle;
            self.sortPlaylists(self.sortOptions[0]);
            self.isLoggingIn = false;
            self.isSignedIn = true;
            self.$store.commit("setYoutubeSignedIn", true);
            self.retreivingPlaylists = false;
          },
          function(err) {
            alert("Failed to get playlists - ", err);
          }
        );
    },
    sortPlaylists(selectedSort) {
      this.sortOptions.forEach(elem => {
        elem.active = false;
      });
      selectedSort.active = true;
      switch (selectedSort.text) {
        case "Video Count":
          this.playListResponse.sort(function(a, b) {
            return b.contentDetails.itemCount - a.contentDetails.itemCount;
          });
          break;
        case "Alphabetical":
          this.playListResponse.sort(function(a, b) {
            if (b.snippet.title > a.snippet.title) {
              return -1;
            } else if (b.snippet.title < a.snippet.title) {
              return 1;
            } else {
              return 0;
            }
          });
          break;
      }
    },
    getPlaylistItems(selectedPlaylistID, playlistName, mode) {
      let self = this;
      self.selectedPlaylistName = playlistName;
      self.retreivingPlaylistItems = true;
      let reqObject = {
        part: "snippet, contentDetails",
        playlistId: selectedPlaylistID,
        maxResults: 5
      };
      if (
        mode === 1 &&
        self.selectedPlaylistPage.prevPage != undefined &&
        self.selectedPlaylistPage.prevPage != null
      ) {
        reqObject = {
          part: "snippet, contentDetails",
          playlistId: selectedPlaylistID,
          maxResults: 5,
          pageToken: self.selectedPlaylistPage["prevPage"]
        };
      } else if (
        mode === 2 &&
        self.selectedPlaylistPage.nextPage != undefined &&
        self.selectedPlaylistPage.nextPage != null
      ) {
        reqObject = {
          part: "snippet, contentDetails",
          playlistId: selectedPlaylistID,
          maxResults: 5,
          pageToken: self.selectedPlaylistPage["nextPage"]
        };
      }
      return gapi.client.youtube.playlistItems.list(reqObject).then(
        function(response) {
          // Handle the results here (response.result has the parsed body).
          self.selectedPlaylist = response.result.items;
          self.selectedPlaylistPage = {};
          if (
            response.result.prevPageToken != undefined &&
            response.result.prevPageToken != null
          ) {
            self.selectedPlaylistPage["prevPage"] =
              response.result.prevPageToken;
          }
          if (
            response.result.nextPageToken != undefined &&
            response.result.nextPageToken != null
          ) {
            self.selectedPlaylistPage["nextPage"] =
              response.result.nextPageToken;
          }
          self.retreivingPlaylistItems = false;
        },
        function(err) {
          alert("Failed to get playlist videos", err);
        }
      );
    },
    selectVideo(video) {
      if (!this.selectedVideos.includes(video.snippet.title)) {
        this.selectedVideos.push(video.snippet.title);
        this.$store.commit("addSong", video);
      } else {
        this.selectedVideos.splice(
          this.selectedVideos.indexOf(video.snippet.title),
          1
        );
        this.$store.commit("removeSong", video.snippet.title);
      }
    },
    videoIsSelected(title) {
      return this.selectedVideos.includes(title);
    }
  },
  componentDidMount: () => {
    // let self = this;
    // window.gapi.load("client:auth2", function() {
    //   window.gapi.auth2.init({
    //     client_id: self.clientID
    //   });
    // });
  }
};
</script>

<style>
.youtube-list {
  height: 101px;
  padding-top: 16px;
  padding-bottom: 16px;
  font-family: "Roboto", sans-serif;
  font-size: 24px;
  color: #0d0d0d;
  background-color: #fff;
  font-weight: 500;
}

.loadSpin {
  -webkit-animation: spin 2500ms infinite linear;
  animation: spin 2500ms infinite linear;
}

.selected-video {
  background-color: skyblue;
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