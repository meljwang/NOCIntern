<script>
import firebaseApp from '../../firebase.js';
import { getFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import BackButton from '@/components/backButton.vue';
import userIcon from '@/assets/user.png';


const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
var currentUser = null;

export default {
  name: 'ViewApplications',
  components: {
    BackButton
  },
  data() {
    return {
      applications: [],
      job: [],
      authUser: '',
      currentTab: 'confirmed',
    }
  },
  computed: {
    confirmedApplications() {
    console.log('Before filtering:', this.applications.map(app => typeof app.status));      return this.applications.filter(app => app.status === "confirmed");
    },
    pendingApplications() {
      return this.applications.filter(app => app.status == "pending");
    },
    offeredApplications() {
      return this.applications.filter(app => app.status == "offered");
    },
    rejectedApplications() {
      return this.applications.filter(app => app.status == "rejected");
    },
    declinedApplications() {
      return this.applications.filter(app => app.status == "declined");
    },
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
    handleBack() {
      this.$router.push('/myListings'); 
    },
    formatDate(timestamp) {
      if (!timestamp) return '';
      const date = timestamp.toDate();
      return date.toLocaleDateString("en-US");
    },
    async fetchApplicantData(companyId, jobId) {
      try {
        const applicationsRef = collection(db, "companies", companyId, "jobs", jobId, "applications");
        const querySnapshot = await getDocs(applicationsRef);
        
        // Fetch all updated profile photo URLs in parallel
        const applicationsWithPhotos = await Promise.all(querySnapshot.docs.map(async (doc) => {
          const applicantData = doc.data();
          applicantData.profilePhotoURL = await this.fetchUpdatedProfilePic(applicantData.email);

          console.log(applicantData)
          return { id: doc.id, ...applicantData};
        }));

        // Update the applications data
        this.applications = applicationsWithPhotos;
      } catch (error) {
        console.error("Failed to fetch applications:", error);
      }
    },
    async fetchJobData(companyId, jobId) {
      try {
        const jobRef = doc(db, "companies", companyId, "jobs", jobId);
        const jobSnap = await getDoc(jobRef);
        if (jobSnap.exists()) {
          this.job = { id: jobSnap.id, ...jobSnap.data() };
        } else {
          console.log("No such job document!");
        }
      } catch (error) {
        console.error("Error fetching job data: ", error);
      }
    },
  },
  async mounted() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      this.authUser = user;
      const companyId = user.email;
      const jobId = this.$route.params.jobId;
      if (jobId) {
        await this.fetchApplicantData(companyId, jobId);
        await this.fetchJobData(companyId, jobId);
      } else {
        console.error("Job ID is undefined.");
      }
    } else {
      this.authUser = null;
    }
  });
},


};
</script>


<template>
  <div id="viewApp-container">
    <div id="backbutton-viewapps">
      <BackButton @back="handleBack" />
    </div>

    <h1 id="viewApp-title">Applicants</h1>
    <br>

    <div class="viewApp-job-title-container">
      <h2 class="viewApp-job-title">{{ job.jobTitle }}</h2>
      <span class="viewApp-date-posted">Date Listed: {{ formatDate(job.dateListed) }}</span>
    </div>

    <!-- Tabs for switching views -->
    <div v-if="confirmedApplications.length > 0 || offeredApplications.length > 0 || pendingApplications.length > 0 || declinedApplications.length > 0 || rejectedApplications.length > 0" class="viewApp-tabs">
      <button class="viewApp-button" :class="{ 'active': currentTab === 'confirmed' }" @click="currentTab = 'confirmed'">Outcomes</button>
      <button class="viewApp-button" :class="{ 'active': currentTab === 'offered' }" @click="currentTab = 'offered'">Offered</button>
      <button class="viewApp-button" :class="{ 'active': currentTab === 'pending' }" @click="currentTab = 'pending'">Pending</button>
    </div>


    <!-- Conditional Rendering for No Applicants -->
    <div v-if="confirmedApplications.length === 0 && pendingApplications.length === 0 && offeredApplications.length === 0 && declinedApplications.length === 0 && rejectedApplications.length === 0" class="viewApp-no-applicants">
      You have no applicants.
    </div>
    <div v-if="currentTab === 'confirmed'">
    <!-- No Outcomes Section -->
    <section v-if="confirmedApplications.length === 0 && declinedApplications.length === 0 && rejectedApplications.length === 0">
      <h2 class="viewApp-sub-header">There are no outcomes.</h2>
    </section>

    <!-- Confirmed Applicants Section -->
    <section v-else-if="confirmedApplications.length > 0">
      <h2 class="viewApp-sub-header">Confirmed interns: {{ confirmedApplications.length }}</h2>
      <div v-for="application in confirmedApplications" :key="application.id" class="viewApp-applicant-card">
        <div class="viewApp-applicant-photo-wrapper">
          <img :src="application.profilePhotoURL"  alt="@/assets/user.png" class="viewApp-applicant-photo">
        </div>
        <div class="viewApp-applicant-details">
          <h3 class="viewApp-applicant-name">{{ application.name }}</h3>
          <p class="viewApp-applicant-applied-on">Applied on: {{ formatDate(application.dateApplied) }}</p>
          <div class="viewApp-applicant-status">
            Status: Confirmed
            <img src="@/assets/confirmed.png" alt="Confirmed" class="viewApp-status-icon">
          </div>
        </div>
        <div>
          <router-link :to="{ name: 'ApplicantDetails', params: { applicantId: application.id, jobId: job.id } }" class="viewApp-view-applicant-link">
            View Applicant
          </router-link>
        </div>
      </div>
    </section>

    <!-- Declined Section -->
    <section v-if="declinedApplications.length > 0">
      <hr class="viewApp-section-divider2" v-if="confirmedApplications.length > 0 && declinedApplications.length > 0">
      <h2 class="viewApp-sub-header">Declined offer by student: {{ declinedApplications.length }}</h2>
      <div v-for="application in declinedApplications" :key="application.id" class="viewApp-applicant-card">
        <div class="viewApp-applicant-photo-wrapper">
          <img :src="application.profilePhotoURL" alt="Applicant Photo" class="viewApp-applicant-photo">
        </div>
        <div class="viewApp-applicant-details">
          <h3 class="viewApp-applicant-name">{{ application.name }}</h3>
          <p class="viewApp-applicant-applied-on">Applied on: {{ formatDate(application.dateApplied) }}</p>
          <p class="viewApp-applicant-status">Status: Declined</p>
        </div>
        <div>
          <router-link :to="{ name: 'ApplicantDetails', params: { applicantId: application.id, jobId: job.id } }" class="viewApp-view-applicant-link">
            View Applicant
          </router-link>
        </div>
      </div>
    </section>

    <!-- Rejected Section -->
    <section v-if="rejectedApplications.length > 0">
      <hr class="viewApp-section-divider2" v-if="(confirmedApplications.length > 0 && rejectedApplications.length > 0 && declinedApplications.length === 0) || (declinedApplications.length > 0 && rejectedApplications.length > 0)">
      <h2 class="viewApp-sub-header">Rejected by company: {{ rejectedApplications.length }}</h2>
      <div v-for="application in rejectedApplications" :key="application.id" class="viewApp-applicant-card">
        <div class="viewApp-applicant-photo-wrapper">
          <img :src="application.profilePhotoURL" alt="Applicant Photo" class="viewApp-applicant-photo">
        </div>
        <div class="viewApp-applicant-details">
          <h3 class="viewApp-applicant-name">{{ application.name }}</h3>
          <p class="viewApp-applicant-applied-on">Applied on: {{ formatDate(application.dateApplied) }}</p>
          <p class="viewApp-applicant-status">Status: Rejected</p>
        </div>
        <div>
          <router-link :to="{ name: 'ApplicantDetails', params: { applicantId: application.id, jobId: job.id } }" class="viewApp-view-applicant-link">
            View Applicant
          </router-link>
        </div>
      </div>
    </section>
  </div>

  <div>

<!-- Offered Applicants Section -->
<section v-if="currentTab === 'offered'">
  <!-- Check if there are any offered applications -->
  <div v-if="offeredApplications.length > 0">
    <h2 class="viewApp-sub-header">Offered applicants: {{ offeredApplications.length }}</h2>
    <div v-for="application in offeredApplications" :key="application.id" class="viewApp-applicant-card">
      <div class="viewApp-applicant-photo-wrapper">
        <img :src="application.profilePhotoURL" alt="Applicant Photo" class="viewApp-applicant-photo">
      </div>
      <div class="viewApp-applicant-details">
        <h3 class="viewApp-applicant-name">{{ application.name }}</h3>
        <p class="viewApp-applicant-applied-on">Applied on: {{ formatDate(application.dateApplied) }}</p>
        <p class="viewApp-applicant-status">Status: Offered</p>
      </div>
      <div>
        <router-link :to="{ name: 'ApplicantDetails', params: { applicantId: application.id, jobId: job.id } }" class="viewApp-view-applicant-link">
          View Applicant
        </router-link>
      </div>
    </div>
  </div>
  <!-- Display message if no offered applications are found -->
  <div v-else class="viewApp-no-applicants">
    You have no offered applicants.
  </div>
</section>


    <!-- Pending Applicants Section -->
    <section v-if="currentTab === 'pending'">
      <!-- Check if there are any pending applications -->
      <div v-if="pendingApplications.length > 0">
        <h2 class="viewApp-sub-header">Pending Applications: {{ pendingApplications.length }}</h2>
        <div v-for="application in pendingApplications" :key="application.id" class="viewApp-applicant-card">
          <div class="viewApp-applicant-photo-wrapper">
            <img :src="application.profilePhotoURL" alt="Applicant Photo" class="viewApp-applicant-photo">
          </div>
          <div class="viewApp-applicant-details">
            <h3 class="viewApp-applicant-name">{{ application.name }}</h3>
            <p class="viewApp-applicant-applied-on">Applied on: {{ formatDate(application.dateApplied) }}</p>
            <p class="viewApp-applicant-status">Status: Pending</p>
          </div>
          <div>
            <router-link :to="{ name: 'ApplicantDetails', params: { applicantId: application.id, jobId: job.id } }" class="viewApp-view-applicant-link">
              View Applicant
            </router-link>
          </div>
        </div>
      </div>
      <!-- Display message if no pending applications are found -->
      <div v-else class="viewApp-no-applicants">
        You have no pending applications.
      </div>
    </section>

    </div>
    <br>
  </div>


</template>


<style>
.viewApp-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  padding: 10px;
  font-family: "Poppins", sans-serif; /* Ensuring the font family is consistent */
}

.viewApp-button {
  padding: 10px 20px;
  margin: 0 10px;
  background-color: #ffffff; /* White background for inactive buttons */
  cursor: pointer;
  outline: none;
  transition: background-color 0.1s, color 0.1s;
  font-size: 18px;
  font-weight: 500;
  position: relative; /* Needed for absolute positioning of the divider */
  border: none; /* No borders around buttons */
  color: black;
  font-family: "Poppins";
}

.viewApp-button:not(:last-child)::after {
  content: '|'; /* This creates the divider */
  position: absolute;
  right: -10px; /* Position the divider to the right of the button */
  color: #adb5bd; /* Light shade of gray for the divider */
  font-weight: 1000; /* The weight of the font for the divider */
  font-size: 18px;
  font-weight: 400;
}

.viewApp-button:hover {
  background-color: #e2e6ea; /* Slightly darker gray on hover */
}

.viewApp-button.active {
  color: #ffffff; /* White text for active tab */
  background-color: #01889F; /* Custom teal color */
}

#viewApp-container {
  padding: 30px;
}

#backbutton-viewapps {
  margin: 10px 0 0 10px;
}

#viewApp-title {
    color: #01889F; 
    font-family:"Poppins";
    font-size: 35px; 
    font-weight: bold; 
    margin: 30px 0 0 30px;
}

.viewApp-job-title-container {
    display: flex;
    align-items: center;
    justify-content: space-between; 
}

.viewApp-no-applicants {
    color: black; 
    font-family:"Poppins";
    font-size: 20px;
    font-weight: normal;
    margin: 10px 30px 20px 30px;
}

.viewApp-sub-header {
    color: black; 
    font-family:"Poppins";
    font-size: 20px;
    margin: 10px 30px 20px 30px;
    font-weight: normal;
    text-align: left;

}

.viewApp-job-title {
    color: black; 
    font-family:"Poppins";
    font-size: 25px; 
    font-weight: bold; 
    margin: -5px 30px 10px;
    font-weight: 600;
}

.viewApp-date-posted {
    color: black; 
    font-family:"Poppins";
    font-size: 18px; 
    margin-right: 30px;
    font-weight: normal;
}

.viewApp-back-button {
    font-family:"Poppins";
    display: inline-block;
    padding: 10px 20px;
    background-color: #01889F;
    color: white;
    text-align: center;
    text-decoration: none;
    border-radius: 5px;
    font-weight: bold;
    margin-bottom: 10px;
}
.viewApp-arrow-icon {
  height: 10px;
}

.viewApp-applicant-photo {
  width: 90px; 
  height: 90px; 
  border-radius: 50%;
  margin-right: 10px;
  object-fit: cover;
  overflow: hidden;
}

.viewApp-applicant-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f0f0f0;
  border-radius: 10px;
  padding: 10px;
  margin: 0px 30px 20px 30px;
  height: 100px;
  box-shadow: 0 5px 10px rgba(0,0,0,0.2); 
}

.viewApp-applicant-photo-wrapper {
  flex-shrink: 0;
  width: 90px; 
  height: 90px; 
  border-radius: 50%;
  overflow: hidden;
  margin-right: 10px;
  margin-left: 15px;
}

.viewApp-applicant-details {
  flex: auto;
  margin-left: 5px;
  margin: 0px 25px;
}

.viewApp-applicant-name {
  font-family:"Poppins";
  margin: 0;
  font-size: 20px;
  font-weight: 420;
  margin-top: 2px;
  margin-bottom: 2px;
  color: black;
  text-align: left;
}

.viewApp-applicant-applied-on {
  margin: 0;
  font-size: 15px;
  font-family:"Poppins";
  margin-top: 2px;
  margin-bottom: 2px;
  font-weight: normal;
  color:black;
}

.viewApp-applicant-status {
  margin: 0px;
  font-size: 15px;
  font-family: "Poppins";
  margin-top: 2px;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  font-weight: normal;
  color:black;
}

.viewApp-view-applicant-link {
  font-family: "Poppins";
  margin-left: auto; 
  padding: 8px 20px;
  background: #01889F;
  color: white; 
  text-decoration: none; 
  border-radius: 5px; 
  font-size: 15px; 
  margin-right: 15px;
  font-weight: normal;
  transition: background-color 0.1s, color 0.1s;
}

.viewApp-view-applicant-link:hover {
  background-color:#006c7f;
}

.viewApp-status-icon {
  width: 23px; 
  height: auto;
  vertical-align: middle;
  margin-left: 8px;
}

.viewApp-section-divider {
  border: none;
  height: 1px;
  width: 95%;
  background-color: black; 
  margin-top: 40px; 
  margin-bottom: 30px;
}

.viewApp-section-divider2 {
  border: none;
  height: 0.5px;
  width: 95%;
  background-color: black; 
  margin-top: 40px; 
  margin-bottom: 30px;
}
</style>