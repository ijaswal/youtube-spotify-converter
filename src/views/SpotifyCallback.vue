<template>
  <h1>401 Not Authorized</h1>
</template>
<script>
export default {
  name: "spotify",
  data: () => ({
    redirectParams: null
  }),
  methods: {
    getUrlVars() {
      var vars = {};
      window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(
        m,
        key,
        value
      ) {
        vars[key] = value;
      });
      console.log(JSON.stringify(vars));
      this.redirectParams = vars;
    }
  },
  created: function() {
    console.log("created");
    this.getUrlVars();
    console.log(this.redirectParams);
    console.log("params");
    this.$store.commit("setSpotifyToken", "Test");
    // window.close();
  }
};
</script>