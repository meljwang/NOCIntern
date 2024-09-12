<template>
    <div id="detailed-view-ashley"> 
      <div class="job-header">
        <div class="company-logo-container">
            <img v-if="profilePhotoURL" :src="profilePhotoURL" class="company-logo" alt="Company Logo" />
        </div>
        <div class="title-and-apply">
          <div class="job-name">{{ jobTitle }}</div>
          <button @click="emitApplyClick" class="apply-button">Apply</button>
        </div>
        <div class="job-info">{{ company }} - {{ location }}</div>
        <router-link :to="`/CompanyDetails/${companyId}`" id="visit-company">Visit company page</router-link>
      </div>

      <div id="job_details_ashley">

        <h4 id="job-css">Job Description:</h4>
        <div class="job-css-text">{{ description }}</div>

        <h4 id="job-css">Qualifications:</h4>
        <div class="job-css-text">{{ qualifications }}</div>

        <h4 id="job-css">What we offer:</h4>
        <div class="job-css-text">{{ jobOffer }}</div>

      </div>

      <div id="additional_details_ashley">

        <div class="detail-item">
            <span id="job-css">Position Type: </span> &nbsp;
            <span class="detail-value">{{ positionType }}</span>
        </div>

        <br>

        <div class="detail-item">
            <span id="job-css">Work Term:</span> &nbsp;
            <span class="detail-value">{{ workTerm }}</span>
        </div>

        <br>

        <div class="detail-item">
            <span id="job-css">No Of Vacancies:</span> &nbsp;
            <span class="detail-value">{{ numVacancy }}</span>
        </div>

        <br>

        <div class="detail-item">
            <span id="job-css">Application deadline:</span> &nbsp;
            <span class="detail-value">{{ formattedApplicationDeadline }}</span>
        </div>

        <br>

      </div>

      <div class="skills-container">
        <span id="job-css">Skills:</span> &nbsp;
        <span class="skill-tag" v-for="skill in skills" :key="skill">{{ skill }}</span>
      </div>


    </div>
</template>


<script>

export default {

    props: {
        jobId: String,
        companyId: String,
        jobTitle: String,
        company: String,
        employerRating: Number,
        location: String,
        description: String,
        qualifications: String,
        positionType: String,
        skills: Array,
        workTerm: String,
        numVacancy: String,
        applicationDeadline: Object,
        jobOffer: String,
        profilePhotoURL: String,
        country: String,
    },

    computed: {
        // Convert the Firestore timestamp to a readable date string
        formattedApplicationDeadline() {
            if (this.applicationDeadline) {
                return this.applicationDeadline.toDate().toLocaleDateString("en-US", {
                    year: 'numeric', month: 'long', day: 'numeric'
                });
            }
            return '';
        }
    },

    methods: {

        emitApplyClick() {
            this.$emit('apply-clicked', { jobId: this.jobId, companyId: this.companyId, country:this.country,} ); 
        },
        
    }
};
</script>

<style>

.job-css-text {
    white-space: pre-wrap;
    font-family:"Poppins";
    color: #666; 
    font-weight:normal;
    font-size: 15px;
    margin-top: -10px;
}

#detailed-view-ashley {
    background: #fff;
    border: 1px solid #e1e1e1;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    margin-bottom: 20px; /* Space between each detailed job tile */
    padding: 15px; /* Padding around the content */
    width: 100%;
}

.company-logo-container {
  /* Container for the logo to control the sizing and spacing */
  flex-shrink: 0; /* Prevent logo from shrinking */
  margin-right: 20px; /* Spacing between logo and job title */
}

.company-logo {
  width: 80px; /* Set a fixed width for your logo */
  height: 80px; /* Set a fixed height for your logo */
  border-radius: 8px; /* Adjust border-radius to match design */
  object-fit: cover; /* Ensure the image covers the area */
  border: 1px solid #979797;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}


.rating {
    background: #f0f0f0;
    padding: 5px 10px;
    border-radius: 15px;
}

.job-header {
    display: flex;
    flex-direction: column;
}

.job-name {
    font-family: "Poppins";
    font-size: 1.4em;
    font-weight: normal;
    margin-bottom: 5px;
    color: black;
}

.job-info {
    font-size: 1em;
    color: #666;
    font-family: "Poppins";
    font-weight: normal;
}

#job_details_ashley,
#additional_details_ashley
 {
    margin-top: 10px;
    font-size: 0.9em;
    color: #666; 
    font-weight: normal;
    font-family: "Poppins";
}

#job-css {
    color:#01889F;
    font-family: "Poppins";
    font-weight: bold;
    font-size: medium;
}

.notes-input {
    color: #000;
}

.buttons-container {
    /* Container to hold buttons side by side */
    margin-top: 20px; /* Add some space above the buttons */
    text-align: center; /* Center the buttons */
}

.skills-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding: 10px 0;
}

.skill-tag {
    background-color: #e1e1e1;
    color: #333;
    padding: 5px 10px;
    border-radius: 15px;
    font-size: 0.8em;
}

.detail-item {
    display: flex;
    align-items: center;
}

.detail-label {
    font-weight: bold;
    color: #01889F;

}

.detail-value {
    font-weight: normal;
    color: #666666;
    font-family: "Poppins";
}

.apply-button {
    padding: 5px 15px; /* Adjust padding as needed */
    margin-left: auto;
    font-family: "Poppins";
    background-color: #01889F;
    color:white;
    font-weight: normal;
}

.apply-popup {
    /* style for the popup background */
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
}

.apply-popup-content {
    /* style for the popup content */
    background: white;
    padding: 20px;
    border-radius: 5px;
}

.title-and-apply {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

#visit-company {
    font-family: "Poppins";
    font-weight:lighter;
    color:#666666;
    text-decoration:none;
    font-size: smaller;
    margin-top: 5px;
}

#visit-company:hover{
    color:#01889F;
    text-decoration:underline
}

</style>