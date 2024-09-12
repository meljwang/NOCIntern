<script>
import { getFirestore, collection, doc, getDoc,getDocs } from "firebase/firestore";
import firebaseApp from "@/firebase";
import BackButton from '@/components/backButton.vue'; 
import locationIcon from '@/assets/location.png';
import companyIcon from '@/assets/fling.jpeg';
import '@fortawesome/fontawesome-free/css/all.css';
import briefIcon from '../../assets/briefcase.png';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
var currentUser = null;

export default {
  name: 'CompanyDetails',
  components: {
    BackButton
  },
  data() {
    return {
      companyID: '',
      companyData: '',
      companyName: '',
      companyRating: '',
      companyDesc: '',
      companyLoc: '',
      companyJobsAvail: '',
      jobsArray: [],
      companyAddress:'',
      latitude: '',
      longitude: '',
      reviewsArray: [],
	  companyIcon: companyIcon,
	  locationIcon: locationIcon,
	  briefIcon: briefIcon,
    authUser: '',
    };
  },
  
  methods: {
    async fetchUpdatedProfilePic(studentID) {
  try {
    const studentRef = doc(db, "students", studentID);
    const studentSnapshot = await getDoc(studentRef);

    if (!studentSnapshot.exists()) {
      return null;
    }

    const profilePhotoURL = studentSnapshot.data().profilePhotoURL;
    if (!profilePhotoURL) {
      return null;
    }
    return profilePhotoURL;
  } catch (error) {
    return null;
  }
},
    goToJobListing(jobId) {
      const companyId = this.$route.params.companyId
      this.$router.push({ name: 'JobListing', params: { companyId, jobId } });
    },

    initMap() {
      if (this.latitude && this.longitude) {
        const center = { lat: this.latitude, lng: this.longitude };
        const map = new google.maps.Map(document.getElementById('map'), {
          zoom: 4,
          center: center,
        });
        new google.maps.Marker({
          position: center,
          map: map,
          title: 'Company location',
        });
      }
    },

    fetchGeocodeAndInitMap() {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      console.log(import.meta.env.VITE_GOOGLE_MAPS_API_KEY)
      fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(this.companyAddress)}&key=${apiKey}`)
        .then(response => response.json())
        .then(data => {
          if (data.status === 'OK') {
            this.latitude = data.results[0].geometry.location.lat;
            this.longitude = data.results[0].geometry.location.lng;

            console.log("long :" + this.longitude)
            console.log("lat :" + this.latitude)

            this.initMap();
          } else {
            console.log('Geocode was not successful for the following reason: ' + data.status);
          }
        })
        .catch(error => console.error('Error:', error));
    },
	handleBack() {
		this.$router.go(-1);
    },
	async getAllJobsForCompany() {
    try {
      const companyID  =  this.$route.params.companyId
      const jobsRef = collection(db, "companies", companyID, "jobs");
      const querySnapshot = await getDocs(jobsRef);
      if (!querySnapshot.empty) {
        const jobsArray = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        this.jobsArray = jobsArray;
		console.log(this.jobsArray )
      } else {
        console.log("No jobs found.");
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  },
  timeSince(timestamp) {
    const date = timestamp.toDate(); // Convert Firestore Timestamp to JavaScript Date
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;

    if (interval > 1) {
      return Math.floor(interval) + " years ago";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + " months ago";
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + " days ago";
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + " hours ago";
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + " minutes ago";
    }
    return Math.floor(seconds) + " seconds ago";
  },
	async fetchCompanyData() {
      try {
        const companyID  =  this.$route.params.companyId
        const docRef = doc(db, "companies", companyID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          this.companyData = docSnap.data();
		  this.companyName = this.companyData.name
		  this.companyRating = this.companyData.rating
		  this.companyDesc = this.companyData.description
		  this.companyLoc = this.companyData.location
      this.companyAddress = this.companyData.address

      this.fetchGeocodeAndInitMap();
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    },

    async getAllReviewsForCompany() {
    try {
        const companyID = this.$route.params.companyId;
        const reviewsRef = collection(db, "companies", companyID, "reviews");
        const querySnapshot = await getDocs(reviewsRef);

        if (!querySnapshot.empty) {
            const reviewsWithPhotos = await Promise.all(querySnapshot.docs.map(async (doc) => {
                const reviewData = doc.data();
                console.log(reviewData)
                if (reviewData.studentEmail) {  // Assuming email is stored directly in review data
                    const photoURL = await this.fetchUpdatedProfilePic(reviewData.studentEmail);
                    reviewData.profilePhotoURL = photoURL;
                }
                return {
                    id: doc.id,
                    ...reviewData
                };
            }));

            this.reviewsArray = reviewsWithPhotos;
        } else {
            console.log("No reviews found.");
        }
    } catch (error) {
        console.error("Error fetching reviews:", error);
    }
}

  
	
  },
  mounted() {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          currentUser= user;
          this.authUser = user;
          console.log(user.email)
        } else {
          // User is signed out
          this.authUser = null;
        }
      }
    )
	this.fetchCompanyData();
	this.getAllJobsForCompany();
  this.getAllReviewsForCompany();
  },
}
</script>


<template>
	<div id = "container-companyDetails">
    <div id="companyDetails-backbutton">
		<BackButton @back="handleBack" /> 
  </div><br>
		<div id = "companycard">
			<div id = "inner-companycard">
        <img 
          :src="this.companyData.profilePhotoURL" 
          alt="Company Logo" 
          class="company-icon-card"
        />
			<div>
				<div id="company-rating-companydetail">
				<span id="company-name-card">{{this.companyName}}</span>
				<div class="star-container">
          <div v-if="parseFloat(this.companyRating) > 0">
  <span v-for="star in 5" :key="star" class="star" 
    :class="{
      'fas fa-star': star <= parseFloat(this.companyRating), 
      'fas fa-star-half-alt': star > parseFloat(this.companyRating) && star < parseFloat(this.companyRating) + 1, 
      'far fa-star': star > parseFloat(this.companyRating)
    }">
  </span>
</div>

				</div>
			</div>
				<span id="text-companycard">{{this.companyDesc}}</span>


				<div class="location-companycard">
      <img :src="locationIcon" alt="Location" class="location-icon-company-detail" />
      <span id="span">{{ this.companyLoc }}</span>
	</div>

	<div class="location-companycard">
      <img :src="briefIcon" alt="Location" class="location-icon-company-detail" />
      <span id="span">{{ this.jobsArray.length }}</span>
	</div>


			</div>
		</div>
		</div>
    <br><br>
    <div id="map" style="height: 300px;"></div>
    <div id="exact-location"> 
      <img :src="locationIcon" alt="Location" class="location-icon-company-detail" />
      <span id="span">{{ this.companyAddress }}</span>
    </div>


    <div id="job-openings-companyDetails">
    <h2 class="header-companyDetails">Job Openings</h2>
    <template v-if="this.jobsArray.length == 0">
      <div id="companyDetails-div-reviews">
        <span id="companyDetails-h6">There are currently no job openings available</span>
      </div>
</template>

</div>
  <div class="card-container-companyDetails">
    <div 
      v-for="job in jobsArray" 
      :key="job.id" 
      class="card-companyDetails" 
      @click="goToJobListing(job.id)"
    >
      <h3 class="job-title-companyDetails">{{ job.jobTitle }}</h3>
      <ul class="skills-companyDetails">
        <li v-for="skill in job.skills" :key="skill">{{ skill }}</li>
      </ul>
      <div class="card-footer-companyDetails">
        <p>Listed {{ timeSince(job.dateListed) }}</p>
      </div>
    </div>
  </div>

    <h2 class="header-companyDetails">Reviews</h2>
    <div id="reviews-container-companyDetails" >
      <div id="starrating">
        <div v-if="parseFloat(this.companyRating) > 0">
  <span v-for="star in 5" :key="star" class="star-reviews" 
    :class="{
      'fas fa-star': star <= parseFloat(this.companyRating), 
      'fas fa-star-half-alt': star > parseFloat(this.companyRating) && star < parseFloat(this.companyRating) + 1, 
      'far fa-star': star > parseFloat(this.companyRating)
    }">
  </span>
</div>

<br>
<div id="companyDetails-div-reviews">

  <template v-if="this.reviewsArray.length == 0">
  <span id="companyDetails-h5">There are currently no reviews</span>
</template>

<template v-if="this.reviewsArray.length > 0">
  <span id="companyDetails-h4">{{ this.reviewsArray.length }} reviews</span>
</template>

<template v-if="this.reviewsArray.length > 0">
  <span id="companyDetails-h4">{{ this.companyName }} has an average of {{ this.companyRating }}/5.0 ratings</span>
</template>
</div>

  </div>
  <template v-if="this.reviewsArray.length > 0">
  <hr class="companyDetails-section-divider">
</template>
  <div class="companyDetails-student-review">
    <div v-for="review in reviewsArray" :key="review.id" class="companyDetails-review-card">
      <div class="companyDetails-review-header">
        <img :src="review.profilePhotoURL" alt="Profile Photo" class="companyDetails-review-profile-photo"/>
        <div class="companyDetails-review-info">
          <h3 class="companyDetails-reviewer-name">{{ review.nameStudent }}</h3>
          <div class="companyDetails-reviewer-job">
          <h4 class="companyDetails-reviewer-jobTitle">{{ review.jobRole }}</h4>
          <h4 class="companyDetails-reviewer-jobPeriod">Posted: {{ timeSince(review.dateReview) }}</h4>
        </div>
        
          <div class="companyDetails-stars">
          <span v-for="star in 5" :key="star" class="companyDetails-indiv-star-reviews" 
          :class="{
            'fas fa-star': star <= parseFloat(review.rating), 
            'fas fa-star-half-alt': star > parseFloat(review.rating) && star < parseFloat(review.rating) + 1, 
            'far fa-star': star > parseFloat(review.rating)
          }"></span>
        </div>
        <p class="companyDetails-review-text">{{ review.testimonial }}</p>
        
        
        
      </div>
      
        </div>
      </div>


</div>
</div>
<br>


			
	</div>
</template>


<style>
#exact-location {
  margin-top: 15px;
  margin-left: 5px;
}

#exact-location span {
  font-family: "Poppins";
  font-weight: 400;
  font-size: 15px;
}

#starrating {
  margin-left: 500px;
  margin-top: 10px;
}
#companyDetails-backbutton {
  margin-left: -10px;
  margin-bottom: 10px;
}
#companyDetails-div-reviews {
  display: flex; 
  align-items: center; 
  flex-direction: column;

}
#companyDetails-h4 {
  font-family: "Poppins";
  font-weight: 500;
  color: #000;
}
#companyDetails-h5 {
  font-family: "Poppins";
  font-weight: 500;
  color: #000;
  font-size: 18px;
  margin-left: -725px;
  margin-top: -15px;
}

#companyDetails-h6 {
  font-family: "Poppins";
  font-weight: 500;
  color: #000;
  font-size: 18px;
  margin-top: 20px;
  margin-bottom: 15px;
  align-self: flex-start;

}


#reviews-container-companyDetails {
  display: flex; 
  align-items: flex-start; 
  flex-direction: column;
}
#map {
  width: 100%;
  max-width: 1400px;
  border-radius: 10px;
  border:#000;
  box-shadow: 0 5px 8px rgba(0, 0, 0, 0.2);
  border: 1px solid #979797;
}
#container-companyDetails {
  padding: 30px;
  text-align: left;
  margin: 10px 30px 20px 30px;
  
}

#companycard {
  background-color: #fff;
  border-radius: 30px;
  box-shadow: 0 5px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: start;
  width: 100%;
  max-width: 1400px;
  min-height: 225px;
  height: auto;
  border: 1px solid #979797;
}

#inner-companycard {
  padding: 30px;
  display: flex;
  align-items: center;
}

.company-icon-card {
  width: 150px;
  height: 150px;
  border-radius: 10%;
  object-fit: cover;
  margin-right: 30px;
  margin-left: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #979797;
}

#company-rating-companydetail {
  display: flex;
  align-items: center; 
  justify-content: start; 
}

.star-container {
  display: flex;
  margin-left: 15px; 
}

.star {
  color: #ccc; 
  margin-right: 4px; 
  font-size: 25px;
}
.fas.fa-star {
  color: #f5d130; 
}
#company-name-card {
	font-family: "Poppins";
	font-size: 30px;
	color: #01889F;
}
#text-companycard{
	color: black;
	font-weight: 300;
	font-family: "Poppins";
	font-size: 15px;
}
.location-icon-company-detail {
  height: 15px; 
  width: auto;
  margin-right: 5px;
}
.location-companycard {
	margin-top: 10px;
	display: flex;
  color: black;
  opacity: 0.6;
}

.header-companyDetails {
  text-align: left;
  font-size: 30px;
}

.card-container-companyDetails {
    display: flex;
    justify-content:left;
    flex-wrap: wrap;
    padding: 0;

  }

  .job-title-companyDetails {
    color:black;
    text-align: left;
    font-size: 15px;
    font-weight: 500;
    margin-bottom: 10px;
  }

  .card-companyDetails {
  background: white;
  border: 1px solid #979797;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  margin: 10px 20px 10px 0px;
  padding: 20px;
  padding-bottom: 60px; /* Add padding to accommodate the footer */
  width: 300px;
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column; /* Stack children vertically */
  transition: transform 0.1s ease, box-shadow 0.1s ease;
  cursor: pointer;
}

.card-companyDetails:hover {
  transform: translateY(-5px); /* Lifts the card up on hover */
  box-shadow: 0 4px 10px rgba(0,0,0,0.3); /* Enhances shadow to give depth */
}

  .card-companyDetails p {
    color: #666;
    margin: 0;
    font-size: 14px;
  }

.card-footer-companyDetails {
  background-color: #f6f4f4; /* Light grey background */
  text-align: right; 
  padding: 10px; /* Add some padding */
  position: absolute; 
  bottom: 0;
  left: 0;
  right: 0;
  border-radius: 0px 0px 10px 10px;
}

.card-footer-companyDetails p {
  font-weight: normal;
  font-family: "Poppins";
  font-size: 12px;
  color: rgba(0, 0, 0, 0.35);
  padding: 0;
}

.skills-companyDetails {
  list-style: none;
  padding: 0;
  margin: 5px 0; /* Adjusted for spacing */
  display: flex; /* Keep the inline behavior */
  flex-wrap: wrap; /* Allow items to wrap */
  gap: 8px; /* Maintain spacing between items */
}


.skills-companyDetails li {
  background: rgba(1, 136, 159, 0.29);
  border-radius: 15px;
  padding: 5px 15px;
  font-size: 14px;
  color: black;
  font-weight: normal;
  font-family: "Poppins";
  margin-bottom: 5px; /* Add space below each skill for wrapping */
}
.star-reviews {
  color: #ccc; /* Default empty star color */
  margin-right: 4px; /* Adds space between the stars */
  font-size: 50px;
  display: inline-block;
}


.companyDetails-indiv-star-reviews {
  color: #ccc; 
  margin-right: 4px; 
  font-size: 20px;
  display: inline-block;
}

.companyDetails-review-card {
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
  background-color: #f0f0f0;
  width: 100%; 
  max-width: 1200px;
  align-items: left;
}

.companyDetails-review-header {
  display: flex;
  align-items: center;
}

.companyDetails-review-profile-photo {
  width: 120px; 
  height: 120px; 
  border-radius: 50%;
  margin-right: 20px;
  margin-left: 20px;
  object-fit: cover;
}

.companyDetails-stars {
  display: inline-flex;
}

.companyDetails-star {
  color: #ffd700;
}

.companyDetails-review-date {
  font-family: "Poppins";
  font-weight: normal;
  color: black;
  font-size: 15px;
}

.companyDetails-review-text {
  font-size: 0.9rem;
  line-height: 1.5;
  color: #333;
}

.companyDetails-reviewer-name {
  color: black;
  font: "Poppins";
  font-weight: normal;
  margin-top: 10px;
  margin-bottom: 0px;
}

.companyDetails-section-divider {
  border: none;
  height: 1px;
  background-color: #e0e0e0;
  margin-top: 40px;
  margin-bottom: 30px;
  width: 1000px;
  margin-left: 100px;
  align-items: flex-start;
}

.companyDetails-student-review {
 display:flex;
 align-items: flex-start;
 flex-direction: column;
 width: 100%;
 margin-left: 10px;
}

.companyDetails-review-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.companyDetails-reviewer-job {
  font-size: 15px;
  margin-top: 10px;
  margin-bottom: 8px;
}

.companyDetails-reviewer-jobTitle , .companyDetails-reviewer-jobPeriod  {
  font-family: "Poppins";
  color: black;
  font-weight: normal;
  font-size: 15px;  
  margin-top: 0;
  margin-bottom: 0;
}

.companyDetails-review-text {
  font-family: "Poppins";
  color: black;
  font-weight: normal;
  font-size: 15px;  
  margin-top: 8px;
}


</style>