<script>
import firebaseApp from '../../firebase.js';
import { getFirestore, doc, getDoc, updateDoc, query,  collection, where, getDocs, setDoc, deleteDoc} from "firebase/firestore";
import confirmedImage from '@/assets/confirmed.png';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import pdfIcon from '@/assets/pdf.png';
import BackButton from '@/components/backButton.vue'; 

const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
var currentUser = null;
const storage = getStorage(firebaseApp);

export default {
  name: 'ApplicantDetails',
  components: {
    BackButton
  },
  data() {
    return {
      applicant: null, 
      job: null, 
      confirmedImage,
      companyId: '',
      authUser: '',
      pdfIcon,
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
}
    ,
    handleBack() {
  // Make sure 'job' is defined and has an 'id' before trying to push to the route
  if (this.job && this.job.id) {
    this.$router.push({ 
      name: 'ViewApplicants', 
      params: { jobId: this.job.id } 
    });
  }
},

    async downloadResume(resumePath) {
    const storageRef = ref(storage, resumePath);

    try {
      const url = await getDownloadURL(storageRef);
      // Open the URL for the resume in a new tab
      window.open(url, '_blank');
    } catch (error) {
      console.error("Error getting download URL: ", error);
      alert("Failed to download resume.");
    }
  },

async moveDoc(applicantId, jobId, from, to) {
      try {
        // Query in the old collection
        const collectionRef = collection(db, "students", applicantId, from);
        const q = query(collectionRef, where("jobId", "==", jobId));
        const querySnapshot = await getDocs(q);

        // Iterate over each document in the query result
        for (const docSnapshot of querySnapshot.docs) {
          const docData = docSnapshot.data();

          // References to the old and new documents
          const oldDocRef = doc(db, "students", applicantId, from, docSnapshot.id);
          const newDocRef = doc(db, "students", applicantId, to, docSnapshot.id);

          await setDoc(newDocRef, docData);

          await deleteDoc(oldDocRef);
        }
      } catch (error) {
        console.error("Error moving documents: ", error);
      }
    },

    formatDate(timestamp) {
      if (!timestamp) return '';
      const date = timestamp.toDate();
      return date.toLocaleDateString("en-US");
    },
    async fetchApplicantData(companyId, jobId, applicantId) {
      const applicantRef = doc(db, "companies", companyId, "jobs", jobId, "applications", applicantId);
      const applicantSnap = await getDoc(applicantRef);
      if (applicantSnap.exists()) {
        const applicantData = applicantSnap.data();
        const photoURL = await this.fetchUpdatedProfilePic(applicantData.email); 
        applicantData.profilePhotoURL = photoURL;  
        this.applicant = { id: applicantSnap.id, ...applicantData };  
      } else {
        console.log('No such document!');
      }
    },
    async fetchJobData(companyId, jobId) {
      const jobRef = doc(db, "companies", companyId, "jobs", jobId);
      const jobSnap = await getDoc(jobRef);
      if (jobSnap.exists()) {
        this.job = { id: jobSnap.id, ...jobSnap.data() };
      } else {
        console.log("No such job document!");
      }
    },
    
    getStatusIcon(status) {
    return status==="confirmed" ? this.confirmedImage : null;
  },
  async offerApplicant(applicantId) {
  if (!applicantId) return;
  const confirmOffer = confirm("Offer applicant?");
  if (!confirmOffer) return;
  const { jobId } = this.$route.params;
  this.moveDoc(applicantId, jobId, "PendingJobs", "OfferedJobs")
  const applicantRef = doc(db, "companies", this.companyId, "jobs", jobId, "applications", applicantId);
  const jobRef = doc(db, "companies", this.companyId, "jobs", jobId);

  try {
    await updateDoc(applicantRef, { status: "offered" });


    alert("Applicant has been offered the role.");
    this.$router.push({ name: 'ViewApplicants', params: { jobId: jobId } });
  } catch (error) {
    console.error("Error updating applicant status:", error);
    alert("Failed to offer applicant.");
  }
},

async rejectApplicant(applicantId) {
  if (!applicantId) return;
  const confirmReject = confirm("Reject applicant?");
  if (!confirmReject) return;
  const { jobId } = this.$route.params;
  this.moveDoc(applicantId, jobId, "PendingJobs", "RejectedJobs")
  const applicantRef = doc(db, "companies", this.companyId, "jobs", jobId, "applications", applicantId);
  const jobRef = doc(db, "companies", this.companyId, "jobs", jobId);

  try {
    await updateDoc(applicantRef, { status: "rejected" });
    alert("Applicant has been rejected.");
    this.$router.push({ name: 'ViewApplicants', params: { jobId: jobId } });
  } catch (error) {
    console.error("Error updating applicant status:", error);
    alert("Failed to reject applicant.");
  }
},


  },
  async mounted() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // If "currentUser" is meant to be a reactive property of your component,
      // make sure it's defined in "data" and use "this.currentUser" instead.
      this.currentUser = user; // Assuming "currentUser" should be part of your Vue component's data
      this.authUser = user;
      this.companyId = user.email; // Now safely assigning companyId

      const { jobId, applicantId } = this.$route.params;

      if (jobId && applicantId) {
        try {
          await Promise.all([
            this.fetchApplicantData(this.companyId, jobId, applicantId),
            this.fetchJobData(this.companyId, jobId)
          ]);


        } catch (error) {
          console.error("Error fetching data:", error);
        }
      } else {
        console.error("Job ID or Applicant ID is missing.");
      }
    } else {
      // User is signed out
      this.authUser = null;
      // Handle case when user is not logged in (if needed)
    }
  });
},

};
</script>



<template>
  <div id="appDetails-container">
    <div id="appDetails-backbutton">
      <BackButton @back="handleBack" />
    </div>

    <div class="appDetails-applicant-card">
      <div class="appDetails-applicant-photo-wrapper">
  <img v-if="applicant" :src="applicant?.profilePhotoURL" alt="Applicant Photo" class="appDetails-applicant-photo">
</div>

      <div class="appDetails-applicant-details" v-if="applicant">
        <h3 class="appDetails-applicant-name">{{ applicant.name }}</h3>
        <div class="appDetails-applicant-status">
    Status: {{ applicant.status ==="confirmed" ? 'Confirmed' : 'Pending' }}
    <img v-if="applicant.status" :src="getStatusIcon(applicant.status)" class="appDetails-status-icon">
  </div>
      </div>
    </div>

      <div class="appDetails-additional-info">
        <div class="appDetails-info-section">
          <h3>Role Applied</h3>
          <p>{{ job?.jobTitle }}</p>
        </div>

        <div class="appDetails-info-section">
          <h3>Application date</h3>
          <p>{{ formatDate(applicant?.dateApplied) }}</p>
        </div>

        <div class="appDetails-info-section">
          <h3>Email</h3>
          <p>{{ applicant?.email }}</p>
        </div>

        <div class="appDetails-info-section note-section">
          <h3>Note to employer</h3>
          <p>{{ applicant?.notes ? applicant.notes : 'N.A.' }}</p>
        </div>
      </div>

      <div v-if="applicant && applicant.resumePath" class="appDetails-info-section">
  <h3>Resume</h3>
  <button @click="downloadResume(applicant.resumePath)" class="appDetails-download-button">
    <img :src="pdfIcon" alt="PDF icon" class="appDetails-pdf-icon"> <!-- PDF icon next to button text -->
    View Resume
  </button>
</div>


      <div v-if="applicant">

      <!-- Conditionally render action buttons if status is not 'confirmed' -->
      <div class="appDetails-actions" v-if="applicant.status == 'pending'">
        <div class="appDetails-action-buttons">
          <button @click="offerApplicant(applicant.id); "  class="appDetails-accept-button">Offer</button>
          <button @click="rejectApplicant(applicant.id)" class="appDetails-reject-button">Reject</button>
        </div>
      </div>
    </div>

    <br>
    </div>
    

</template>


<style>
.appDetails-pdf-icon {
  height: 30px;
  width: auto;
  
}

.appDetails-download-button {
  color: black;
  font-family: "Poppins";
  font-weight: 500;
  font-size: 15px;
  background-color: #D9D9D9;
  display: flex;
  align-items: center; 
  justify-content: center; 
  gap: 10px; 
  box-shadow: 0 5px 10px rgba(0,0,0,0.1); 
  border-radius: 10px;
  padding: 8px 20px; /* Padding inside the button */
  border: none; /* Remove border */
  cursor: pointer; /* Change mouse cursor to indicate clickable */
  transition: background-color 0.1s, color 0.1s;
}

.appDetails-download-button:hover {
  background-color: #b3b3b3; /* Darker shade on hover */
}

#appDetails-container {
  padding: 30px;
}

#appDetails-backbutton {
  margin: 10px 0 0 10px;
}

.appDetails-back-button {
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
.appDetails-arrow-icon {
  height: 10px;
}
.appDetails-applicant-status {
  margin: 0px;
  font-size: 15px;
  font-family: "Poppins";
  margin-top: 2px; 
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  color: black;
  font-weight: normal;
}
.appDetails-applicant-name {
  font-family:"Poppins";
  margin: 0;
  font-size: 20px;
  font-weight: 420;
  margin-top: 2px;
  margin-bottom: 2px;
  color: black;
  text-align: left;
}

.appDetails-applicant-photo-wrapper {
  flex-shrink: 0;
  width: 90px; 
  height: 90px; 
  border-radius: 50%;
  overflow: hidden;
  margin-right: 10px;
  margin-left: 15px;
}

.appDetails-applicant-photo {
  width: 90px; 
  height: 90px; 
  border-radius: 50%;
  margin-right: 10px;
  object-fit: cover;
  overflow: hidden;
}

.appDetails-applicant-details {
  flex: auto;
  margin-left: 5px;
  margin: 0px 25px;
}

.appDetails-applicant-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f0f0f0;
  border-radius: 10px;
  padding: 10px;
  margin: 20px 30px 20px 30px;
  height: 100px;
  box-shadow: 0 5px 10px rgba(0,0,0,0.2); 
}
.appDetails-status-text {
  font-weight: bold;
  margin-left: 4px;
}

.appDetails-info-section {
  margin-bottom: 10px;
  margin: 10px 30px 10px 30px;
  
}

.appDetails-info-section h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
  color: black; 
  font-family:"Poppins";
  font-weight: 500;
  margin-top: 30px;
  margin-bottom: 10px;
  text-align: left;
}

.appDetails-info-section p {
  font-family:"Poppins";
  margin: 0;
  font-size: 14px;
  color: black;
  display: inline-block;
  align-items: center;
  justify-content: space-between;
  background-color: #f0f0f0;
  border-radius: 10px;
  padding: 10px;
  height: auto;
  box-shadow: 0 5px 10px rgba(0,0,0,0.2); 
  font-size: 15px;
  font-weight:normal;
  
}

.appDetails-note-section {
  margin-top: 20px;
}

.appDetails-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.appDetails-status-icon {
  width: 23px; 
  height: auto;
  vertical-align: middle;
  margin-left: 8px;
}

.appDetails-accept-button, .appDetails-reject-button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  margin: 30px 10px 10px 30px;
  font-weight: 500;
  font-family: "Poppins";
  width: 100px;
  transition: background-color 0.1s, color 0.1s;
}

.appDetails-accept-button:hover {
  background-color:#006c7f;
}

.appDetails-reject-button:hover {
  background-color: #706e6e; 
}

.appDetails-accept-button {
  background-color: #01889F;
  color: white;
}

.appDetails-reject-button {
  background-color: #979797;
  color: white;
  margin-left: 10px; 
}

#appDetails-backbutton {
  margin-bottom: 30px;
}



</style>