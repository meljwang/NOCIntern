<script>
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import firebaseApp from "@/firebase"; 
import BackButton from '@/components/backButton.vue'; 
import locationIcon from '@/assets/location.png';
import companyIcon from '@/assets/fling.jpeg';

const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
var currentUser = null;

export default {
  name: 'ViewListing',
  components: {
    BackButton
  },
  data() {
    return {
      listingData: null,
      companyData: null,
      locationIcon: locationIcon,
      companyIcon: companyIcon,
      authUser: '',
    };
  },
    mounted() {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        currentUser = user;
        this.authUser = user;

        // Now that authUser is confirmed to exist, fetch the data
        const companyId = this.authUser.email; // Ensure this value exists
        const jobId = this.$route.params.jobId;

        // These functions are now called inside the onAuthStateChanged callback
        this.fetchListingData(companyId, jobId);
        this.fetchCompanyData(companyId);
      } else {
        // User is signed out
        this.authUser = null;
      }
    });
  },

  methods: {
    handleBack() {
      this.$router.push('/myListings'); 
    },
	timeSince(date) {
    const listingDate = new Date(date);
    const now = new Date();
    const secondsPast = (now.getTime() - listingDate.getTime()) / 1000;

    if (secondsPast < 60) { // less than a minute
      return parseInt(secondsPast) + ' seconds';
    }
    if (secondsPast < 3600) { // less than an hour
      return parseInt(secondsPast / 60) + ' minutes';
    }
    if (secondsPast <= 86400) { // less than a day
      return parseInt(secondsPast / 3600) + ' hours';
    }
    if (secondsPast > 86400) { // more than a day
      const days = parseInt(secondsPast / 86400);
      return days > 1 ? days + ' days' : days + ' day';
    }
  },
	formatDate(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString("en-US");
  },
    async fetchListingData(companyId, jobId) {
      try {
        const docRef = doc(db, "companies", companyId, "jobs", jobId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          this.listingData = docSnap.data();
		  this.listingData.dateListed = this.formatDate(this.listingData.dateListed)
		  this.listingData.deadline = this.formatDate(this.listingData.deadline)
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    },
	async fetchCompanyData(companyId) {
      try {
        const docRef = doc(db, "companies", companyId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          this.companyData = docSnap.data();
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    },
	
  }
};
</script>

<template>
	<div id="container-viewListing">
    <div id="viewListing-backbutton">
	<BackButton @back="handleBack" />
</div>
	<h1 id="title-viewListing">Your listing</h1>
	<div v-if="listingData && companyData" class="listing-viewListings">
	<div id="company-viewListing">
    <img 
          :src="this.companyData.profilePhotoURL" 
          alt="Company Logo" 
          class="company-icon-card-viewListing"
        />
	<div id="left-align-viewListing" >
    <h2 id="companyName-viewListing">{{ companyData.name }}</h2>
    <h2 id="jobtitle-viewListing">{{ listingData.jobTitle }}</h2>
	<div id="companybottom-viewListing">
    <h4 id="timeformat-viewListing">{{ timeSince(listingData.dateListed) }} Ago</h4>
    <div class="location-viewListing">
      <img :src="locationIcon" alt="Location" class="location-icon" />
      <span id="span">{{ companyData.location }}</span>
	</div>
	</div>
</div>
</div>
  </div>  
  <br>
	<hr>
	<div v-if="listingData" id="listingInfo-viewListing">
		<h2 class="headersBlue">Job Description</h2>
		<h2 style="white-space: pre-wrap;" class="headers-viewListings">{{ listingData.jobDesc }}</h2>
		<br>

		<h2 class="headersBlue">Qualifications</h2>
		<h2 style="white-space: pre-wrap;" class="headers-viewListings">{{ listingData.jobQuali }}</h2>
		<br>

		<h2 class="headersBlue">What We Offer</h2>
		<h2 style="white-space: pre-wrap;" class="headers-viewListings">{{ listingData.jobOffer }}</h2>
	
	<br>

	<hr>
	<h2 class="headersBlue">Additional Job Details</h2>
	<h2 class="headers-viewListings">Position Type</h2>
	<h2 class="headersGrey">{{ listingData.jobType }}</h2>

	<h2 class="headers-viewListings">Work Term</h2>
	<h2 class="headersGrey">{{ listingData.workTerm }}</h2>

	<h2 class="headers-viewListings">Internship/ Project Function</h2>
	<h2 class="headersGrey">{{ listingData.workTerm }}</h2>

	<h2 class="headers-viewListings">Number of Vacancies</h2>
	<h2 class="headersGrey">{{ listingData.numVacancy }}</h2>

	<h2 class="headers-viewListings">Skills</h2>
	<div v-if="listingData && listingData.skills" class="skills-container">
  <div v-for="(skill, index) in listingData.skills" :key="index" class="skill-tag">
    {{ skill }}
  </div>
</div>
	<br>
	<hr>
	<h2 class="headersBlue">Application Deadline</h2>
	<h2 class="headersGrey">{{ listingData.deadline }}</h2>

  <br>

</div>
<br>

</div>



</template>

<style>
#container-viewListing {
	padding: 30px;
  text-align: left;
  min-width: 1200px;
  margin: 10px 30px 20px 30px;
}
#companyName-viewListing, #jobtitle-viewListing, #timeformat-viewListing {
	margin: 0;
  text-align: left;
  color: black;
  font-size: 20px;
}
#timeformat-viewListing, #companyName-viewListing{
	font-weight: 400;
  text-align: left;
}
.headers-viewListings {
  text-align: left;
  font-weight: 400;
  font-size: 18px;
  margin: 0px;
  color: black;
}
.listing-viewListings h3 {
  font-size: 20px;
  
}
#companybottom-viewListing {
	display: flex;
}
.location-viewListing {
  display: flex;
  color: black;
}
.location-icon {
  height: 24px; 
  width: auto;
  margin-right: 5px;
  margin-left: 20px;
}

#company-viewListing {
	display: flex;
	align-items: center;
}
.company-icon-card-viewListing {
  width: 115px;
  height: 115px;
  border-radius: 10%;
  object-fit: cover;
  margin-right: 30px;
  margin-left: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #979797;
}
#listingInfo-viewListing .headers {
	font-family: 'Poppins';
	font-size: 19px;
	font-weight: 400;
	margin: 0;
  text-align: left;
}

.headersBlue {
	font-family: 'Poppins';
	font-size: 19px;
	font-weight: 700;
	color: #01889F;
	margin: 0;
  text-align: left;
}
.headersGrey {
	font-family: 'Poppins';
	font-size: 19px;
	font-weight: 400;
	color: #898989;
	margin: 0;
	margin-bottom: 5px;
  text-align: left;
}
.skills-container {
  display: flex;
  gap: 10px; 
}

.skill-tag {
  background-color: #01889F;
  border-radius: 10px;
  color: white;
  padding: 10px 20px; 
  text-align: center;
  font-family: 'Poppins';
  font-size: 14px; 
  font-weight: normal; 
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); 
  white-space: nowrap; 
}
#left-align-viewListing {
  text-align: left;
}
#span {
  font-weight: 200;
  color: black;
}
#title-viewListing {
    color: #01889F; 
    font-family:"Poppins";
    font-size: 35px; 
    font-weight: bold;
}

#viewListing-backbutton {
  margin: 5px 0 30px -20px;
}
</style>