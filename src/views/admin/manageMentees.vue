<script>
import firebaseApp from '../../firebase.js';
import { getFirestore, getDocs, collection } from "firebase/firestore";
import 'typeface-poppins';

const db = getFirestore(firebaseApp);

export default {
  name: 'ManageMentees',
  data() {
  return {
    mentees: [],
    currentStatus: 'All',  // Can be 'All', 'Pending', or 'Confirmed'
  };
},
  methods: {
    async fetchMentees() {
      const menteesRef = collection(db, 'students');
      const querySnapshot = await getDocs(menteesRef);
      this.mentees = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    },
  },

  async mounted() {
    await this.fetchMentees();
    console.log(this.mentees)
  },

  computed: {
  filteredMentees() {
    if (this.currentStatus === 'All') {
      return this.mentees;
    }
    return this.mentees.filter(mentee => 
      (this.currentStatus === 'Pending' && mentee.companyEmail === '') ||
      (this.currentStatus === 'Confirmed' && mentee.companyEmail !== '')
    );
  },
  noStudentsMessage() {
    switch (this.currentStatus) {
      case 'All':
        return 'There are no students.';
      case 'Pending':
        return 'There are no pending students.';
      case 'Confirmed':
        return 'There are no confirmed students.';
      default:
        return 'No student found.';
    }
  }
},


};
</script>

<template>
  <div class="manageMentees-container">
    <h1 class="manageMentees-title">Manage Students</h1>
    
    <!-- Tabs for selecting the status -->
    <div class="manageMentees-tabs">
      <button
        class="manageMentees-button"
        :class="{ active: currentStatus === 'All' }"
        @click="currentStatus = 'All'"
      >All</button>
      <button
        class="manageMentees-button"
        :class="{ active: currentStatus === 'Pending' }"
        @click="currentStatus = 'Pending'"
      >Pending</button>
      <button
        class="manageMentees-button"
        :class="{ active: currentStatus === 'Confirmed' }"
        @click="currentStatus = 'Confirmed'"
      >Confirmed</button>
    </div>

    <div class="manageMentees-card-container">
      <!-- Conditional rendering based on mentee count -->
      <div v-if="filteredMentees.length === 0">
        <h2 class="manageMentees-sub-header">{{ noStudentsMessage }}</h2>
      </div>
      <div 
        class="manageMentees-mentee-card" 
        v-else
        v-for="mentee in filteredMentees" 
        :key="mentee.id"
      >
        <img 
          :src="mentee.profilePhotoURL" 
          alt="Student Photo" 
          class="manageMentees-mentee-photo"
        />
        <div class="manageMentees-mentee-info">
          <h2 class="manageMentees-mentee-name">{{ mentee.name }}</h2>
          <p class="manageMentees-mentee-details">
            Internship status: {{ mentee.companyEmail === '' ? 'Pending' : 'Confirmed' }}
          </p>
        </div>
        <router-link
          :to="{ name: 'viewMentee', params: { menteeId: mentee.id } }"
          class="manageMentees-view-mentee-button"
        >
          View student
        </router-link>
      </div>
    </div>
  </div>
</template>



<style>
.manageMentees-container {
  padding: 60px;
}

.manageMentees-title {
  color: #01889F;
  font-family: "Poppins", sans-serif;
  font-size: 35px;
  font-weight: bold;
  margin: 0px 30px 20px 30px;
}

.manageMentees-card-container {
  display: flex;
  flex-direction: column;
}

.manageMentees-mentee-card {
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

.manageMentees-mentee-photo {
  width: 90px; 
  height: 90px;
  border-radius: 50px;
  margin-right: 25px;
  margin-left: 10px;
  object-fit: cover;
}

.manageMentees-mentee-info {
  flex-grow: 1;

}

.manageMentees-mentee-name {
  font-family: "Poppins";
  font-size: 20px;
  font-weight: 500;
  margin: 0;
  color: black;
  text-align:left;

}

.manageMentees-mentee-location {
  font-family: "Poppins";
  font-size: 15px;
  color: black;
  margin: 5px 0;
  font-weight: normal;
}

.manageMentees-view-mentee-button {
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
}

.manageMentees-mentee-details {
    font-family: "Poppins";
    font-size: 15px;
    color: black;
    margin: 5px 0;
    font-weight: normal;
}

.manageMentees-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  padding: 10px;
  font-family: "Poppins", sans-serif; /* Ensuring the font family is consistent */
}

.manageMentees-button {
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

.manageMentees-button:not(:last-child)::after {
  content: '|'; /* This creates the divider */
  position: absolute;
  right: -10px; /* Position the divider to the right of the button */
  color: #adb5bd; /* Light shade of gray for the divider */
  font-weight: 1000; /* The weight of the font for the divider */
  font-size: 18px;
  font-weight: 400;
}

.manageMentees-button:hover {
  background-color: #e2e6ea; /* Slightly darker gray on hover */
}

.manageMentees-button.active {
  color: #ffffff; /* White text for active tab */
  background-color: #01889F; /* Custom teal color */
}

.manageMentees-sub-header {
    color: black; 
    font-family:"Poppins";
    font-size: 20px;
    margin: 10px 30px 20px 30px;
    font-weight: normal;
    text-align: left;

}


</style>


  