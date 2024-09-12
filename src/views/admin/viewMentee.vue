<script>
import { ref, onMounted } from 'vue';
import BackButton from '@/components/backButton.vue';
import { getFirestore, collection, getDocs,getDoc, query, where, doc } from "firebase/firestore";
import firebaseApp from '../../firebase.js';
import { useRoute } from 'vue-router';
const db = getFirestore(firebaseApp);


export default {
  name: 'viewMentee',
  components: { BackButton },
  setup() {
    const route = useRoute();
    const studentId = route.params.menteeId;
    const jobs = ref([]);
    const currentTab = ref('PendingJobs'); // default is showing PendingJobs
    const skills = ref([]);
    const studentName = ref('');
    const studentRole = ref('');
    const profilePhotoURL = ref('');
    const studentEmail = ref('');
    const studentCompany = ref('');

    const fetchJobs = async (jobType) => {
      jobs.value = [];
      if (!studentId) return; 
      try {
        currentTab.value = jobType; // Update the current tab
        const docRef = doc(db, 'students', studentId); 
        const queryStudent = await getDoc(docRef);

        if (queryStudent.exists()) {
          const JobsRef = collection(db, `students/${studentId}/${jobType}`);
          const JobsSnapshot = await getDocs(JobsRef);

          for (const documentSnapshot of JobsSnapshot.docs) {
            const docData = documentSnapshot.data()
            const companyNameRef = doc(db, `companies/${docData.companyId}`);
            const queryCompany = await getDoc(companyNameRef);
            const companyData = queryCompany.exists() ? queryCompany.data() : null;

            const jobNameRef = doc(db, `companies/${docData.companyId}/jobs/${docData.jobId}`);
            const queryJob = await getDoc(jobNameRef);
            
            if (queryJob.exists()) {
                const jobData = queryJob.data();
                let job = { id: documentSnapshot.id, company: companyData.name, role: jobData.jobTitle, dateApplied: documentSnapshot.data().dateApplied };
                console.log(job.id);
                jobs.value.push(job);
            }
          };
        } else {
            console.log("No such document");
        }
      } catch (error) {
          console.error("Error getting documents: ", error);
      }
    };

    const fetchDetails = async () => {
      if (!studentId) return; 
      try {
        const docRef = doc(db, 'students', studentId); 
        const queryStudent = await getDoc(docRef);

        if (queryStudent.exists()) {
          const studentData = queryStudent.data();
          skills.value = studentData["skills"];
          studentName.value = studentData["name"];
          studentRole.value = studentData["jobRole"];
          profilePhotoURL.value = studentData["profilePhotoURL"];
          studentEmail.value = studentData["email"];
          const companyDocRef = doc(db, 'companies', studentData["companyEmail"]);
          const queryCompany = await getDoc(companyDocRef);
          if (queryCompany.exists()) {
            const companyData = queryCompany.data();
            studentCompany.value = companyData["name"];
          }
        } else {
          console.log("No such document");
        }
      } catch (error) {
        console.log("Error getting documents: ", error);
      }
     };

    onMounted(() => { 
      fetchJobs(currentTab.value);
      fetchDetails();
    });

    return { studentId, fetchJobs, currentTab, jobs, studentName, skills, studentRole, profilePhotoURL, studentEmail, studentCompany };
  },
  methods: {
    handleBack() {
      this.$router.go(-1);
    },

    formatDate(timestamp) {
      if (timestamp) {
          const date = timestamp.toDate();
          return date.toLocaleDateString();
      }
      return '';
    },
  }
}
</script>

<template>
  <div id="container-viewMentee">
    <br><br>
    <BackButton @back="handleBack" />
  </div>
  <div id="mentee-info-container">
    <div id="mentee-info">
      <img v-if="profilePhotoURL" :src="profilePhotoURL" id="mentee-profile-img" alt="User Profile Photo">
      <div id="mentee-wrapper">
        <h2 id="mentee-name">{{ studentName }}</h2>
        <div v-if="studentCompany.length > 0" id="mentee-top-info">
          <div id="mentee-company-display">
              <p id="mentee-company-name">{{ studentCompany }}</p>
              <p id="mentee-job-name">{{ studentRole }}</p>
          </div>
        </div>
        <div v-else>
          <p id="mentee-no-intern">No internships accepted</p>
        </div>
      </div>
    </div>
  </div>
  
  <p id="recently-app">Recently Applied</p>
  <div id="mentee-statuses">
    <div class="tabs">
        <br>
        <button id="pending-approve" :class="{ active: currentTab === 'PendingJobs' }" @click="fetchJobs('PendingJobs')">Pending</button> |
        <button id="pending-approve" :class="{ active: currentTab === 'OfferedJobs' }" @click="fetchJobs('OfferedJobs')">Offered</button> |
        <button id="pending-approve" :class="{ active: currentTab === 'RejectedJobs' }" @click="fetchJobs('RejectedJobs')">Rejected</button> |
        <button id="pending-approve" :class="{ active: currentTab === 'DeclinedJobs' }" @click="fetchJobs('DeclinedJobs')">Declined</button>
    </div>
    <div class="status-container">
      <table>
          <thead>
              <tr>
              <th>Company</th>
              <th>Job Role</th>
              <th>Date Applied</th>
              </tr>
          </thead>
          <tbody>
              <tr v-for="job in jobs" :key="job.id">
              <td>{{ job.company }}</td>
              <td>{{ job.role }}</td>
              <td>{{ formatDate(job.dateApplied) }}</td>
              </tr>
          </tbody>
      </table>
    </div>
  </div>
  <p id="recently-app">Skills</p>
    <div class="skills-list">
      <div class="skill" v-for="skill in skills" :key="skill">{{ skill }}</div>
    </div>
  <p id="recently-app">Email</p>
  <div class="skills-list">
    <div class="skill">{{  studentEmail }}</div>
  </div>
</template>

<style>
#container-viewMentee {
  margin: 30px;
  margin-top: 0px;
}

#mentee-info-container {
  margin-left: 5%;
  margin-bottom: 20px;
}

#mentee-info {
    border-radius: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); 
    width: 80%;
    background-color: #F9F9F9;
    display: flex;
}

#mentee-profile-img {
  margin: 3%;
  width: 100px; 
  height: 100px; 
  border-radius: 50%;
  object-fit: cover;
}

#mentee-wrapper {
  justify-content: left;
  align-items:start;
}

#mentee-name {
  color: black;
  font-family: "Poppins";
  font-size:x-large;
  font-weight:lighter;
  padding-top:8%;
  margin-left: 0%;
  margin-bottom: 0px;
  text-align: start;
}

#recently-app {
  color: #01889F; 
  font-family:"Poppins";
  font-weight: bold;
  font-size: x-large;
  margin-left: 5%;
  margin-bottom: 1%;
}

#mentee-statuses {
  border-radius: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); 
  width: 70%;
  background-color: #F5F5F5;
  margin-left: 5%;
}

.skills-list {
  margin-top: 0%;
  margin-left: 5%;
  display: flex;
  gap: 10px; 
}

.skill {
  border: 1px solid lightgray; 
  border-radius: 20px; 
  padding: 10px 20px; 
  font-weight: lighter;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); 
  cursor: default;
  color: black;
  font-family: "Poppins";
  font-size: small;
}

#mentee-company-name {
  font-family: "Poppins";
  color: black;
  font-weight:600;
  font-size: normal;
  margin-bottom:0px;
  margin-top:10px;
}

#mentee-job-name {
  font-family: "Poppins";
  color: black;
  font-weight:lighter;
  font-size: normal;
  margin-top:0px;
}

#mentee-no-intern {
  font-family: "Poppins";
  color: black;
  font-weight:lighter;
  font-size: normal;
  margin-top: 10px;
}
</style>
