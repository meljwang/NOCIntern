<script setup>
import TheHeader from "./components/TheHeader.vue";
</script>

<template>
  <TheHeader />
  <div class="content">
    <router-view />
  </div>
</template>

<script>
import UserTypeSelection from './views/UserTypeSelection.vue';

export default {
  name: 'App',
  components: {
    UserTypeSelection
  }
}
</script>

<style>
html, body, #app {
  margin: 0;
  padding: 0;
  width: 100%; 
  height: 100%;
}

</style>