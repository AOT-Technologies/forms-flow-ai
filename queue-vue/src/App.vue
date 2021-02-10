<template>
  <div id="app">
    <div>
       <b-navbar>
        <b-navbar-brand tag="h1" class="mb-0">
          <router-link to="/tasklist">Tasklist</router-link>
        </b-navbar-brand>
         <button variant="outline-primary" @click="keycloak.logout()">Logout</button>
      </b-navbar>
    </div>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'app',
  props: ["keycloak"],
};
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
