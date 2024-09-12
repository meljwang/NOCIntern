<template>
  <div id="jobtile_ashley" @click="emitJobClick"> 

    <div id="job-header_ashley">
      <div id="job-name-title">
        {{ jobTitle }}
        <div v-if="isRecommended" id="recommendation-icon">
          <img :src="reccomended" alt="reccomendation" class="recc-icon"/>
        </div>
      </div>
    </div>

    <div id="job-details_ashley">
      <div id="employer-details_ashley">
        <div><img v-if="profilePhotoURL" :src="profilePhotoURL" class="employer-logo" alt="Employer Logo" /></div>
        <div id="job-employer-name">
          {{ company }}
          <div id="job-page-loc">{{ location }}</div>
          <div v-if="employerRating > 0">
            <span v-for="star in 5" :key="star" class="star" 
            :class="{
              'fas fa-star': star <= parseFloat(employerRating), 
              'fas fa-star-half-alt': star > parseFloat(employerRating) && star < parseFloat(employerRating) + 1, 
              'far fa-star': star > parseFloat(employerRating)
            }">
            </span>
          </div>
          <div v-else class="no-rating">
            No ratings yet
          </div>
        </div>
      </div>
      
    
      <div id="skills-container-job">
        <span v-for="(skill, index) in skill" :key="index" id="skill-tag">{{ skill }}</span>
      </div>
    </div>
  </div>
</template>



<script>
import reccomended from '@/assets/insignia.png';


export default {
    props: {
        jobTitle: String,
        company: String,
        employerRating: Number,
        location: String,
        skill: Array,
        jobID: String,
        companyID: String,
        isRecommended: Boolean,
        profilePhotoURL: String,
    },

    data() {
    return {
      reccomended: reccomended,
    };
  },
    
    
    methods: {
        emitJobClick() {
            console.log(this.profilePhotoURL)
            this.$emit('jobClick', {
                jobId: this.jobID,
                companyId: this.companyID
            });
        }
    }

};
</script>

<style>

#jobtile_ashley {
    background: #fff;
    border: 1px solid #e1e1e1;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    cursor: pointer;
    margin-bottom: 6%;
}

#job-header_ashley {
    background: #f5f5f5;
    padding: 10px;
    display: flex;
    align-items: center;
}

#job-name-title{
    font-size: medium;
    font-weight: normal;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-grow: 1; 
    font-family: "Poppins";
    color: black;
}

#job-employer-name {
  font-family: "Poppins";
  color:black;
  font-weight:lighter;
  margin-left: 20px;
  justify-content: center;
}

#recommendation-icon {
    margin-left: auto; 
}

#job-details_ashley {
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 5px;
}

#job-page-loc {
  text-align: right;
  font-family: "Poppins";
  color: gray;
  font-size: smaller;
  font-weight: normal;
  padding-left: 0px;
  display: flex;
}

#star-container_ashley {
    display: flex;
    flex-direction: row;
}

#employer-details_ashley {
  display: flex;
  align-items: left;
  padding: 10px 0;
}

#skills-container-job {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding-left: 5px;
}

#skill-tag {
    color: #333;
    padding: 5px 10px;
    border-radius: 15px;
    font-size: 0.8em;
    background-color: #01889F;
    color: #FFFFFF;
    font-family: "Poppins";
    font-weight: lighter;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.no-rating {
  text-align: left;
  color: #757575;
  font-style: italic;
  margin-top: 5px; 
}

.employer-logo {
  width: 60px;
  height: 60px; 
  border-radius: 4px; 
  object-fit: cover;
  margin-top: 5px; 
}

.recc-icon {
  height: 30px;
  width: 30px
}


</style>
