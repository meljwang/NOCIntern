<script>
import firebaseApp from '../../firebase.js';
import { getFirestore, doc, getDoc, getDocs, collection, deleteDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import 'typeface-poppins';

const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
var currentUser = null;

export default {
  name: 'JobListings',
  data() {
    return {
      jobs: [],
      authUser: '',
    };
  },
  methods: {
  formatDate(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString("en-US");
  },
  async fetchJobs(companyId) {
  const jobsRef = collection(db, 'companies', companyId, 'jobs');
  const querySnapshot = await getDocs(jobsRef);
  this.jobs = await Promise.all(querySnapshot.docs.map(async jobDoc => {
    const jobData = {
      id: jobDoc.id,
      ...jobDoc.data(),
      applications: [], // Placeholder for applications
      applicationCounts: { confirmed: 0, offered: 0, pending: 0, declined: 0, rejected: 0 },
    };

    // Format the date immediately after fetching
    if (jobData.dateListed) {
      jobData.formattedDate = this.formatDate(jobData.dateListed);
    }

    // Fetch applications for each job
    const applicationsRef = collection(db, 'companies', companyId, 'jobs', jobDoc.id, "applications");
    const applicationsSnapshot = await getDocs(applicationsRef);
    
    applicationsSnapshot.docs.forEach(appDoc => {
      const appData = appDoc.data();
      jobData.applications.push({
        id: appDoc.id,
        ...appData
      });

      // Tally application statuses
      if (appData.status === "confirmed") {
        jobData.applicationCounts.confirmed += 1;
      } else if (appData.status === "offered") {
        jobData.applicationCounts.offered += 1;
      } else if (appData.status === "pending") {
        jobData.applicationCounts.pending += 1;
      } else if (appData.status === "declined") {
        jobData.applicationCounts.declined += 1;
      } else if (appData.status === "rejected") {
        jobData.applicationCounts.rejected += 1;
      }
    });
    return jobData;
  }));

},

async deleteJob(jobId, companyId) {
  if (confirm("Are you sure you want to delete this job listing?")) {
    try {
      await deleteDoc(doc(db, 'companies', companyId, 'jobs', jobId));
      this.jobs = this.jobs.filter(job => job.id !== jobId); 
      alert("Job listing deleted successfully."); 
    } catch (error) {
      console.error("Error deleting job listing: ", error);
      alert("Failed to delete job listing."); 
    }
  } else {
    console.log("Job deletion canceled.");
  }
},

  },

  async mounted() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      this.currentUser = user;
      this.authUser = user;
      await this.fetchJobs(user.email);
      console.log(user.email)
      await this.fetchJobs(this.authUser.email);
    } else {
      // User is signed out
      this.authUser = null;
    }
  })
  
},
};
</script>


<template>


  <h1 id="myListing-title">My Listings</h1>

  <br>

  <div class="container">

  <div>
      <router-link to="/createJob" class="myListing-create-job-button">
        <img src="@/assets/addJob.png" alt="Create Job Icon" class="myListing-job-icon"> 
        Create new job listing
      </router-link>
  </div>

  <br>

  <div v-for="job in jobs" :key="job.id" class="myListing-job-listing">
      <div class="myListing-job-details">
          <h3 class="myListing-job-title">{{ job.jobTitle }}</h3>
          <p class="myListing-date-listed">Date Listed: {{ formatDate(job.dateListed) }}</p>
      </div>
      <div class="myListing-job-status">        
        <div class="myListing-job-status-pending">
          <div class="myListing-num">
            <p>{{ job.applicationCounts.pending }}</p>
          </div>
          <p>Pending</p>
        </div>
        <div class="myListing-job-status-offered">
          <div class="myListing-num">
            <p>{{ job.applicationCounts.offered }}</p>
          </div>
          <p>Offered</p>
        </div>
        <div class="myListing-job-status-confirmed">
          <div class="myListing-num">
            <p>{{ job.applicationCounts.confirmed }}</p>
          </div>
          <p>Confirmed</p>
        </div>
        <div class="myListing-job-status-confirmed">
          <div class="myListing-num">
            <p>{{ job.applicationCounts.declined }}</p>
          </div>
          <p>Declined</p>
        </div>
        <div class="myListing-job-status-confirmed">
          <div class="myListing-num">
            <p>{{ job.applicationCounts.rejected }}</p>
          </div>
          <p>Rejected</p>
        </div>
      </div>
      <div class="myListing-job-actions">
        <router-link :to="{ name: 'ViewListing', params: { jobId: job.id} }" class="myListing-view-listing myListing-button">View Listing</router-link>
        <router-link :to="{ name: 'ViewApplicants', params: { jobId: job.id } }" class="myListing-view-applicants myListing-button">View Applicants</router-link>
      </div>
      <div class="myListing-delete-action">
        <button @click="deleteJob(job.id, currentUser.email)" class="myListing-icon">
          <img src="@/assets/bin.png" alt="Delete" class="myListing-icon-image">
        </button>

      </div>
  </div>
</div>
</template>


<style>

.container {
  min-width: 1200px;
}

#myListing-title {
    color: #01889F; 
    font-family:"Poppins";
    font-size: 35px; 
    font-weight: bold; 
    margin: 50px 60px 10px 60px;
}
.myListing-create-job-button {
  font-family: "Poppins";
  display: flex; 
  align-items: center; 
  justify-content: left; 
  padding: 5px 20px; 
  background-color: #B0DBE2;
  color: black;
  text-decoration: none;
  border-radius: 10px;
  font-size: 18px;
  margin: 10px 60px 0px 60px;
  box-sizing: border-box;
  height: 60px; 
  width: calc(100% - 120px);
  box-shadow: 0 5px 10px rgba(0,0,0,0.1);
  font-weight: normal;
  transition: background-color 0.1s, color 0.1s;
}

.myListing-create-job-button:hover {
  background-color: #8dcdd7;
}

.myListing-job-title {
  font-family: "Poppins";
  color: black;
  text-align: left;
  font-weight: 500;
  margin: 10px 0 5px 25px;
  font-size: 20px;

}

.myListing-date-listed {
  font-family: "Poppins";
  color: black;
  text-align: left;
  font-weight: normal;
  margin: 10px 0 10px 25px;
}


.myListing-job-icon {
    vertical-align: middle;
    margin-right: 10px;
    height: 80px; 
}
.myListing-job-listing {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f0f0f0; 
    border-radius: 10px;
    margin: 0px 60px 19px 60px;
    height: 143px;
    width: calc(100% - 120px);
    box-shadow: 0 5px 10px rgba(0,0,0,0.2);
}
.myListing-num p {
    font-size: 20px;
    text-align: center;
    color: black;
    font-weight: normal;
    font-family: "Poppins";
    align-items: center;

}
.myListing-job-details {
    font-family: "Poppins";
    display: flex;
    flex-direction: column;
}
.myListing-job-details-title, /* Assuming you rename h3's class to this */
.myListing-job-details-description { /* Assuming you add this class to your <p> tags */
    margin-top: 5px;    
    margin-bottom: 5px;  
}


.myListing-job-status {
    display: flex;
    flex-direction: row; 
    margin-left: auto; 
    align-items: center;
    margin-right: 30px;
}

  .myListing-job-status-pending, .myListing-job-status-confirmed, .myListing-job-status-offered {
    flex: 1 1 auto; /* Give columns the ability to grow and shrink but not to base their size on the content */
  min-width: 80px; /* Prevent the columns from becoming too small */
  margin: 0 10px; /* Give a little space between columns */
  text-align: center; /* Center the text inside the columns */
  }

  .myListing-job-status-pending p, .myListing-job-status-confirmed p, .myListing-job-status-offered p{
    font-family:"Poppins";
    font-weight: normal;
    color: black;
    margin: 0 0 0 0;
  }


  .myListing-job-actions {
    display: flex;
    flex-direction: column; 
    align-items: center; 
    gap: 10px; 
    margin-right: 25px;
    justify-content: center; 
  }

  .myListing-view-listing {
    font-family: "Poppins";
    padding: 5px 20px;
    background-color: #01889F;
    color: white;
    text-align: center;
    text-decoration: none;
    border-radius: 5px;
    font-size: 15px;
    width: 100%;
    box-sizing: border-box; 
    font-weight:normal;
    white-space: nowrap;
    transition: background-color 0.1s, color 0.1s;
}

.myListing-view-applicants {
  font-family: "Poppins";
    padding: 5px 20px;
    background-color: #01889F;
    color: white;
    text-align: center;
    text-decoration: none;
    border-radius: 5px;
    font-size: 15px;
    width: 100%;
    box-sizing: border-box; 
    font-weight:normal;
    white-space: nowrap;
    transition: background-color 0.1s, color 0.1s;
}

.myListing-view-listing:hover {
  background-color:#006c7f;
}

.myListing-view-applicants:hover {
  background-color:#006c7f;
}

.myListing-job-actions .myListing-icon {
  margin-top: -20px;
  margin-bottom: -30px; 
  border: none;
  background: none;
  cursor: pointer;
  display: flex; 
  justify-content: center; 
}

.myListing-job-actions  {
  vertical-align: middle; 
  margin-right: 10px;
  height: 40px; 
  width: auto; 
  white-space: nowrap;
}

.myListing-delete-action, .myListing-icon .myListing-icon-image {
  cursor: pointer;
  display: flex; 
  justify-content: center; 
  vertical-align: middle; 
  margin-right: 10px;
  width: auto; 
  height: 50px;
  margin-bottom: 15px;
}

.myListing-icon:hover .myListing-icon-image {
  content: url("@/assets/bin-hover.png"); /* Path to your hover state icon */
}


</style>