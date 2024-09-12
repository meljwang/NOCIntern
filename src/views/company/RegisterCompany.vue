<template>
  <div class="registration-form">
    <h1
      style="
        font-weight: bold;
        font-family: Poppins;
        color: #01889f;
      "
    >
      You're New Here!
    </h1>
    <form @submit.prevent="register">
      <div class="profile-photo" @click="triggerFileInput">
        <div v-if="form.profilePhotoURL" class="profile-photo-preview">
          <img :src="form.profilePhotoURL" alt="Profile Preview" />
        </div>
        <div v-else class="profile-photo-placeholder">
          <img src="@/assets/company_default_icon.jpeg" />
        </div>
        <div class="photo-prompt" style="color: #01889f;">Click to select company picture</div>
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
        <label for="name" id="font-fix">Company Name</label>
        <input type="text" id="name" v-model="form.name" required />
      </div>
      <div class="form-group">
        <label for="email" id="font-fix">Email</label>
        <input type="email" id="email" v-model="form.email" required />
      </div>
      <div class="form-group">
        <label for="password" id="font-fix">Password</label>
        <input type="password" id="password" v-model="form.password" required />
      </div>
      <div class="form-group">
        <label for="region" id="font-fix">Region</label>
        <select id="region" v-model="form.region" required>
          <option disabled value="">Please select a region</option>
          <option value="Asia">Asia</option>
          <option value="Europe">Europe</option>
          <option value="North America">North America</option>
          <option value="South America">South America</option>
        </select>
      </div>
      <div class="form-group">
        <label for="country" id="font-fix">Country</label>
        <select id="country" v-model="form.country">
          <option disabled value="">Please select a country</option>
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

      <div class="form-group">
        <label for="city" id="font-fix">City</label>
        <input type="text" id="city" v-model="form.city" required />
      </div>
      <div class="form-group">
        <label for="address" id="font-fix">Address</label>
        <input type="text" id="address" v-model="form.address" required />
      </div>
      <div class="form-group">
        <label for="description" id="font-fix">Description of Company</label>
        <textarea
          id="description"
          v-model="form.description"
          required
        ></textarea>
      </div>
      <h2
        style="
          font-weight: bold;
          font-family: Poppins;
          color: #01889f;
        "
      >
        Point of Contact Information:
      </h2>
      <div class="form-group">
        <label for="pocName" id="font-fix">Name</label>
        <input type="text" id="pocName" v-model="form.pocName" required />
      </div>
      <div class="form-group">
        <label for="designation" id="font-fix">Designation</label>
        <input
          type="text"
          id="designation"
          v-model="form.designation"
          required
        />
      </div>
      <div class="form-group">
        <label for="pocEmail" id="font-fix">Email</label>
        <input type="email" id="pocEmail" v-model="form.pocEmail" required />
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
import defaultProfilePicture from '@/assets/company_default_icon.jpeg';

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

export default {
  name: "CompanyRegistrationForm",
  data() {
    return {
      form: {
        profilePhotoURL: "",
        name: "",
        email: "",
        country: "",
        city: "",
        address: "",
        description: "",
        isStudent: false,
        isCompany: true,
        pocName: "",
        designation: "",
        pocEmail: "",
        region: "",
        rating: 0,
        studentList: [],
        approved: "pending",
        location: "",
      },
    };
  },
  computed: {
    profilePhotoURL() {
      return this.form.profilePhotoURL;
    }
  },
  watch: {
    "form.city": function (newVal, oldVal) {
      this.form.location = `${this.form.city}, ${this.form.country}`;
    },
    "form.country": function (newVal, oldVal) {
      this.form.location = `${this.form.city}, ${this.form.country}`;
    },
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
      filePath = `companyprofilepictures/${this.form.email}`;
      const storageRef = ref(storage, filePath);
      try {
        const snapshot = await uploadBytes(storageRef, file);
        const photoURL = await getDownloadURL(snapshot.ref);
        return photoURL;
      } catch (error) {
        console.error("Error uploading file:", error);
        return null; // Return null if there is an error during file upload
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
        alert(
          "Registration successful! Please wait for your company account to be approved by The Admin."
        );
        await this.submitForm(); 
        console.log("SubmitForm ran");
        await signOut(auth);
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
            alert("An error occurred has occured, please try again.");
            break;
        }
        return;
      }
    },

    async submitForm() {
      const file = this.$refs.profilePhoto.files[0];
      if (file) {
        try {
          const photoURL = await this.uploadImage(file);
          this.form.profilePhotoURL = photoURL;
        } catch (error) {
          console.error("Error uploading file:", error);
          alert("Failed to upload image. Please try again.");
          return;
        }
      }
      try {
        this.form.email = this.form.email.toLowerCase();
        const companyDocRef = doc(db, "companies", this.form.email);
        await setDoc(companyDocRef, this.form);
        console.log("Document written with ID: ", companyDocRef.id);
      } catch (e) {
        console.error("Error adding document: ", e);
        alert("Failed to save registration data. Please try again.");
      }
    },
  },
};
</script>

<style>
* {
  font-weight: bold;
  font-family: Arial, Helvetica, sans-serif;
  color: #01889f;
}

.registration-form {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fff;
}

.registration-form h1,
.registration-form h2 {
  color: #01889f;
  font-weight: bold;
}

.photo-prompt {
  margin-top: 10px;
  color: #01889f;
  text-align: center;
  font-size: 14px;
}

#description {
  height: 200px;
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

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #01889f;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="password"],
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  color: black;
}

.form-group input[type="file"] {
  border: none;
  padding: 0.5rem 0;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  margin-right: 0.5rem;
  cursor: pointer;
}

button[type="submit"] {
  background-color: #01889f;
  color: white;
}

button[type="button"] {
  background-color: #f0f0f0;
  color: #01889f;
}

#region {
  color: black;
}

#country {
  color: black;
}

#font-fix {
  font-family: "Poppins";
}

#name, #email, #password, #region, #country, #city, #address, #description, #pocName, #designation, #pocEmail {
  font-family: "Poppins";
  font-weight: normal;
}
</style>
