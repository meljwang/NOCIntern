<template>
  <h1 id="title-heading">Partnering Companies</h1>
  <div id="search-bar-wrapper">
    <input type="text" v-model="searchTerm" id="search_bar" placeholder="  Search for Companies" />
  </div>

  <div class="region-filters">
    <button 
      v-for="region in availableRegions" 
      :key="region" 
      :class="{ active: selectedRegion === region }" 
      @click="selectedRegion = region">
      {{ region }}
    </button>
  </div>

  <div v-if="isLoading" class="loading">
    Loading companies...
  </div>

  <div v-else>
    <div v-if = 'filteredCompanies.length' id="company-tile-container" >
      <div id="company-tile-wrapper">
        <smallCompanyTile
          v-for="company in filteredCompanies"
          :key="company.id"
          :companyID="company.id"
          :name="company.name"
          :location="company.location"
          :employerRating="company.rating"
          :noOfJobs="company.noOfJobs"
          :noOfReviews="company.noOfReviews"
          :profilePhotoURL="company.profilePhotoURL"
        />
      </div>
    </div>

    <div v-else class="no-results">
      No results found.
    </div>
  </div>
    <Bottom/>
</template>

  
<script>
import { getFirestore, collection, getDocs } from "firebase/firestore";
import firebaseApp from '../../firebase.js';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
const auth = getAuth(firebaseApp);
import smallCompanyTile from "../../components/smallCompanyTile.vue";
import Bottom from "../../components/Bottom.vue";

export default {
  data() {
    return {
      companies: [],
      searchTerm: '',
      isLoading: true,
      selectedRegion: 'All',
      authUser: '',
      availableRegions: ['All', 'Asia', 'Europe', 'North America', 'South America'],
    };
  },

  computed: {
    filteredCompanies() {
      return this.companies.filter(company => {
        const matchesSearchTerm = company.name.toLowerCase().includes(this.searchTerm.toLowerCase());
        const matchesRegion = this.selectedRegion === 'All' || company.region === this.selectedRegion;
        return matchesSearchTerm && matchesRegion;
      });
    }
  },
  components: {
    smallCompanyTile,
    Bottom
  },
  mounted() {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.authUser = user;
        } else {
          // User is signed out
          this.authUser = null;
        }
      }
      ),
    this.fetchCompanies();
  },
  methods: {
    async fetchCompanies() {
      this.isLoading = true;
      const db = getFirestore(firebaseApp);
      const companiesCollectionRef = collection(db, "companies");
      const companiesSnapshot = await getDocs(companiesCollectionRef);

      let companiesWithJobAndReviewCounts = [];
      for (const companyDoc of companiesSnapshot.docs) {
        const companyData = companyDoc.data();
        if (companyData.approved === "accepted") {  // Check if the company is accepted
          const jobsCollectionRef = collection(db, `companies/${companyDoc.id}/jobs`);
          const jobsSnapshot = await getDocs(jobsCollectionRef);
          
          const reviewsCollectionRef = collection(db, `companies/${companyDoc.id}/reviews`);
          const reviewsSnapshot = await getDocs(reviewsCollectionRef);

          companiesWithJobAndReviewCounts.push({
            id: companyDoc.id,
            ...companyData,
            noOfJobs: jobsSnapshot.size,
            noOfReviews: reviewsSnapshot.size
          });
        }
      }
      this.companies = companiesWithJobAndReviewCounts;
      this.isLoading = false;

      console.table(this.companies); 
    },
  },
};
</script>


<style>

#title-heading {
  color:#01889F;
  font-weight:bold;
  font-size:45px;
  margin-top:20px;
  margin-left: 40px;
}
#search-bar-wrapper {
  display: flex;
  justify-content: center;
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
    font-family: "Poppins";
}

#search-bar:focus {
    border-color: #01889F; 
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); 
}

.loading {
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

.region-filters {
  display: flex;
  justify-content: center; /* Centers the buttons horizontally */
  flex-wrap: wrap; /* Allows buttons to wrap on smaller screens */
  gap: 10px; /* Adds space between the buttons */
  margin-top: 20px; /* Space below the search bar */
}

.region-filters button {
  padding: 5px 10px;
  margin: 0 5px;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
  color: black;
  font-family: "Poppins";
  font-weight:lighter;
}

.region-filters button.active {
  background-color: #01889F;
  color: white;
  border-color: #01889F;
}

#company-tile-container {
  display: flex;
  justify-content: center;
  margin-top:2%;
}

#company-tile-wrapper {
  display: grid;
  grid-template-columns: repeat(4, 1fr); 
  grid-auto-rows: repeat(auto);
  width: 80%;
  row-gap: 3%;
  column-gap: 5%;
  margin-bottom: 150px;
}

@media (max-width: 1024px) {
  #company-tile-wrapper {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  #company-tile-wrapper {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  #company-tile-wrapper {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style>

