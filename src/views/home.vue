<script>
import HomeFeaturesCard from "../components/HomeFeaturesCard.vue";
import ImageCarousel from "../components/ImageCarousel.vue";
import Bottom from "../components/Bottom.vue";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import firebaseApp from '../firebase.js';
const auth = getAuth(firebaseApp);
export default {
    data() {
    return {
      authUser: false,
    };
  },
	name: "Home",
    components: {HomeFeaturesCard, ImageCarousel, Bottom},
    mounted() {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.authUser = user;
        } else {
          // User is signed out
          this.authUser = null;
        }
      }
      )
    },
}
</script>

<template>
    <div class="image-container">
        <img src="../assets/NOC_Cover_Picture.jpg" alt="NOC Students">
    </div>
    <h2>Explore NOC Locations</h2>
    <h3>Your Internship Awaits</h3>
    <ImageCarousel/>
    <HomeFeaturesCard/>
    <Bottom/>
</template>

<style>
.image-container {
    width: 100%;
    height: auto;
    overflow: hidden;
}

.image-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

h2 {
    font-family:'Poppins';
    text-align: center;
    margin-bottom: 10px;
}

h3 {
    margin-top: 0;
    font-family:'Poppins';
    text-align: center;
    color: grey;
}
</style>