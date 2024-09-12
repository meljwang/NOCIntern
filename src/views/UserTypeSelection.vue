<template>
  <div id="app">
    <div class="container">
      <div class="selection-box">
        <h2>What type of user are you?</h2>
        <div class="options">
          <div @click="navigateToSignInStudent" class="option student">
            <img  src="@/assets/student-icon.png" alt="Student" class="icon">
            <p>Student</p>
          </div>
          <div @click="navigateToSignInCompany" class="option employer">
            <img src="@/assets/employer-icon.png" alt="Employer" class="icon">
            <p>Employer</p>
          </div>
        </div>
      </div>
      <br>
      <br>
      <div class="admin-link">
        If you are an Admin, <span @click="navigateToSignInAdmin" class="click-here">click here</span>.
      </div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    navigateToSignInStudent() {
      this.$router.push('/SignInStudent')
    },
    navigateToSignInCompany() {
      this.$router.push('/SignInCompany')
    },
    navigateToSignInAdmin() {
      this.$router.push('/SignInAdmin')
    }
  }
}
</script>

<style scoped>
h2   {
    margin-top: 60px;
    margin-left: 5px;
    color: black;
    font-weight: 400;
    font-size: 20px;

    
}
html, body, #app {
  font-family: "Poppins";
  text-align: center;
}

#app {
  display: flex;
  justify-content: center;
  align-items: center;
  background: url('@/assets/nus_background.jpeg') no-repeat center;
  background-size: cover;
  min-height: 70vw;
}

.container {
  height: 500px;
  background-color: white;
  padding: 10px;
  border-radius: 20px;
  margin-bottom: 150px;
}

.selection-box {
  margin-top: 20px;
}

.options {
  display: flex;
  justify-content: center;
  margin-top: 35px;
  gap: 20px;

}

.option {
  border-radius: 15px;
  padding: 30px; /* Responsive padding */
  cursor: pointer;
  display: flex;
  flex-direction: column; 
  align-items: center;
  justify-content: center;
  width: 400px; /* Responsive width */
  height: 200px; /* Responsive height */
  margin-left: 10px;
  margin-right: 10px;
  background-color: #D9D9D9;
  position: relative; /* Ensure that absolute positioning is relative to the option */
  display: flex;
  flex-direction: column;
  justify-content: center; /* Vertically center the text */
  align-items: center; /* Horizontally center the text */
  overflow: hidden;
  transition: box-shadow 0.3s;


}

.option:hover {
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2); /* Shadow for a lifting effect */
  transition: box-shadow 0.1s; /* Smooth transition for the shadow */
}

.icon {
  width: 250px; /* Set a fixed width larger than the card */
  height: 250px; /* Set a fixed height larger than the card */
  position: absolute;
  bottom: -48px; /* Negative value will push the icon outside the card */
  left: -50px; /* Adjust left position if you want it to overflow on the left side as well */
  opacity: 0.1;
  z-index: 0;
}

.option p {
  position: relative; /* Ensure the text appears above the icon */
  z-index: 1; /* Ensure the text appears above the icon */
  color: black;
  font-family: "Poppins";
  font-weight: 400;
  font-size: 23px;
  
}

.click-here {
  color: #01889F;
  cursor: pointer;
  font-family: "Poppins";
}

.click-here:hover {
  color: #20AAC2; 
}

.usertype-text p {
  color: black;
}

.admin-link {
  color: black;
  font-family: "Poppins";
  font-weight: 400;
  font-size: 18px;
  margin-top: 5px;
}



</style>

  