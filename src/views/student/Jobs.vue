<template>
	<div id="jobs-top">
    <input type="text" v-model="searchTerm" id="search_bar" placeholder="  Search for Jobs" />
  </div>

  <div class="filters">
    <select v-model="selectedCountry" id="select-filter">
      <option value="">Select a country</option>
      <option v-for="country in countryOptions" :value="country" :key="country">{{ country }}</option>
    </select>

    <select v-model="selectedSkill" id="select-filter">
      <option value="">Select a skill</option>
      <option v-for="skill in skillOptions" :value="skill" :key="skill">{{ skill }}</option>
    </select>
  </div>


  <div v-if="isLoading" id="loading">
    Loading jobs...
  </div>


  <div v-else>
    <div v-if = 'filteredJobs.length' id="jobs-page-wrapper">

      <div id="content_wrapper">
        <div id = "tile_container">
          <smallJobTile
            v-for="job in filteredJobs"
            :key="job.id"
            :jobID="job.id"
            :companyID="job.companyId"
            :jobTitle="job.jobTitle"
            :company="job.company"
            :employerRating="job.employerRating"
            :location="job.location"
            :skill="job.skills"
            :isRecommended="isRecommended(studentSkills, job.skills)"
            :profilePhotoURL="job.profilePhotoURL"
            @jobClick = "handleJobClick" />
        </div>

        <div id = "detailed_view">
          <detailedJobView 
            :jobId = "selectedJob.id"
            :companyId = "selectedJob.companyId"
            :jobTitle = "selectedJob.jobTitle"
            :company = "selectedJob.company"
            :location = "selectedJob.location"
            :description = "selectedJob.jobDesc"
            :qualifications = "selectedJob.jobQuali"
            :skills = "selectedJob.skills" 
            :positionType = "selectedJob.jobType"
            :workTerm = "selectedJob.workTerm" 
            :numVacancy = "selectedJob.numVacancy" 
            :applicationDeadline = "selectedJob.deadline"
            :jobOffer = "selectedJob.jobOffer"
            :profilePhotoURL = "selectedJob.profilePhotoURL"
            :country = "selectedJob.country"

            @apply-clicked="handleApplyClicked"
            />
        </div>
      </div>
      

    </div>

      <div v-else class="no-results">
          No results found.
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

    <Bottom/>

  </template>


<script>
import { getFirestore, collection, getDocs,getDoc, query, where, doc, addDoc, serverTimestamp, setDoc} from "firebase/firestore";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import firebaseApp from '../../firebase.js';
import smallJobTile from "../../components/smallJobTile.vue"; 
import detailedJobView from "../../components/detailedJobView.vue";
import Bottom from "../../components/Bottom.vue";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
const auth = getAuth(firebaseApp);
const storage = getStorage(firebaseApp);

export default {
  data() {
    return {
      jobs: [],
      searchTerm: '',
      isLoading: true,
      authUser: '',
      selectedJob: {},
      studentSkills: [],
      showApplicationPopup: false,
      notesToEmployer: "",

      applyingJobId: null,
      applyingCompanyId: null,

      userType: null,

      userName: null,
      userProfPic:null,
      userCountry: null,
      userJob: "",

      //for search,filter and recco
      selectedCountry: '',
      selectedSkill: '',
      countryOptions: ['China', 'United States', 'United Kingdom','Chile','Sweden','Canada','Indonesia','Malysia', 'Germany', 'Japan', 'Norway', 'France', 'Singapore', 'Thailand', 'Philippines', 'Vietnam'], 
      skillOptions: [
        "JavaScript",
        "Python",
        "Java",
        "SQL",
        "C",
        "R",
        "C++",
        "Rust",
        "Swift",
        "Ruby",
      ],
    };
  },

  components: {
    smallJobTile,
    detailedJobView,
    Bottom
  },

  watch: {
    filteredJobs(newVal) {
      if (newVal.length > 0) {
        this.selectedJob = newVal[0];
      } else {
        this.selectedJob = {}; // Reset to empty object if no jobs match the filter
      }
    }
  },

  computed: {
     filteredJobs() {
    // First, filter the jobs based on search term, country, and skill
      let jobs = this.jobs.filter(job => {
        const matchesTitle = job.jobTitle.toLowerCase().includes(this.searchTerm.toLowerCase());
        const matchesCountry = this.selectedCountry ? job.country === this.selectedCountry : true;
        const matchesSkill = this.selectedSkill ? job.skills.includes(this.selectedSkill) : true;
        return matchesTitle && matchesCountry && matchesSkill;
      });

      // Next, sort the jobs so that recommended jobs come first
      jobs.sort((a, b) => {
        const aIsRecommended = this.isRecommended(this.studentSkills, a.skills);
        const bIsRecommended = this.isRecommended(this.studentSkills, b.skills);

        // If both jobs are or aren't recommended, they are considered equal in terms of sorting
        if (aIsRecommended === bIsRecommended) {
          return 0;
        }
        
        // If job 'a' is recommended and 'b' is not, 'a' should come first
        if (aIsRecommended) {
          return -1;
        }
        
        // Otherwise, 'b' is recommended and 'a' is not, so 'b' should come first
        return 1;
      });

      return jobs;
    }
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
    this.fetchJobs();    
  },
  methods: {
    async fetchJobs() {
      this.isLoading = true;
      const db = getFirestore(firebaseApp);
      const companiesCollectionRef = collection(db, "companies");
      const companiesSnapshot = await getDocs(companiesCollectionRef);
      let allJobs = [];
      for (const companyDoc of companiesSnapshot.docs) {
        const jobsCollectionRef = collection(db, `companies/${companyDoc.id}/jobs`);
        const jobsSnapshot = await getDocs(jobsCollectionRef);
        const jobs = jobsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          company: companyDoc.data().name,
          location: companyDoc.data().location,
          employerRating: companyDoc.data().rating,
          country: companyDoc.data().country,
          companyId: companyDoc.id,
          profilePhotoURL: companyDoc.data().profilePhotoURL
          // Add any additional company-related data you need to show for each job here
        }));
        allJobs = allJobs.concat(jobs);
      }
      this.jobs = allJobs;
      this.isLoading = false;   
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

    async handleJobClick({ jobId, companyId }) {
      console.log(companyId)
      this.isLoading = true;
      try {
        const db = getFirestore(firebaseApp);

        const companyDocRef = doc(db, `companies`, companyId);
        const companyDocSnap = await getDoc(companyDocRef);
        let companyDetails = {};
        const companyData = companyDocSnap.data();

        companyDetails = {
          company: companyData.name, 
          location: companyData.location, 
          profilePhotoURL: companyData.profilePhotoURL,
          country: companyData.country,
        };

        
        const jobDocRef = doc(db, `companies/${companyId}/jobs`, jobId);
        const jobDocSnap = await getDoc(jobDocRef);

        if (jobDocSnap.exists()) {
          // Set the detailed job data for rendering
          this.selectedJob = {
            id: jobId,
            ...jobDocSnap.data(),
            ...companyDetails,
            companyId: companyId // Assuming you might need this for some reason
          };
        } else {
          console.log("No such document!");
          this.selectedJob = {}; // Reset or handle the absence of data appropriately
        }
      } catch (error) {
        console.error("Error fetching job details:", error);
        // Handle the error appropriately
      }
      this.isLoading = false;

    },

  async handleApplyClicked(data) {
    console.log(data.jobId)
    if (!this.authUser) {
      alert('You need to log in to apply for jobs.');
      this.showApplicationPopup = true; // Potentially trigger a login popup instead of alert
      return; // Exit the function early
    }

    if (this.userType !== 'student') {
      alert('Only students can apply for jobs.');
      return; // Exit the function early
    }

    if (this.userJob != "") {
      alert(`You have a confirmed job already!`);
      return;
    }

    if (this.userCountry !== data.country) {
      alert(`You can only apply for companies in the country you have been accepted into: ${this.userCountry}.`);
      return;
    }


    // Helper function to check for the job in various collections
    const checkJobInCollections = async (jobId, userEmail) => {
      const collectionsToCheck = ['PendingJobs', 'OfferedJobs', 'DeclinedJobs', 'RejectedJobs'];
      const db = getFirestore(firebaseApp);

      for (const collectionName of collectionsToCheck) {
        const jobsRef = collection(db, `students/${userEmail}/${collectionName}`);
        const jobQuery = query(jobsRef, where("jobId", "==", jobId));
        const querySnapshot = await getDocs(jobQuery);
        if (!querySnapshot.empty) {
          return true; // Job found in one of the collections
        }
      }
      return false; // Job not found in any collections
    };

    try {
      const jobExists = await checkJobInCollections(data.jobId, this.authUser.email);
      if (jobExists) {
        alert("You have already applied for this job.");
        return; // Exit early since the job was found
      }
      
      // If the job was not found in any collections, proceed to apply
      this.showApplicationPopup = true;
      this.applyingJobId = data.jobId;
      this.applyingCompanyId = data.companyId;
      
    } catch (error) {
      console.error("Error checking existing applications:", error);
      alert("There was an error processing your application. Please try again later.");
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
          this.userCountry = userData.country;
          this.userJob = userData.jobRole; 
          this.studentSkills = userData.skills || [];       
        } else {
          console.log("No such student document!");
        }
      } catch (error) {
        console.error("Error getting student document:", error);
      }
    },

    async submitApplication() {
      const db = getFirestore(firebaseApp);
      const email = this.authUser.email; 
      const notes = this.notesToEmployer;
      const jobId = this.applyingJobId;
      const companyId = this.applyingCompanyId;
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

        console.log('Application submitted successfully');
        this.showApplicationPopup = false; // Close the popup
      } catch (error) {
        console.error("Error submitting application:", error);
      }

      this.notesToEmployer = "";
      alert("You have applied for the job successfully.");
    },


    isRecommended(studentSkills, jobSkills) {
      return jobSkills.every(skill => studentSkills.includes(skill));
    },

    closeMessage() {
    this.showApplicationPopup = !this.showApplicationPopup;
    }
  },
};
</script>

<style>
#jobs-top {
  margin-top: 40px;
}
.filters {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.filters select {
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
}

#select-filter {
  font-family: "Poppins";
  color: black;
  font-weight: lighter;
}

#jobs-page-wrapper {
  display:flex;
  justify-content: center;
  width: 100%;
}

#content_wrapper {
  display: flex;
  width: 90%;
  justify-content: center;
  align-items: flex-start;
}

#detailed_view {
  display: flex;
  width: 60%;
  flex-direction: column;
  flex-grow: 1;
}

#tile_container {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  margin-right:2%;
}


#search_bar {
    margin: 0 auto 20px auto; 
    display: block; 
    width: 80%; 
    padding: 10px; 
    border: 1px solid #ccc; 
    border-radius: 20px; 
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); 
    font-size: 1em; 
    outline: none; 
}

.search-bar:focus {
    border-color: #01889F; 
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); 
}

.no-results {
  text-align: center;
  padding: 20px;
  margin-top: 50px; 
  font-size: 1.5em; 
  color: #01889F; 
  font-family: "Poppins", sans-serif; 
  border: 1px solid #e1e1e1; 
  border-radius: 8px; 
  background-color: #f5f5f5; 
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); 
  max-width: 80%; 
  margin-left: auto;
  margin-right: auto;
}

#loading {
  text-align: center;
  padding: 20px;
  font-size: 1.5em;
  color: #01889F;
  font-family: "Poppins", sans-serif;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 20px auto;
  width: 80%;
  max-width: 400px;
}

.apply-popup-message {
  position: fixed; /* Similar to the popup, so it overlays content */
  top: 50%; /* Center vertically */
  left: 50%; /* Center horizontally */
  transform: translate(-50%, -50%); /* Adjust to center perfectly */
  z-index: 100; /* Ensure it's above other content */
  background-color: white; /* Background color */
  padding: 20px; /* Padding around the text */
  border-radius: 8px; /* Rounded corners */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* A subtle shadow */
  text-align: center; /* Center the text */
  width: 80%; /* Adjust width as necessary */
  max-width: 400px; /* Max width to avoid overly wide messages on large screens */
}

.apply-popup-message a {
  display: inline-block; /* Make the link inline */
  margin-top: 20px; /* Space above the link */
  padding: 10px 20px; /* Padding inside the link */
  background-color: #007bff; /* Background color of the button/link */
  color: white; /* Text color */
  text-decoration: none; /* No underline */
  border-radius: 4px; /* Rounded corners for the link */
}

/* Additional styling for the link on hover to provide feedback */
.apply-popup-message a:hover {
  background-color: #0056b3; /* Darker shade on hover */
}

.apply-popup-message .close-button {
  position: absolute; /* Position absolutely to place it in the corner */
  top: 5px; /* Adjust this value to fit your design */
  right: 5px; /* Adjust this value to fit your design */
  padding: 5px; /* Smaller padding for a smaller button */
  background-color: transparent; /* Transparent background */
  color: #333; /* Color of the "X" */
  border: none; /* Remove border */
  font-size: 16px; /* Adjust font size as needed */
  cursor: pointer; /* Change cursor to pointer */
}

.apply-popup-message .close-button:hover {
  color: #000; /* Darker color on hover */
}

#resume-label {
  font-family:"Poppins";
  font-weight:bold;
}

#resume {
  margin-top: 10px;
  font-family: "Poppins";
  font-weight:normal;
  color: black;
}

#notes {
  margin-top:10px;
  width: 100%;
}
</style>