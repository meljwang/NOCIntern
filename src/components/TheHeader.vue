<template>
    <header>
        <nav class="container-header">
            <div class="left-header">
                <img src="../assets/NOCIntern_logo.png" alt="NOCIntern Logo">
                <h1> NOCIntern </h1>
            </div>
            <ul class="center-header">
                <router-link to = "/" class="router-link"> Home </router-link> 
                <router-link to = "/companies" class="router-link"> Company </router-link> 
                <router-link to = "/jobs" class="router-link"> Jobs </router-link>
                <!---Company Exclusive-->
                <router-link v-if="isLoggedIn && userType === 'company'" to="/myListings" class="router-link"> My Listings </router-link>
                <!---Admin Exclusive-->
                <router-link v-if="isLoggedIn && userType === 'admin'" to="/manageCompanies" class="router-link"> Manage Companies </router-link>
                <router-link v-if="isLoggedIn && userType === 'admin'" to="/manageMentees" class="router-link"> Manage Students </router-link>
                
            </ul>
            <ul class="right-header">
                <router-link v-if="isLoggedIn && userType === 'student'" to="/profile" class="router-link"> Profile </router-link>
                <router-link  v-if="!isLoggedIn" to = "/UserTypeSelection" class="router-link"> Sign In </router-link>
                <router-link  v-else="!isLoggedIn" @click="handleSignOut" to = "/UserTypeSelection" class="router-link"> Sign Out </router-link>
            </ul>
        </nav>
    </header>
</template>

<script>
import { ref, onMounted } from 'vue';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import firebaseApp from '../firebase'; 

export default {
  setup() {
    const isLoggedIn = ref(false);
    const auth = getAuth(firebaseApp);
    const db = getFirestore(firebaseApp);
    const userType = ref(null); 

    const fetchUserType = async (userEmail) => {
      let docRef = doc(db, "students", userEmail);
      let docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().isStudent) {
        userType.value = 'student';
        isLoggedIn.value = true;
        return;
      }

      docRef = doc(db, "companies", userEmail);
      docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().isCompany) {
        userType.value = 'company';
        isLoggedIn.value = true;
        return;
      }
      isLoggedIn.value = false;

      docRef = doc(db, "admin", userEmail);
      docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().isAdmin) {
        userType.value = 'admin';
        isLoggedIn.value = true;
        return;
      }
      isLoggedIn.value = false;
    };

    onMounted(() => {
      onAuthStateChanged(auth, (user) => {
        if (user && user.email) {
          fetchUserType(user.email);
        } else {
          isLoggedIn.value = false;
          userType.value = null;
        }
      });
    });

    const handleSignOut = async () => {
      await signOut(auth);
    };

    return { isLoggedIn, handleSignOut, userType };
  },
};
</script>

<style>
header {
    background-color: #01889F;
    top: 0;
    left: 0;
    width: 100%;
    font-family: "Poppins";
    z-index: 1000;
}

h1 {
    font-weight: bold;
    color: white;
    font-family: "Poppins"
}

.container-header {
    display: flex;
    align-items: center;
    justify-content: space-between; 
    width: 100%;
}

.left-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-left: 2%;
}

.left-header img {
    max-width: 50px;
}

.center-header {
    color: white;
    display: flex;
    gap: 100px;
    list-style: none;
    align-items: center;
    justify-content: center;
}

.right-header {
    align-items: center;
    display: flex;
    gap: 60px;
    margin-right: 3%;
}

.router-link {
    text-decoration: none;
    color: white;
    font-family: "Poppins";
    font-weight: lighter;
}

.router-link:hover{
    font-weight: bold;
}
</style>