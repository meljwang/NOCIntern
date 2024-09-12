<script>
import firebaseApp from '../../firebase.js';
import { getFirestore, collection, getDocs,getDoc, query, where, doc, addDoc, serverTimestamp, setDoc} from "firebase/firestore";
import DetailedJobView from '@/components/detailedJobView.vue'; // Adjust the import path as necessary
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref, uploadBytes } from "firebase/storage";

const auth = getAuth(firebaseApp);
const storage = getStorage(firebaseApp);
const db = getFirestore(firebaseApp);

export default {
  name: 'JobListing',
  components: {
    DetailedJobView
  },
  props: {
    companyId: String,
    jobId: String
  },
  data() {
    return {
      job: null, // This will hold the fetched job details
      company: null, // This will hold the fetched company details
      isLoading: true,
      error: null,
      userType: null,
      authUser: '',
      showApplicationPopup: false,
      notesToEmployer: "",
    };
  },
  created() {
    this.fetchJobDetails();
    this.fetchCompanyDetails();
  },
  methods: {
    async submitApplication() {
      const db = getFirestore(firebaseApp);
      const email = this.authUser.email; // Assuming this is correctly set from auth state
      const notes = this.notesToEmployer;
      const jobId = this.jobId;
      const companyId = this.companyId;
      const name = this.userName
      const profilePhotoURL = this.userProfPic
      const resumeFile = this.$refs.resumeInput.files[0]

      try {
        const resumeRef = ref(storage, `resumes/${email}/${resumeFile.name}`);
        const uploadResult = await uploadBytes(resumeRef, resumeFile);


        // Use setDoc instead of addDoc to specify the document ID (email in this case)
        const applicationDocRef = doc(db, `companies/${companyId}/jobs/${jobId}/applications`, email);
        await setDoc(applicationDocRef, {
          email,
          name,
          notes,
          resumePath: uploadResult.metadata.fullPath,
          status: "pending",
          profilePhotoURL,
          dateApplied: serverTimestamp() // Firestore server timestamp
        });

        if (!resumeFile) {
          alert("No file selected.");
          return;
        }

        // Assuming students/{email}/pendingJobs is a collection and you want to add a new document to it
        const studentPendingJobsRef = collection(db, `students/${email}/PendingJobs`);
        await addDoc(studentPendingJobsRef, {
          companyId,
          jobId,
          dateApplied: serverTimestamp()
        });

        this.showApplicationPopup = false; // Close the popup
      } catch (error) {
        console.error("Error submitting application:", error);
      }

      this.notesToEmployer = "";
      alert("You have applied for the job successfully.");
    },
    
    async fetchJobDetails() {
      this.isLoading = true;
      try {
        const jobRef = doc(db, "companies", this.companyId, "jobs", this.jobId);
        const jobSnap = await getDoc(jobRef);
        if (jobSnap.exists()) {
          this.job = { id: jobSnap.id, ...jobSnap.data() };
        } else {
          this.error = "No job found.";
        }
      } catch (error) {
        console.error("Error fetching job data: ", error);
        this.error = "Error fetching job details.";
      } finally {
        this.isLoading = false;
      }
    },
    async fetchCompanyDetails() {
      try {
        const companyRef = doc(db, "companies", this.companyId);
        const companySnap = await getDoc(companyRef);
        if (companySnap.exists()) {
          this.company = { id: companySnap.id, ...companySnap.data() };
        } else {
          this.error = "No company found.";
        }
      } catch (error) {
        console.error("Error fetching company data: ", error);
        this.error = "Error fetching company details.";
      }
    },
    async handleApplyClicked(data) {

      if (!this.authUser) {
        alert('You need to log in to apply for jobs.');
        this.showApplicationPopup = true; // Potentially trigger a login popup instead of alert
        return; // Exit the function early
      }

      // If the user is logged in but not a student, inform them that only students can apply
      if (this.authUser && this.userType !== 'student') {
        alert('Only students can apply for jobs.');
        return; // Exit the function early
      }

      const db = getFirestore(firebaseApp);
      const studentPendingJobsRef = collection(db, `students/${this.authUser.email}/PendingJobs`);
      const jobQuery = query(studentPendingJobsRef, where("jobId", "==", data.jobId));

      try {
        const querySnapshot = await getDocs(jobQuery);
        if (querySnapshot.empty) {
          // No existing application for this job, proceed to show application popup
          this.showApplicationPopup = true;
          this.applyingJobId = data.jobId;
          this.applyingCompanyId = data.companyId;
        } else {
          // Application already exists, do not show the popup and alert the user
          alert("You have already applied for this job.");
        }
      } catch (error) {
        console.error("Error checking existing applications:", error);
      }

      },
      async getUserInfo() {
      if (!this.authUser || !this.authUser.email) return;

      const db = getFirestore(firebaseApp);
      const studentDocRef = doc(db, "students", this.authUser.email);
      
      try {
        const docSnap = await getDoc(studentDocRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();

          this.userProfPic = userData.profilePhotoURL;
          this.userName = userData.name;        
        } else {
          console.log("No such student document!");
        }
      } catch (error) {
        console.error("Error getting student document:", error);
      }
    },
    async fetchUserType(userEmail) {
      const db = getFirestore(firebaseApp);
      let docRef = doc(db, "students", userEmail);
      let docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().isStudent) {
        this.userType = 'student';
        return;
      }

      docRef = doc(db, "companies", userEmail);
      docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().isCompany) {
        this.userType = 'company';
        return;
      }

      docRef = doc(db, "admin", userEmail);
      docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().isAdmin) {
        this.userType = 'admin';
        return;
      }
      this.userType = null; // If none of the above, userType is null
    },
    closeMessage() {
    this.showApplicationPopup = !this.showApplicationPopup;
    },
  },
  mounted() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
          this.authUser = user;
          this.getUserInfo();
          this.fetchUserType(user.email);
        } else {
          // User is signed out
          this.authUser = null;
          this.userType = null;
        }
      }
      ),
    this.fetchJobDetails();    
    this.fetchCompanyDetails();
  },
};
</script>

<template>
<br>
  <div id="job-listing-page">
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else id="detailed_view_ashley">
        <detailedJobView 
            :jobId = "job?.id"
            :companyId = "this.companyId"
            :jobTitle = "job?.jobTitle"
            :company = "company?.name"
            :location = "company?.location"
            :description = "job?.jobDesc"
            :qualifications = "job?.jobQuali"
            :skills = "job?.skills" 
            :positionType = "job?.jobType"
            :workTerm = "job?.workTerm" 
            :numVacancy = "job?.numVacancy" 
            :applicationDeadline = "job?.deadline"
            :jobOffer = "job?.jobOffer"
            :profilePhotoURL = "company?.profilePhotoURL"
            @apply-clicked="handleApplyClicked"
            />
    </div>
  </div>
  <div v-if="showApplicationPopup && authUser" class="apply-popup">
            <div class="apply-popup-content">
                <h3>Apply</h3>
                <form @submit.prevent="submitApplication">
                    <label id="resume-label" for="resume">Resume*</label>
                    <br>
                    <input type="file" id="resume" ref="resumeInput" required>
                    <br>
                    <br>
                    <label id="resume-label" for="notes"> Notes to Employer (Optional)</label>
                    <br>
                    <textarea id="notes" v-model="notesToEmployer"></textarea>

                    <div class="buttons-container">
                         <button type="submit" class="submit-button">Submit</button>
                         <button type="button" @click="closeMessage" class="cancel-button">Cancel</button>
                     </div>
                </form>
      </div>
    </div>
  
</template>

<style>
#job-listing-page {
    padding: 30px;
    margin-right: 30px;
    
}

</style>
