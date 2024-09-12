<template>
  <br>
  <br>
  <div id="forgot-password-form">
    <h2>Reset Your Password</h2>
    <form @submit.prevent="submitForgotPassword">
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" v-model="email" required>
      </div>
      <button type="submit">Send Reset Email</button>
      <button type="button" @click="cancelForm">Cancel</button>
      <p v-if="message">{{ message }}</p>
    </form>
  </div>
</template>

<script>
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import firebaseApp from '/src/firebase.js';
import { getFirestore, collection, doc, setDoc, getDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default {
  name: 'ForgotPassword',
  data() {
    return {
      email: '',
      message: ''
    };
  },
  methods: {
    async submitForgotPassword() {
      this.email = this.email.toLowerCase();
      const auth = getAuth(firebaseApp);
      try {
        const db = getFirestore(firebaseApp);
        const companyRef = doc(db, "companies", this.email);
        const companyDoc = await getDoc(companyRef);
        if (!companyDoc.exists()) {
            alert("Invalid Email, Please enter a valid email!");
          return;
         }
        await sendPasswordResetEmail(auth, this.email);
        this.message = 'Password reset email sent. Check your inbox.';
      } catch (error) {
        alert("An error occurred has occured, please try again.");
      }
    },
    cancelForm() {
      console.log('Form cancelled');
      this.$router.go(-1);
  },
  }
}
</script>

<style scoped>
#forgot-password-form {
  max-width: 400px;
  height: 200px;
  margin: auto;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input[type="email"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

button[type="submit"] {
background-color: #01889F;
color: white;
}

button[type="button"] {
background-color: #f0f0f0; 
color: #01889F;
margin-left: 5px;
}

p {
  color: #333;
}
</style>
