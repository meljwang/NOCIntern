<script>
import firebaseApp from '../../firebase.js';
import { getFirestore, getDocs, collection } from "firebase/firestore";
import 'typeface-poppins';

const db = getFirestore(firebaseApp);

export default {
  name: 'ManageCompanies',
  data() {
  return {
    companies: [],
    currentStatus: 'All',  // Can be 'All', 'Accepted', 'Pending'
  };
},

  methods: {
    async fetchCompanies() {
      const companiesRef = collection(db, 'companies');
      const querySnapshot = await getDocs(companiesRef);
      this.companies = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(company => company.approved !== "rejected"); 
    },
  },

  computed: {
  filteredCompanies() {
    if (this.currentStatus === 'All') {
      return this.companies;
    }
    return this.companies.filter(company => company.approved === this.currentStatus.toLowerCase());
  },
  noCompaniesMessage() {
    switch (this.currentStatus) {
      case 'All':
        return 'There are no companies.';
      case 'Accepted':
        return 'There are no accepted companies.';
      case 'Pending':
        return 'There are no pending companies.';
      default:
        return 'No companies found.';
    }
  }
},
  async mounted() {
    await this.fetchCompanies();
  },
};
</script>

<template>
  <div class="manageCompanies-container">
    <h1 class="manageCompanies-title">Manage Companies</h1>
    
    <!-- Tabs for selecting the company status -->
    <div class="manageCompanies-tabs">
      <button 
        class="manageCompanies-button"
        :class="{ active: currentStatus === 'All' }"
        @click="currentStatus = 'All'"
      >All</button>
      <button 
        class="manageCompanies-button"
        :class="{ active: currentStatus === 'Accepted' }"
        @click="currentStatus = 'Accepted'"
      >Accepted</button>
      <button 
        class="manageCompanies-button"  
        :class="{ active: currentStatus === 'Pending' }"
        @click="currentStatus = 'Pending'"
      >Pending</button>
    </div>

    <div class="manageCompanies-card-container">
      <div v-if="filteredCompanies.length === 0">
        <h2 class="manageCompanies-sub-header">{{ noCompaniesMessage }}</h2>
      </div>
      <div v-else
           class="manageCompanies-company-card" 
           v-for="company in filteredCompanies" 
           :key="company.id"
      >
        <img 
          :src="company.profilePhotoURL" 
          alt="Company Logo" 
          class="manageCompanies-company-logo"
        />
        <div class="manageCompanies-company-info">
          <h2 class="manageCompanies-company-name">{{ company.name }}</h2>
          <p class="manageCompanies-company-location">{{ company.location }}</p>
        </div>
        <router-link
          :to="{ name: 'viewCompany', params: { companyId: company.id } }"
          class="manageCompanies-view-company-button"
        >
          View company
        </router-link>
      </div>
    </div>
  </div>
</template>



<style>
.manageCompanies-container {
  padding: 60px;
}

.manageCompanies-title {
  color: #01889F;
  font-family: "Poppins", sans-serif;
  font-size: 35px;
  font-weight: bold;
  margin: 0px 30px 20px 30px;
}

.manageCompanies-card-container {
  display: flex;
  flex-direction: column;
}

.manageCompanies-company-card {
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

.manageCompanies-company-logo {
  width: 90px; 
  height: 90px;
  border-radius: 50px;
  margin-right: 25px;
  margin-left: 10px;
  object-fit: cover;
}

.manageCompanies-company-info {
  flex-grow: 1;

}

.manageCompanies-company-name {
  font-family: "Poppins";
  font-size: 20px;
  font-weight: 500;
  margin: 0;
  color: black;
  text-align:left;

}

.manageCompanies-company-location {
  font-family: "Poppins";
  font-size: 15px;
  color: black;
  margin: 5px 0;
  font-weight: normal;
}

.manageCompanies-view-company-button {
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

.manageCompanies-view-company-button:hover {
  background-color: darken(#01889F, 10%);
}

.manageCompanies-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  padding: 10px;
  font-family: "Poppins", sans-serif; /* Ensuring the font family is consistent */
}

.manageCompanies-button {
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

.manageCompanies-button:not(:last-child)::after {
  content: '|'; /* This creates the divider */
  position: absolute;
  right: -10px; /* Position the divider to the right of the button */
  color: #adb5bd; /* Light shade of gray for the divider */
  font-weight: 1000; /* The weight of the font for the divider */
  font-size: 18px;
  font-weight: 400;
}

.manageCompanies-button:hover {
  background-color: #e2e6ea; /* Slightly darker gray on hover */
}

.manageCompanies-button.active {
  color: #ffffff; /* White text for active tab */
  background-color: #01889F; /* Custom teal color */
}

.manageCompanies-sub-header {
    color: black; 
    font-family:"Poppins";
    font-size: 20px;
    margin: 10px 30px 20px 30px;
    font-weight: normal;
    text-align: left;

}

</style>

