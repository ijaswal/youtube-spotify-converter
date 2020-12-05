<template>
  <div id="app">
    <v-app>
      <v-card :elevation="5" class="mx-auto mt-12" width="90%">
        <v-container fluid>
          <v-tabs fixed-tabs>
            <v-tabs-slider></v-tabs-slider>
            <v-tab v-for="tab of tabs" :key="tab.name" :to="tab.route" class="primary--text">
              <v-icon>{{tab.icon}}</v-icon>
            </v-tab>
            <v-tab-item v-for="tab of tabs" :key="tab.name" :value="tab.route">
              <router-view></router-view>
            </v-tab-item>
          </v-tabs>
        </v-container>
      </v-card>
    </v-app>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeTab: "/",
      tabs: [
        {
          name: "Home",
          icon: "mdi-account-box",
          route: "/"
        },
        {
          name: "Work Experience",
          icon: "fas fa-briefcase",
          route: "/experience"
        },
        {
          name: "Playlist Converter",
          icon: "fas fa-exchange-alt",
          route: "/converter"
        },
        {
          name: "Contact Me",
          icon: "mdi-phone",
          route: "/contact"
        }
      ]
    };
  }
};
</script>


<style lang="scss">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background-image: url("./assets/interlaced.png");
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
