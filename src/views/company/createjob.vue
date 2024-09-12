<script>
import firebaseApp from '../../firebase.js';
import { getFirestore, doc, setDoc, collection, serverTimestamp } from "firebase/firestore";
import 'typeface-poppins';
import BackButton from '@/components/backButton.vue';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
var currentUser = null;

export default {
  name: 'JobInputs',
  components: {
    BackButton
  },
  computed: {
    today() {
      const today = new Date();
      const month = `0${today.getMonth() + 1}`.slice(-2); // Add leading 0 if needed
      const day = `0${today.getDate()}`.slice(-2); // Add leading 0 if needed
      return `${today.getFullYear()}-${month}-${day}`;
    }
  },
  data() {
    return {
    jobTitle: '',
	  jobDesc: '',
	  jobQuali: '',
	  jobOffer: '',
	  jobType: '',
	  workTerm: '',
	  jobFunction: '',
	  numVacancy: '',
	  deadline: null,
	  skill1: '',
	  skill2: '',
	  skill3: '',
	  skill4: '',
	  skill5: '',
	  skill6: '',
	  skill7: '',
	  skill8: '',
    skills: [],
    unfilled: false,
    pending: 0,
    confirmed: 0,
    dateListed: null,
    authUser: '',
    };
  },
  methods: {
    handleBack() {
      this.$router.push('/myListings'); 
    },
    skillsToArray() {
    if (this.skills.length === 0) {
      let skillSet = new Set(); // Used to track unique skills
      let skillFields = [this.skill1, this.skill2, this.skill3, this.skill4, this.skill5, this.skill6, this.skill7, this.skill8];

      for (let skill of skillFields) {
        if (skill !== '' && skillSet.has(skill)) {
          this.skills = []
          alert('Duplicate skill detected: ' + skill);
          return false; // Stop further execution if a duplicate is found
        } else if (skill !== '') {
          this.skills.push(skill);
          skillSet.add(skill);
        }
      }
    }
  },

  validateAndSaveData() {
    this.unfilled = false;
    let emptyFields = [];
    if (this.jobTitle === '') emptyFields.push('Job Title');
    if (this.jobDesc === '') emptyFields.push('Job Description');
    if (this.jobQuali === '') emptyFields.push('Job Qualifications');
    if (this.jobOffer === '') emptyFields.push('Company Offer');
    if (this.jobType === '') emptyFields.push('Job Type');
    if (this.workTerm === '') emptyFields.push('Work Term');
    if (this.jobFunction === '') emptyFields.push('Job Function');
    if (this.numVacancy === '') emptyFields.push('Number of Vacancies');
    if (this.deadline == null) emptyFields.push('Deadline');

    this.deadline = new Date(this.deadline,)  


    if (emptyFields.length > 0) {
      this.unfilled = true
      alert('Please fill in the following fields: ' + emptyFields.join(', '));
    }
  },

    async writeTestData() {
      this.skills = []; 

      try {
        const docRef = doc(collection(db, "companies", currentUser.email, "jobs"))
        var bool = null
        bool = this.skillsToArray()
        if (bool != null) {
          return
        }
        this.validateAndSaveData()

        if (this.unfilled) {
          return
        }

        if(this.jobTitle == '') {
          alert('Fields not completely filled');
        }

        // Data to be written
        const data = {
          jobTitle: this.jobTitle,
	        jobDesc: this.jobDesc,
	        jobQuali: this.jobQuali,
	        jobOffer: this.jobOffer,
	        jobType: this.jobType,
	        workTerm: this.workTerm,
	        jobFunction: this.jobFunction,
	        numVacancy: this.numVacancy,
          skills: this.skills,
          deadline: this.deadline,
          dateListed: serverTimestamp(),
          confirmed: this.confirmed,
          pending: this.pending
        };

        // Write data to Firestore
        await setDoc(docRef, data);

        console.log("Document written successfully");

        this.$router.push('/myListings');
      } catch (error) {
        console.error("Error writing document: ", error);
      }
    },


    cancelAndGoHome() {
    this.$router.push('/myListings');
  }

  },

  async mounted() {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          currentUser = user;
          this.authUser = user;
        } else {
          // User is signed out
          this.authUser = null;
        }
      }
    )
  }
};
</script>


<template>
	<div id="container-createJob">
	<h1 id="title-createJob">Create New Listing</h1>

  <div>
    <label for="jobTitle" class="input-label">Job Title:</label>
    <input
      type="text"
      id="jobTitle"
      placeholder="E.g. DevOps Engineer Intern"
      v-model="jobTitle"
      class="job-title-input"
    />
  </div>

  <br>

  <div>
    <label for="jobDescr" class="input-label">Job Description:</label>
    <textarea
      id="input-desc"
      placeholder="E.g. We are looking for an innovative and self-driven DevOps Engineer Intern to join our DevOps Engineering team. You will get the opportunity to work closely with our DevOps and Infrastructure team to support and enhance our development and deployment processes.
	  
In this role you will:
• Assist in the implementation and improvement of CI/CD pipelines for efficient and automated software delivery.
• Contribute to the development and maintenance of infrastructure as code scripts using tools like Terraform or Ansible to automate infrastructure provisioning."
      v-model="jobDesc"
      class="input-desc"
    ></textarea>
  </div>

  <br>

  <div>
    <label for="jobQuali" class="input-label">Qualifications:</label>
    <textarea
      id="input-quali"
      placeholder="E.g. You should have/ be:
• Pursuing a Bachelor's degree in a STEM related field
• Familiarity with multi-cloud deployment (AWS, Azure, and Google) templating such as Kubernetes Config Connector, and/or Terraform
• Strong general programming experience in Python, Go, or Java to write automation scripts
• Understanding of containerization technologies
• Familiar with observability/monitoring/logging platforms
• Knowledgeable in scripting skills (e.g., Python, Bash, JavaScript, Ruby, PowerShell)
• Enjoy working in a fast-paced and result driven environment"
      v-model="jobQuali"
      class="input-quali"
    ></textarea>
  </div>

  <br>

  <div>
    <label for="jobOffer" class="input-label">What we offer:</label>
    <textarea
      id="input-offer"
      placeholder="E.g.
• Hands-on experience in a pioneering tech start-up environment.
• Exposure to real-world applications of Generative AI in supply chain management.
• Mentorship from industry experts and opportunities for professional development."
      v-model="jobOffer"
      class="input-offer"
    ></textarea>
  </div>
	
  <br><hr id="division"><br>

	<div class="input-container">
	<div class="leftContainer-type">
  <label for="jobType" class="input-label-type">Position Type:</label> <br>
  <select id="jobType" v-model="jobType" class="small-box-input" required>
  <option value="" disabled selected>Select job type</option>
    <option value="Internship">Internship</option>
    <option value="part-time">Part Time</option>
    <option value="full-time">Full Time</option>
  </select>
</div>

  <div class="rightContainer-type">
  <label for="workTerm" class="input-label-type">Work Term:</label> <br>
  <select id="workTerm" v-model="workTerm" class="small-box-input" required> 
  <option value="" disabled selected>Select term length</option>
    <option value="6">6 Months</option>
    <option value="7">7 Months</option>
    <option value="8">8 Months</option>
    <option value="9">9 Months</option>
    <option value="10">10 Months</option>
    <option value="11">11 Months</option>
    <option value="12">12 Months</option>
  </select>
</div>
  </div>

  <br>

  <div class="input-container">
	<div class="leftContainer-type">
  <label for="jobFunction" class="input-label-type">Internship/Project Function:</label> <br>
  <select id="jobFunction" v-model="jobFunction" class="small-box-input" required>
  <option value="" disabled selected>Select job function</option>
    <option value="swe">Software Engineer</option>
    <option value="dataanalyst">Data Analyst</option>
    <option value="datasci">Data Scientist</option>
	<option value="gamedev">Game Developer</option>
	<option value="mlengineer">Machine Learning Engineer</option>
	<option value="cloudpract">Cloud Practitioner</option>
	<option value="blockchaindev">Blockchain Developer</option>
  </select>
</div>

  <div class="rightContainer-type">
  <label for="jobVacancy" class="input-label-type">Job Vacancy:</label> <br>
  <select id="jobVacancy" v-model="numVacancy" class="small-box-input" required>
  <option value="" disabled selected>Select vacancy</option>
    <option value="1">1</option>
    <option value="2">2</option>
    <option value="3">3</option>
    <option value="4">4</option>
    <option value="5">5</option>
    <option value="6">6</option>
    <option value="7">7</option>
	<option value="8">8</option>
	<option value="9">9</option>
	<option value="10">10</option>
  </select>
</div>
  </div>

  <br>

  <label for="skill1" class="input-label">Skills:</label>
  <div class="input-container">
  <div class="leftContainer">
  <select id="skill1" v-model="skill1" class="skill-box-input" required>
  <option value="" disabled selected>Skill 1</option>
    <option value="JavaScript">JavaScript</option>
    <option value="Python">Python</option>
    <option value="Java">Java</option>
    <option value="SQL">SQL</option>
    <option value="C">C</option>
    <option value="R">R</option>
    <option value="Ruby">Ruby</option>
	<option value="C++">C++</option>
	<option value="Rust">Rust</option>
	<option value="Swift">Swift</option>
  </select>
</div>
<div class="rightContainer">
  <select id="skill2" v-model="skill2" class="skill-box-input" required>
  <option value="" disabled selected>Skill 2</option>
    <option value="JavaScript">JavaScript</option>
    <option value="Python">Python</option>
    <option value="Java">Java</option>
    <option value="SQL">SQL</option>
    <option value="C">C</option>
    <option value="R">R</option>
    <option value="Ruby">Ruby</option>
	<option value="C++">C++</option>
	<option value="Rust">Rust</option>
	<option value="Swift">Swift</option>
  </select>
</div>
</div>

<div class="input-container">
  <div class="leftContainer">
  <select id="skill3" v-model="skill3" class="skill-box-input" required>
  <option value="" disabled selected>Skill 3</option>
    <option value="JavaScript">JavaScript</option>
    <option value="Python">Python</option>
    <option value="Java">Java</option>
    <option value="SQL">SQL</option>
    <option value="C">C</option>
    <option value="R">R</option>
    <option value="Ruby">Ruby</option>
	<option value="C++">C++</option>
	<option value="Rust">Rust</option>
	<option value="Swift">Swift</option>
  </select>
</div>
<div class="rightContainer">
  <select id="skill4" v-model="skill4" class="skill-box-input" required>
  <option value="" disabled selected>Skill 4</option>
    <option value="JavaScript">JavaScript</option>
    <option value="Python">Python</option>
    <option value="Java">Java</option>
    <option value="SQL">SQL</option>
    <option value="C">C</option>
    <option value="R">R</option>
    <option value="Ruby">Ruby</option>
	<option value="C++">C++</option>
	<option value="Rust">Rust</option>
	<option value="Swift">Swift</option>
  </select>
</div>
</div>

<div class="input-container">
  <div class="leftContainer">
  <select id="skill5" v-model="skill5" class="skill-box-input" required>
  <option value="" disabled selected>Skill 5</option>
    <option value="JavaScript">JavaScript</option>
    <option value="Python">Python</option>
    <option value="Java">Java</option>
    <option value="SQL">SQL</option>
    <option value="C">C</option>
    <option value="R">R</option>
    <option value="Ruby">Ruby</option>
	<option value="C++">C++</option>
	<option value="Rust">Rust</option>
	<option value="Swift">Swift</option>
  </select>
</div>
<div class="rightContainer">
  <select id="skill6" v-model="skill6" class="skill-box-input" required>
  <option value="" disabled selected>Skill 6</option>
    <option value="JavaScript">JavaScript</option>
    <option value="Python">Python</option>
    <option value="Java">Java</option>
    <option value="SQL">SQL</option>
    <option value="C">C</option>
    <option value="R">R</option>
    <option value="Ruby">Ruby</option>
	<option value="C++">C++</option>
	<option value="Rust">Rust</option>
	<option value="Swift">Swift</option>
  </select>
</div>
</div>

<div class="input-container">
  <div class="leftContainer">
  <select id="skill7" v-model="skill7" class="skill-box-input" required>
  <option value="" disabled selected>Skill 7</option>
    <option value="JavaScript">JavaScript</option>
    <option value="Python">Python</option>
    <option value="Java">Java</option>
    <option value="SQL">SQL</option>
    <option value="C">C</option>
    <option value="R">R</option>
    <option value="Ruby">Ruby</option>
	<option value="C++">C++</option>
	<option value="Rust">Rust</option>
	<option value="Swift">Swift</option>
  </select>
</div>
<div class="rightContainer">
  <select id="skill8" v-model="skill8" class="skill-box-input" required>
  <option value="" disabled selected>Skill 8</option>
    <option value="JavaScript">JavaScript</option>
    <option value="Python">Python</option>
    <option value="Java">Java</option>
    <option value="SQL">SQL</option>
    <option value="C">C</option>
    <option value="R">R</option>
    <option value="Ruby">Ruby</option>
	<option value="C++">C++</option>
	<option value="Rust">Rust</option>
	<option value="Swift">Swift</option>
  </select>
</div>
</div>

  <br>

  <div>
  <label for="applicationDate" class="input-label">Application Deadline:</label> 
  <input type="date" id="applicationDate" v-model="deadline" :min="today" class="job-title-input" required>
</div>
<div class="button-container">
  <button class="styled-button" @click="writeTestData">Submit</button>
  <button class="styled-button-cancel" @click="cancelAndGoHome">Cancel</button>
</div>

<br><br>
</div>
</template>

<style>
#title-createJob {
    color: #01889F; 
    font-family:"Poppins";
    font-size: 35px; 
    font-weight: bold;
    text-align: left;
    margin: 30px 0 20px 30px;
}
.job-title-input {
  width: 97%;
  padding: 8px;
  border: 1px solid rgb(225, 225, 225);
  box-sizing: border-box;
  margin-top: 8px;
  margin-bottom: 0px;
  font-size: 15px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
  background-color: rgb(246, 244, 244);
  border-radius: 10px;
  opacity: 0.6;
  margin: 0;
  font-weight: 200;
  color: rgba(0, 0, 0, 0.84);
  margin: 10px 30px 20px 30px;
  font-family: "Poppins";
  font-weight: lighter;
}
.input-label {
	font-size: 18px;
	font-family:'Poppins';
	font-weight: 500;
  color: rgba(0, 0, 0, 0.84);
  margin: 10px 30px 20px 30px;
}

.input-label-type {
  font-size: 18px;
	font-family:'Poppins';
	font-weight: 500;
  color: rgba(0, 0, 0, 0.84);
}

.input-desc {
  width: 97%;
  padding: 8px;
  border: 1px solid rgb(225, 225, 225);
  box-sizing: border-box;
  font-size: 15px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
  background-color: rgb(246, 244, 244);
  border-radius: 10px;
  height: 120px;
  font-family:sans-serif;
  opacity: 0.6;
  margin: 10px 30px 20px 30px;
  font-weight: 200;
  color: rgba(0, 0, 0, 0.84);
  font-family: "Poppins";
  font-weight: lighter;
}
.input-quali {
  width: 97%;
  padding: 8px;
  border: 1px solid rgb(225, 225, 225);
  box-sizing: border-box;
  font-size: 15px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
  background-color: rgb(246, 244, 244);
  border-radius: 10px;
  height: 215px;
  font-family:sans-serif;
  opacity: 0.6;
  margin: 10px 30px 20px 30px;
  font-weight: 200;
  color: rgba(0, 0, 0, 0.84);
  font-family: "Poppins";
  font-weight: lighter;
}

.input-offer {
	width: 97%;
  padding: 8px;
  border: 1px solid rgb(225, 225, 225);
  box-sizing: border-box;
  font-size: 15px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
  background-color: rgb(246, 244, 244);
  border-radius: 10px;
  height: 120px;
  font-family:sans-serif;
  opacity: 0.6;
  margin: 10px 30px 20px 30px;
  font-weight: 200;
  color: rgba(0, 0, 0, 0.84);
  font-family: "Poppins";
  font-weight: lighter;
}
.input-container {
  display: flex;
  align-items: center; /* Optional, for vertical alignment */
  
}
.small-box-input{
  width: 500px;
  padding: 8px;
  border: 1px solid rgb(225, 225, 225);
  box-sizing: border-box;
  font-size: 15px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
  background-color: rgb(246, 244, 244);
  border-radius: 10px;
  opacity: 0.6;
  font-weight: 200;
  color: rgba(0, 0, 0, 0.84);
  font-family: "Poppins";
  font-weight: lighter;
}
.skill-box-input {
  width: 200px;
  padding: 8px;
  border: 1px solid rgb(225, 225, 225);
  box-sizing: border-box;
  margin: 10px 30px 20px 30px;
  font-size: 15px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
  background-color: rgb(246, 244, 244);
  border-radius: 10px;
  opacity: 0.6;
  font-weight: 200;
  color: rgba(0, 0, 0, 0.84);
  font-family: "Poppins";
  font-weight: lighter;
  
}
.small-box-input:invalid{
  color: rgba(0, 0, 0, 0.6);
  margin: 0;
}
.skill-box-input:invalid {
  color: rgba(0, 0, 0, 0.6);

}
.job-title-input:invalid {
  color: rgba(0, 0, 0, 0.6);
  margin: 0;
}

.leftContainer {
	padding-right: 200px;
}

#container-createJob {
	padding: 30px;
}
.button-container {
  display: flex;
  justify-content: center;
  margin-top: 20px; 
}

.styled-button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 15px;
  cursor: pointer;
  margin: 30px 10px 10px 30px;
  font-weight: 500;
  font-family: "Poppins";
  width: 100px;
  transition: background-color 0.1s, color 0.1s;
  background-color: #01889F;
  color: white;
}

.styled-button:hover {
  background-color: #017387; 
}

.styled-button:active {
  background-color: #016d80; 
}
.styled-button-cancel {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 15px;
  cursor: pointer;
  margin: 30px 10px 10px 30px;
  font-weight: 500;
  font-family: "Poppins";
  width: 100px;
  transition: background-color 0.1s, color 0.1s;
  background-color: #979797;
  color: white;
  margin-left: 20px; 
}

.styled-button-cancel:hover {
  background-color: #706e6e; 
}

.styled-button-cancel:active {
  background-color: #3e3e3e; 
}

#applicationDate {
  margin: 10px 30px 20px 30px;
}

.leftContainer-type, .rightContainer-type {
  margin: 10px 30px 20px 30px;
}

#division {
  width: 99%;
  margin-left: 20px;
}

</style>