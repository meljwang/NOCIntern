<template>
  <router-link :to="`/CompanyDetails/${companyID}`" class="company-tile-link">
    <div id="company-tile">
      <div id="company-content">
        <div id="company-photo-wrapper">
          <img v-if="profilePhotoURL" :src="profilePhotoURL" id="company-profile-pic" alt="Company Logo" />
        </div>
        <div id="company-inform-wrapper">
          <div id="company-name-wrapper"><p id="company-tile-name">{{ name }}</p></div>
          <div id="company-loc-wrapper"><p id="company-tile-location">{{ location }}</p></div>
          <div id="stars-or-no">
            <div v-if="employerRating > 0">
              <span v-for="star in 5" :key="star" class="star" 
              :class="{
                'fas fa-star': star <= parseFloat(employerRating), 
                'fas fa-star-half-alt': star > parseFloat(employerRating) && star < parseFloat(employerRating) + 1, 
                'far fa-star': star > parseFloat(employerRating)
              }">
              </span>
            </div>
            <div v-else class="no-rating">
              No ratings yet
            </div>
          </div>
        </div>
        <div id="other-info">
          <p id="company-num-jobs">{{ noOfJobs }} Job(s) Available</p>
          <p id="company-num-reviews">{{ noOfReviews }} Review(s)</p>   
        </div>  
      </div>
    </div>
  </router-link>
</template>

<script>
import '@fortawesome/fontawesome-free/css/all.css';

export default {
  props: {
    name: String,
    employerRating: Number,
    location: String,
    companyID: String,
    noOfJobs: Number,
    noOfReviews: Number,
    profilePhotoURL: String,
  },
  // Component methods and data...
};
</script>

<style>
#company-tile {
  background: #f5f5f5;
  padding: 10px;
  width: 90%;
  border-radius: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
}

#company-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0px;
  align-items: center;
}

#company-profile-pic {
  border-radius: 10%; /* Circular image */
  object-fit: cover; /* Ensures the image covers the area nicely */
  width:55%;
  height:80%;
  margin-top:15px;
}

#company-photo-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 200px;
  height: 130px;
}

.company-name-wrapper {
  display: flex;
  justify-content: center;
}

#company-tile-name {
  font-weight: bold;
  color: black;
  text-align: center;
  font-family: "Poppins";
  margin-bottom: 0px;
}

.company-loc-wrapper {
  margin-top:0px;
}

#company-tile-location {
  font-weight: normal;
  color: black;
  text-align: center;
  font-family: "Poppins";
  font-size:small;
  margin-top: 0px;
}

.router-link-company {
  color:#016776; 
  text-decoration: none; 
  font-weight: bold;
  font-size: small;
}

.router-link-company:hover {
  text-decoration: underline;
  color: #016776;
}

.no-rating {
  font-family: "Poppins";
  font-size: x-small;
  text-align: center;
  color: lightgrey; /* or any color that fits your design */
  font-style: italic;
  margin-top: 5px; /* Adjust as needed */
}

#stars-or-no {
  justify-content: center;
  display: flex;
  height: 30px;
}

#company-num-jobs {
  font-family: "Poppins";
  font-weight: lighter;
  color: black;
  font-size:x-small;
  margin-bottom:0px;
}

#company-num-reviews {
  font-family: "Poppins";
  font-weight: lighter;
  color: black;
  font-size:x-small;
  margin-top: 0;
}


#company-inform-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

#other-info {
  display: flex;
  flex-direction: column;
  text-align: center;
}

.company-tile-link {
  text-decoration: none;
  color: inherit; 
  display: flex;
}


</style>


