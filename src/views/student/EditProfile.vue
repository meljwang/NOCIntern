<script>
import { onMounted, ref } from "vue";
import firebaseApp from "../../firebase.js";
import { getDoc, doc, getFirestore, updateDoc } from "firebase/firestore";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "vue-router";

export default {
  name: "App",
  setup() {
    const db = getFirestore(firebaseApp);
    const skills = [
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
    ];
    const interests = [
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
    ];
    const countries = ["Norway", "China", "Vietnam", "Thailand", "USA"];
    const currentUser = ref(null);
    const auth = getAuth(firebaseApp);
    const router = useRouter();

    const form = ref({
      skills: [],
      interests: [],
      countries: [],
    });

    const fetchUserProfile = async () => {
      try {
        const docRef = doc(db, "students", currentUser.value.email);
        const queryStudent = await getDoc(docRef);
        if (queryStudent.exists()) {
          const data = queryStudent.data();
          form.value.skills = data.skills || [];
          form.value.interests = data.interests || [];
          form.value.countries = data.countries || [];
          form.value.profilePhotoURL =
            data.profilePhotoURL || "@/assets/defaultprofilepicture.png"; // Default image if none found
        } else {
          console.log("No such user document");
        }
      } catch (error) {
        console.error("Error getting documents: ", error);
      }
    };

    const update = async () => {
      try {
        const docRef = doc(db, "students", currentUser.value.email);
        const queryStudent = await getDoc(docRef);
        if (queryStudent.exists()) {
          await updateDoc(docRef, {
            skills: form.value.skills,
            interests: form.value.interests,
            countries: form.value.countries,
          });
          router.push({ name: "Profile" });
        } else {
          console.log("No such document");
        }
      } catch (error) {
        console.error("Error getting documents: ", error);
      }
    };

    const cancel = () => {
      router.push({ name: "Profile" });
    };

    onMounted(() => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          currentUser.value = user;
          fetchUserProfile();
        }
      });
    });

    const uploadProfilePhoto = async (file) => {
    const fileName = currentUser.value.email;
    const filePath = `studentprofilepictures/${fileName}`;
      const storage = getStorage(firebaseApp);
      const storageReference = storageRef(
        storage,
        `studentprofilepictures/${currentUser.value.email}`
      );

      try {
        const snapshot = await uploadBytes(storageReference, file);
        const photoURL = await getDownloadURL(snapshot.ref);
        const userDocRef = doc(db, "students", currentUser.value.email);
        await updateDoc(userDocRef, { profilePhotoURL: photoURL });
        form.value.profilePhotoURL = photoURL;
      } catch (error) {
        console.error("Failed to upload profile photo: ", error);
      }
    };

    const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        uploadProfilePhoto(file);
      }
    };

    const triggerFileInput = () => {
      const fileInput = document.getElementById('profilePhoto');
      if (fileInput) {
        fileInput.click();
      }
    };

    return { skills, interests, countries, form, update, cancel, handleFileChange, triggerFileInput };
  },
};
</script>

<template>
  <div>
    <h1 id="your-account">Your Account</h1>
  </div>
  <div id="edit-profile-page">
    <form id="form-edit-profile" @submit.prevent="update">
      <div id="profile-photo">
        <label id="section-title">Profile Photo</label>
      </div>
        <div class="profile-photo" @click="triggerFileInput">
          <div v-if="form.profilePhotoURL" class="profile-photo-preview">
            <img :src="form.profilePhotoURL" alt="Profile Preview" />
          </div>
          <div v-else class="profile-photo-placeholder">
            <img src="@/assets/defaultprofilepicture.png" />
          </div>
          <div class="photo-prompt">Click to change profile picture</div>
          <input
            type="file"
            id="profilePhoto"
            ref="profilePhoto"
            @change="handleFileChange"
            style="display: none"
          />
        </div>
      
      <div class="skills">
        <label id="section-title">Skills</label>
        <div class="edit-section-container">
          <div id="section-column" v-for="skill in skills" :key="skill">
            <input
              type="checkbox"
              :id="skill"
              :value="skill"
              v-model="form.skills"
            />
            <label id="section-attributes" :for="skill">{{ skill }}</label>
          </div>
        </div>
      </div>
      <div class="interests">
        <label id="section-title">Interests</label>
        <div class="edit-section-container">
          <div
            id="section-column"
            v-for="interest in interests"
            :key="interest"
          >
            <input
              type="checkbox"
              :id="interest"
              :value="interest"
              v-model="form.interests"
            />
            <label id="section-attributes" :for="interest">{{
              interest
            }}</label>
          </div>
        </div>
      </div>
      <div class="countries">
        <label id="section-title">Countries of Interest</label>
        <div class="edit-section-container">
          <div
            id="countries-column"
            v-for="country in countries"
            :key="country"
          >
            <input
              type="checkbox"
              :id="country"
              :value="country"
              v-model="form.countries"
            />
            <label id="section-attributes" :for="country">{{ country }}</label>
          </div>
        </div>
      </div>
      <button type="submit" @click="update()" id="update-changes">Update</button>
      <button type="button" @click="cancel" id="cancel-changes">Cancel</button>
    </form>
  </div>
</template>

<style>
#edit-profile-page {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 5%;
}

#form-edit-profile {
  width: 40%;
  background-color: white;
  padding: 40px;
  border-radius: 10px;
  border-style: ridge;
  margin-bottom: 2%;
}

#your-account {
  margin-left: 40px;
  color: #01889f;
  font-family: "Poppins";
  font-size: 45px;
  font-weight: bold;
}

#profile-photo {
  display: flex;
}

.photo-prompt {
  color: black;
  font-family: "Poppins";
  font-weight: normal;
}

#section-title {
  font-weight: bold;
  color: black;
  font-size: larger;
  font-family: "Poppins";
}

.edit-section-container {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  margin-top: 10px;
  margin-bottom: 1%;
}

#section-column {
  flex: 1 1 50%; /* This ensures that each skill takes up half of the container's width */
  display: flex;
  margin-bottom: 2%;
}

#section-attributes {
  color: black;
  font-weight: lighter;
  font-family: "Poppins";
  font-size: small;
}

#countries-column {
  flex: 1 1 50%;
  margin-bottom: 2%;
}

#cancelling-btn {
  margin-right: 50px;
  margin-top: 55px;
  margin-bottom: 50px;
  background-color: #01889f;
  color: white;
  text-align: center;
  font-family: "Poppins";
  font-weight: medium;
  font-size: medium;
  border-radius: 10px;
  border-style: none;
  padding: 15px;
  text-decoration: none;
}

#updating-btn {
  margin-right: 50px;
  margin-top: 55px;
  margin-bottom: 50px;
  background-color: #01889f;
  color: white;
  text-align: center;
  font-family: "Poppins";
  font-weight: medium;
  font-size: medium;
  border-radius: 10px;
  border-style: none;
  padding: 15px;
  text-decoration: none;
}

#update-changes, #cancel-changes {
  font-family: "Poppins";
}

</style>