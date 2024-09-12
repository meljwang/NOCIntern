<template>
	<button class="styled-back-button" @click="backTrack">
		<img :src="arrowIconSrc" alt="Back" class="back-icon" />
	  Back
	</button>
  </template>
  
  <script>
  import arrowIcon from '@/assets/backarrow.png';
  export default {
	name: 'BackButton',
	data() {
    return {
      arrowIconSrc: arrowIcon
    };
  },
	methods: {
	  backTrack() {
		this.$emit('back'); 
	  },
	},
  };
  </script>

<style scoped>
.styled-back-button {
  background-color: #01889F;
  color: white;
  padding: 10px 20px; 
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px; 
  transition: background-color 0.1s;
  font-size: 17px;
  margin-left: 20px;
  font-family: "Poppins";
  width: 115px;
}


.styled-back-button:hover {
  background-color: #006c7f;
}

.styled-back-button:active {
  background-color: #015f6f; 
}

.back-icon {
  height: 20px; 
  width: auto; 
}
</style>