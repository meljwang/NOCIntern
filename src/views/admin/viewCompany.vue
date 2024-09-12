<script>
import { getFirestore, collection, doc, getDoc,getDocs, updateDoc} from "firebase/firestore";
import firebaseApp from "@/firebase";
import BackButton from '@/components/backButton.vue'; 
import locationIcon from '@/assets/location.png';
import companyIcon from '@/assets/fling.jpeg';
import '@fortawesome/fontawesome-free/css/all.css';
import briefIcon from '../../assets/briefcase.png';

const db = getFirestore(firebaseApp);

export default {
  name: 'viewCompany',
  components: {
    BackButton
  },
  data() {
    return {
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
	  companyPOCemail: '',
	  companypocName: '',
	  companyEmail: ''
    };
  },
  
  methods: {
    async acceptCompany() {
      const companyID  =  this.$route.params.companyId
      if (confirm("Are you sure you want to accept this company?")) {
        const docRef = doc(db, "companies", companyID);

        await updateDoc(docRef, {
          approved: "accepted"
        });
        window.location.reload()
      } else {
        console.log("acceptance cancelled")
      }
    },
    async rejectCompany() {
      const companyID  =  this.$route.params.companyId
      if (confirm("Are you sure you want to reject this company?")) {
        const docRef = doc(db, "companies", companyID);

        await updateDoc(docRef, {
          approved: "rejected"
        });
        window.location.reload()
      } else {
        console.log("rejection cancelled")
      }
    },
    initMap() {
      // Ensure the latitude and longitude are set
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

            // Now that we have latitude and longitude, call initMap
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
	async getAllJobsForCompany(companyID) {
    try {
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

	async fetchCompanyData(companyID) {
      try {
        const docRef = doc(db, "companies", companyID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          this.companyData = docSnap.data();
		  console.log(this.companyData)
		  this.companyName = this.companyData.name
		  this.companyRating = this.companyData.rating
		  this.companyDesc = this.companyData.description
		  this.companyLoc = this.companyData.location
		  this.companyAddress = this.companyData.address
		  this.companyPOCemail = this.companyData.pocEmail
		  this.companypocName = this.companyData.pocName
		  this.companyEmail = this.companyData.email


      this.fetchGeocodeAndInitMap();
		  console.log(this.companyData)
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    },

    async getAllReviewsForCompany(companyID) {
    try {
      const jobsRef = collection(db, "companies", companyID, "reviews");
      const querySnapshot = await getDocs(jobsRef);
      if (!querySnapshot.empty) {
        const reviewsArray = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        this.reviewsArray = reviewsArray;
		console.log(this.reviewsArray )
      } else {
        console.log("No jobs found.");
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  },
  
	
  },
  mounted() {
  const companyID  =  this.$route.params.companyId
	this.fetchCompanyData(companyID);
	this.getAllJobsForCompany(companyID);
  this.getAllReviewsForCompany(companyID);
  },
}
</script>


<template>
	<div id = "container-companyDetails">
		<BackButton @back="handleBack" /> <br>
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
					<span v-for="star in 5" :key="star" class="star" 
  :class="{
    'fas fa-star': star <= parseFloat(this.companyRating), 
    'fas fa-star-half-alt': star > parseFloat(this.companyRating) && star < parseFloat(this.companyRating) + 1, 
    'far fa-star': star > parseFloat(this.companyRating)
  }">
</span>
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
<br>
<br>
  <div id="view-companies-info-container">
    <span id="view-companies-email-header">Company Email</span>
    <div id="view-companies-email">
      <span id="view-companies-email-text">{{ companyEmail }}</span> <!-- Removed 'this.' because it's not needed inside the template -->
    </div>
  </div>
  <br><br>
  <div id="view-companies-info-container">
    <span id="view-companies-email-header">Point of Contact</span>
    <div id="view-companies-email">
      <span id="view-companies-email-text">{{ companypocName }}</span> <!-- Removed 'this.' because it's not needed inside the template -->
    </div>
</div>

<br><br>
  <div id="view-companies-info-container">
    <span id="view-companies-email-header">Point of Contact Email</span>
    <div id="view-companies-email">
      <span id="view-companies-email-text">{{ companyPOCemail }}</span> <!-- Removed 'this.' because it's not needed inside the template -->
    </div>
</div>

<br>

<div class="button-container" v-if="this.companyData.approved == 'pending'">
  <button class="styled-button" @click="acceptCompany">Accept</button>
  <button class="styled-button-cancel" @click='rejectCompany'>Reject</button>
</div>


</div>

</template>



<style>
#view-companies-email-text {
	color: black;
	font-weight: 800;
}
#view-companies-info-container {
	display: flex;
	flex-direction: column;
}
#view-companies-email {
  display: flex; 
  align-items: center; 
  background-color: rgb(255, 255, 255); 
  padding: 8px 16px; 
  border-radius: 20px; 
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); 
  font-family: "Poppins"; 
  font-size: 19px; 
  border: 1px solid #ddd; 
  margin-top: 0px;
  height: 50px;
  width: 500px; 
}

#view-companies-email-header {
  white-space: nowrap;
  color: #01889F;
  font-size: 25px;
  font-family: "Poppins";
}

</style>