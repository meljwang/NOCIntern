<template>
  <br />
  <br />
  <div id="StudentForm">
    <h1 id="font-fix">You're New Here!</h1>
    <form @submit.prevent="register">
      <div class="profile-photo" @click="triggerFileInput">
        <div v-if="form.profilePhotoURL" class="profile-photo-preview">
          <img :src="form.profilePhotoURL" alt="Profile Preview" />
        </div>
        <div v-else class="profile-photo-placeholder">
          <img src="@/assets/defaultprofilepicture.png" />
        </div>
        <div class="photo-prompt" style="color: #01889f;">Click to select a profile picture</div>
        <input
          type="file"
          id="profilePhoto"
          ref="profilePhoto"
          @change="onFileChange"
          style="display: none"
        />
      </div>
      <br />
      <div class="form-group">
        <label id="font-fix" for="name">Name</label>
        <input type="text" id="name" v-model="form.name" />
      </div>

      <div class="form-group">
        <label id="font-fix" for="email">Email</label>
        <input type="email" id="email" v-model="form.email" />
      </div>

      <div class="form-group">
        <label id="font-fix" for="password">Password</label>
        <input type="password" id="password" v-model="form.password" />
      </div>

      <div class="skills">
        <label id="font-fix">Skills</label>
        <div class="edit-section-container">
          <div v-for="skill in skills" :key="skill" id="section-column">
            <input
              type="checkbox"
              :id="skill"
              :value="skill"
              v-model="form.skills"
            />
            <label :for="skill" id="font-fix-light">{{ skill }}</label>
          </div>
        </div>
      </div>

      <div class="interests">
        <label id="font-fix">Interests</label>
        <div class="edit-section-container">
          <div
            v-for="interest in interests"
            :key="interest"
            id="section-column"
          >
            <input
              type="checkbox"
              :id="interest"
              :value="interest"
              v-model="form.interests"
            />
            <label :for="interest" id="font-fix-light">{{ interest }}</label>
          </div>
        </div>
      </div>

      <div class="country">
        <label for="nocDestination" id="font-fix">NOC Destination</label>
        <select id="nocDestination" v-model="form.country">
          <option disabled value="">Please select your NOC Destination</option>
          <option value="China">China</option>
          <option value="United States">United States</option>
          <option value="United Kingdom">United Kingdom</option>
          <option value="Chile">Chile</option>
          <option value="Sweden">Sweden</option>
          <option value="Canada">Canada</option>
          <option value="Indonesia">Indonesia</option>
          <option value="Malaysia">Malaysia</option>
          <option value="Germany">Germany</option>
          <option value="Japan">Japan</option>
          <option value="Norway">Norway</option>
          <option value="France">France</option>
          <option value="Singapore">Singapore</option>
          <option value="Thailand">Thailand</option>
          <option value="Philippines">Philippines</option>
          <option value="Vietnam">Vietnam</option>
        </select>
      </div>
      <br />

      <div class="noc-status">
        <label for="noc" id="font-fix"
          >Have you been accepted into the NOC programme?</label
        >
        <input
          type="text"
          id="noc"
          v-model="form.nocStatus"
          placeholder="OTP"
        />
      </div>

      <button type="submit" id="font-fix">Submit</button>
      <button type="button" @click="cancelForm" id="font-fix">Cancel</button>
    </form>
  </div>
</template>

<script>
import firebaseApp from "/src/firebase.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import defaultProfilePicture from '@/assets/defaultprofilepicture.png';

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

export default {
  name: "App",
  data() {
    return {
      form: {
        profilePhotoURL: "",
        isStudent: true,
        isCompany: false,
        name: "",
        email: "",
        skills: [],
        interests: [],
        country: "",
        nocStatus: "",
        companyEmail: "",
        jobRole: "",
        review: "",
      },
      skills: [
        "JavaScript",
        "Python",
        "Java",
        "SQL",
        "C",
        "R",
        "C++",
        "Rust",
        "Swift",
        "Ruby",
      ],
      interests: [
        "Software Engineering",
        "Game Development",
        "Artificial Intelligence",
        "Data Analyst",
        "Databases",
        "Cybersecurity",
        "Blockchain",
        "Internet of Things",
        "Cloud Computing",
        "Robotics",
      ],
    };
  },
  computed: {
    profilePhotoURL() {
      return this.form.profilePhotoURL;
    }
  },
  methods: {
    triggerFileInput() {
      this.$refs.profilePhoto.click();
    },

    onFileChange(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.form.profilePhotoURL = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },

    async uploadImage(file) {
      let filePath;
      if (!file) {
        file = await fetch(defaultProfilePicture)
          .then(response => response.blob())
          .catch(error => {
            console.error("Failed to load image", error);
            return null;
          });
        if (!file) {
          console.error("Default profile picture is not a valid blob.");
          return null;
        }
      }
      filePath = `studentprofilepictures/${this.form.email}`;
      const storageRef = ref(storage, filePath);
      try {
        const snapshot = await uploadBytes(storageRef, file);
        console.log(file);
        const photoURL = await getDownloadURL(snapshot.ref);
        return photoURL;
      } catch (error) {
        console.error("Error uploading file:", error);
        return null;
      }
    },

    async submitForm() {
      const file = this.$refs.profilePhoto.files[0]; // Directly access the file from the file input
      if (file) {
        const photoURL = await this.uploadImage(file);
        if (photoURL) {
          this.form.profilePhotoURL = photoURL; // Update the form with the actual file URL
        }
      }
      try {
        this.form.email = this.form.email.toLowerCase();
        const { password, ...restOfForm } = this.form;
        const studentDocRef = doc(db, "students", this.form.email);

        await setDoc(studentDocRef, restOfForm); // Only save the rest of the form data

        console.log("Document written with ID: ", studentDocRef.id);
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    },

    cancelForm() {
      console.log("Form cancelled");
      this.$router.go(-1);
    },

    validatePassword(password) {
      const minLength = 8; // Minimum length of password
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

      return (
        password.length >= minLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumber &&
        hasSpecialChar
      );
    },

    async register() {
      // Setting OTP, if does not match dont create the account.
      if (this.form.nocStatus !== "n0c$tudent") {
        alert("The OTP to create the account is invalid.");
        return; // Stop the registration process if the check fails
      }

      if (!this.validatePassword(this.form.password)) {
        alert(
          "Password does not meet the requirements. It must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 8 characters long."
        );
        return;
      }

      const file = this.$refs.profilePhoto.files[0];
        const photoURL = await this.uploadImage(file);

        if (photoURL) {
          this.form.profilePhotoURL = photoURL; // Set the Firebase URL
        } else {
          console.error("Failed to set a profile photo URL.");
          return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          this.form.email,
          this.form.password
        );
        const user = userCredential.user;
        alert("Registration successful!");
        await this.submitForm(); // Move this inside the try block
        await signOut(auth);
        console.log("SubmitForm ran");
        this.$router.go(-1);
      } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Error code:", errorCode, "Error message:", errorMessage);
        switch (errorCode) {
          case "auth/email-already-in-use":
            alert("The email address is already in use by another account.");
            break;
          case "auth/invalid-email":
            alert("The email address is invalid.");
            break;
          case "auth/operation-not-allowed":
            alert("Email/password accounts are not enabled. Contact support.");
            break;
          case "auth/weak-password":
            alert("The password is too weak.");
            break;
          default:
            alert("An error has occured, please try again.");
            break;
        }
        return;
      }
    },
  },
};
</script>

<style scoped>
.photo-prompt {
  margin-top: 10px;
  color: #01889f;
  text-align: center;
  font-size: 14px;
}

#StudentForm {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fff;
}
.clickable {
  cursor: pointer;
}

.profile-photo-preview img,
.profile-photo-placeholder img {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 2px solid #01889f;
  object-fit: cover;
  display: block;
  margin: 0 auto;
}

.form-group,
.skills,
.interests,
.countries,
.noc-status {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #01889f;
  font-weight: bold;
}

input[type="text"],
input[type="email"],
input[type="password"],
button,
input[type="checkbox"] {
  margin-top: 5px;
}

input[type="text"],
input[type="email"],
input[type="password"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  color: black;
}

button {
  padding: 10px 15px;
  background-color: #01889f;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background-color: #4cae4c;
}

.profile-photo {
  margin-bottom: 20px;
  text-align: center;
}

input[type="checkbox"] {
  margin-right: 10px;
}

.skills div,
.interests div,
.countries div {
  margin-top: 10px;
}

/* Adjustments for alignment */
.skills label,
.interests label,
.countries label {
  display: inline;
}

/* Styles for NOC Status */
.noc-status input[type="text"] {
  width: auto;
  display: inline-block;
  margin-right: 10px;
}

button[type="submit"] {
  background-color: #01889f;
  color: white;
}

button[type="button"] {
  background-color: #f0f0f0;
  color: #01889f;
  margin-left: 5px;
}

* {
  font-weight: bold;
  font-family: Arial, Helvetica, sans-serif;
  color: #01889f;
}

.profile-photo img {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 2px solid #01889f;
  object-fit: cover;
  display: block;
}

.skills div label,
.interests div label,
.countries div label {
  color: black;
}

.profile-photo img {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 2px solid #01889f;
  object-fit: cover;
  display: block;
}

.skills div label,
.interests div label,
.countries div label {
  color: black;
}

#country {
  color: black;
}

select {
  color: black;
}

#font-fix {
  font-family: "Poppins";
}

#font-fix-light {
  font-family: "Poppins";
  font-weight: normal;
  font-size: small;
  margin-top: 6px;
}

.edit-section-container {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  margin-top: 10px;
  margin-bottom: 1%;
}

#section-column {
  flex: 1 1 50%;
  display: flex;
}

#name,
#email,
#password,
#nocDestination,
#noc {
  font-family: "Poppins";
  font-weight: normal;
}
</style>