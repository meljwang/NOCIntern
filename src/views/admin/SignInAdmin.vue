<template>
    <br>
    <br>
    <div id="sign-in">
      <div class="sign-in-container">
        <img src="@/assets/admin.png" alt="Employer" class="icon">
        <h1 id="font-fix">Sign in as Admin</h1>
        <form @submit.prevent="onSubmit">
          <div class="form-group">
            <label id="font-fix" for="email">Email</label>
            <input type="email" id="email" v-model="user.email" required>
          </div>
          <div class="form-group">
            <label id="font-fix" for="password">Password</label>
            <input type="password" id="password" v-model="user.password" required>
          </div>
          <div class="form-group actions">
            <button type="submit" id="font-fix" class="sign-in-button" style = "margin-left:auto; margin-right:auto;">Log in</button>
          </div>
          <br>
          <br>
        </form>
      </div>
    </div>
  </template>
  
  <script>
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged} from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc } from 'firebase/firestore';
import firebaseApp from '/src/firebase.js';
const auth = getAuth(firebaseApp);

  export default {
    name: 'SignIn',
    data() {
      return {
        user: {
          email: '',
          password: ''
        }
      };
    },
    methods: {
      isValidEmail(email) {
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return pattern.test(email);
    },
      // Log-In Methods
      async onSubmit() {
        this.user.email = this.user.email.toLowerCase();
      if (!this.isValidEmail(this.user.email)) {
        alert("Please enter a valid email address.");
        return;
      }

      if (this.user.password.length < 6) {
        alert("Password must be at least 6 characters long.");
        return;
      }
      
      try {
        const db = getFirestore(firebaseApp);
        const companyRef = doc(db, "companies", this.user.email);
        const companyDoc = await getDoc(companyRef);

        const studentRef = doc(db, "students", this.user.email);
        const studentDoc = await getDoc(studentRef);

        const adminRef = doc(db, "admin", this.user.email);
        const adminDoc = await getDoc(adminRef);
        
        if (!companyDoc.exists() && !studentDoc.exists() && !adminDoc.exists()) {
          alert("Invalid Email, Please log in with a valid email!");
          return;
      }

        // Additional check for isCompany or isStudent being true to prevent sign-in
        if ((companyDoc.exists() && companyDoc.data().isCompany) || (studentDoc.exists() && studentDoc.data().isStudent)) {
            alert("You cannot sign in as a Company or Student.");
            return;
        }

        // Assume hardcoded data, admin control backend
        const userCredential = await signInWithEmailAndPassword(auth, this.user.email, this.user.password);
        const user = userCredential.user;
        
        // Successful sign in
        console.log('Successfully signed in!', user);
        // Redirect or update UI
        this.$router.push('/'); // go to home page
      } catch (error) {
        // Enhanced error handling
        let message = "";
        switch (error.code) {
          case 'auth/invalid-credential':
            message += "Incorrect password. Please try again.";
            break;
            case 'auth/too-many-requests':
            message += "Too many sign in attempts. Please contact admin to reset account!";
            break;
          default:
            message += error.message;
            break;
        }
        console.error(message);
        alert(message);
      }
    },
    }
  };
  </script>
  
  <style scoped>
  #sign-in {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }
  
  .sign-in-container {
    background-color: white;
    padding: 100px 100px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    width: 300%;
    max-width: 400px;
    border: 1px solid #ccc;
  }
  
  h1 {
    margin-bottom: 2rem;
    text-align: center;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
  }
  
  input[type="email"],
  input[type="password"] {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  .actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .forgot-password {
    text-decoration: none;
  }
  
  .forgot-password:hover {
    text-decoration: underline;
  }
  
  .sign-in-button {
    background-color: #01889F;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 165px;
  }
  
  .sign-in-button:hover {
    background-color: #01889F;
  }
  
  * {
    font-weight: bold;
    font-family: Arial, Helvetica, sans-serif;
    color:#01889F;
  }
  
  .new-account {
    text-align: center;
    margin-top: 1rem;
  }
  
  .create-account {
    color: #01889F;
    text-decoration: none;
  }
  
  .create-account:hover {
    text-decoration: underline;
  }

  .icon {
  width: 150px;
  height: 150px; 
  margin-bottom: 10px;
  margin-left: 125px;
}

#font-fix {
  font-family: "Poppins"
}
  </style>
  