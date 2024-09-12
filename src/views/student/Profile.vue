<script>
import { ref, onMounted } from 'vue';
import { getFirestore, collection, getDocs, doc, getDoc, Timestamp, addDoc, updateDoc, setDoc, deleteDoc } from "firebase/firestore";
import firebaseApp from '../../firebase.js';
import ProgressBar from '@/components/ProgressBar.vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth';

    export default {
        name: "Profile",
        components: { ProgressBar },
        setup () {
            const db = getFirestore(firebaseApp);
            const jobs = ref([]);
            const currentTab = ref('PendingJobs'); // default is showing PendingJobs
            const progress  = ref(0);
            const progStatus = ref("A reminder to start applying for your internship!"); // default if no jobs applied or offered
            const studentName = ref(" ");
            const company = ref(" "); // need this to display company and store in correct company's review collection
            const studentJob = ref(" "); // need this to display role and store in correct company's review collection
            const studentEmail = ref(" "); // need this information to store review
            const isButtonDisabled = ref(false); // initially, the save review button is not disabled
            const currentUser = ref(null);
            const profilePhotoURL = ref("");
            const auth = getAuth(firebaseApp);
            const selectedRating = ref("No rating selected");
            const studentReview = ref('');
            const companyPhotoURL = ref("");
            const companyRating = ref(0);
            const numCompanyRatings = ref(0);
            const actionsNeeded = ref([]);
            const isAcceptDisabled = ref(false);
            const companyName = ref('');

            // for "Your Applications"
            const fetchJobs =  async (jobType) => {
                jobs.value = [];
                if (!currentUser.value) return; 
                try {
                    currentTab.value = jobType; // Update the current tab, either PendingJobs or ApprovedJobs
                    const docRef = doc(db, 'students', currentUser.value.email); 
                    const queryStudent = await getDoc(docRef);

                    if (queryStudent.exists()) {
                        const JobsRef = collection(db, `students/${currentUser.value.email}/${jobType}`);
                        const JobsSnapshot = await getDocs(JobsRef);

                        for (const documentSnapshot of JobsSnapshot.docs) {
                            const docData = documentSnapshot.data()
                            const companyNameRef = doc(db, `companies/${docData.companyId}`);
                            const queryCompany = await getDoc(companyNameRef);
                            const companyData = queryCompany.exists() ? queryCompany.data() : null;

                            const jobNameRef = doc(db, `companies/${docData.companyId}/jobs/${docData.jobId}`);
                            const queryJob = await getDoc(jobNameRef);
                            
                            if (queryJob.exists()) {
                                const jobData = queryJob.data();
                                let job = { id: documentSnapshot.id, company: companyData.name, role: jobData.jobTitle, dateApplied: documentSnapshot.data().dateApplied };
                                console.log(job.id);
                                jobs.value.push(job);
                            }
                        };
                    } else {
                        console.log("No such document");
                    }
                } catch (error) {
                    console.error("Error getting documents: ", error);
                }
            };


            // for "Application Progress"
            const compute = async () => {
                try {
                    const docRef = doc(db, 'students', currentUser.value.email); 
                    const queryStudent = await getDoc(docRef);

                    // to count pending jobs
                    const pendingJobsRef = collection(db, `students/${currentUser.value.email}/PendingJobs`);
                    const pendingJobsSnapshot = await getDocs(pendingJobsRef);
                    if (!pendingJobsSnapshot.empty) {
                        var numOfPendingJobs = pendingJobsSnapshot.docs.length;
                    } else {
                        var numOfPendingJobs = 0;
                    }

                    // to count offered jobs
                    const offeredJobsRef = collection(db, `students/${currentUser.value.email}/OfferedJobs`);
                    const offeredJobsSnapshot = await getDocs(offeredJobsRef);
                    if (!offeredJobsSnapshot.empty) {
                        var numOfOfferedJobs = offeredJobsSnapshot.docs.length;
                    } else {
                        var numOfOfferedJobs = 0;
                    }

                    
                    if (queryStudent.exists()) {
                        const data = queryStudent.data();
                        studentName.value = data["name"];
                        profilePhotoURL.value = data.profilePhotoURL;

                        // for reviews
                        if (data["review"] != "") {
                            isButtonDisabled.value = true;
                        } else if (data["jobRole"] == "" || data["companyEmail"] == "") {
                            isButtonDisabled.value = true;
                        }

                        // for progress bar
                        if (data["companyEmail"].length > 0) {
                            progress.value = 100;
                            progStatus.value = "Status: Congratulations on securing your internship!";
                            // to disable any accept buttons if there are still offers given
                            isAcceptDisabled.value = true;
                            console.log(isAcceptDisabled.value);
                            const companyNameRef = doc(db, `companies/${data["companyEmail"]}`);
                            const queryCompany = await getDoc(companyNameRef);
                            if (queryCompany.exists()) {
                                const companyData = queryCompany.data();
                                companyName.value = companyData["name"];
                            }
                        } else if (numOfOfferedJobs > 0) {
                            progress.value = 75;
                            progStatus.value = "Status: You have an offer!";
                        } else if (numOfPendingJobs > 0) {
                            progress.value = 50; 
                            progStatus.value = "Status: Your resume is making it's way to the employer(s)!";
                        } else {
                            progress.value = 25;
                            progStatus.value = "Status: A reminder to start applying for your internships!";
                        }  
                    } else {
                        console.log("No such document");
                    }
                } catch (error) {
                    console.error("Error getting documents: ", error);
                }
            };

            // load data to be displayed
            const feedbackForm = async () => {
                try {
                    const docRef = doc(db, 'students', currentUser.value.email);
                    const queryStudent = await getDoc(docRef);
                    if (queryStudent.exists()) {
                        const data = queryStudent.data();
                        company.value = data["companyEmail"];
                        studentJob.value = data["jobRole"];
                        studentEmail.value = data["email"];
                        studentReview.value = data["review"];
                        const companyDocRef = doc(db, 'companies', company.value) 
                        const queryCompanyPhoto = await getDoc(companyDocRef);
                        companyPhotoURL.value = queryCompanyPhoto.data().profilePhotoURL;
                    } else {
                        console.log("No such document");
                    }
                } catch (error) {
                    // console.error("No internship secured yet!", error);
                }
            };

            // save feedback into the companies' reviews' collection
            const saveReview = async () => {
                const confirmSaveReview = confirm("Confirm submission of review?");
                if (confirmSaveReview) {
                    try {
                        const reviewDocRef = collection(db, 'companies', company.value, 'reviews');
                        const newReview = {
                            companyEmail: company.value,
                            dateReview: Timestamp.fromDate(new Date()),
                            jobRole: studentJob.value,
                            nameStudent: studentName.value,
                            studentEmail: studentEmail.value,
                            rating: selectedRating.value, 
                            testimonial: studentReview.value,
                            profilePhotoURL: profilePhotoURL.value
                        };
                        const docRef = await addDoc(reviewDocRef, newReview);
                        const studentDocRef = doc(db, 'students', currentUser.value.email);
                        const queryStudent = await getDoc(studentDocRef);
                        if (queryStudent.exists()) {
                            try {
                                await updateDoc(studentDocRef, {
                                review: studentReview.value,
                                rating: selectedRating.value
                                });
                                console.log("Document updated successfully");

                                // update company rating 
                                const reviewsSnapshot = await getDocs(reviewDocRef);
                                // loop through every review to get the rating
                                reviewsSnapshot.forEach((reviewDoc) => { 
                                    companyRating.value += reviewDoc.data().rating;
                                    numCompanyRatings.value += 1;
                                });
                                // find the average rating
                                const avgCompanyRating = Math.ceil(((companyRating.value / numCompanyRatings.value) * 2)) / 2;
                                const companyDocRef = doc(db, 'companies', company.value);
                                // update the new average rating in the company rating attribute
                                await updateDoc(companyDocRef, {
                                    rating: avgCompanyRating
                                });
                                console.log("Rating updated successfully");
                                alert("Review submitted successfully!");

                            } catch (error) {
                                console.error("Error updating document:", error);
                            }
                            } else {
                            console.log("Document does not exist!");
                            }
                        isButtonDisabled.value = true;
                    } catch (error) {
                        console.error('Error adding review:', error);
                    }
                }
            };

            // to display offeredJobs (actions needed)
            const actions =  async () => {
                actionsNeeded.value = [];
                if (!currentUser.value) return; 
                try {
                    const docRef = doc(db, 'students', currentUser.value.email); 
                    const queryStudent = await getDoc(docRef);

                    if (queryStudent.exists()) {
                        const JobsRef = collection(db, `students/${currentUser.value.email}/OfferedJobs`);
                        const OfferedSnapshot = await getDocs(JobsRef);

                        for (const documentSnapshot of OfferedSnapshot.docs) {
                            const docData = documentSnapshot.data()
                            const companyNameRef = doc(db, `companies/${docData.companyId}`);
                            const queryCompany = await getDoc(companyNameRef);
                            const companyData = queryCompany.exists() ? queryCompany.data() : null;

                            const jobNameRef = doc(db, `companies/${docData.companyId}/jobs/${docData.jobId}`);
                            const queryJob = await getDoc(jobNameRef);
                            
                            if (queryJob.exists()) {
                                const jobData = queryJob.data();
                                let job = { id: documentSnapshot.id, company: companyData.name, role: jobData.jobTitle, dateApplied: documentSnapshot.data().dateApplied };
                                console.log(job.id);
                                actionsNeeded.value.push(job);
                            }
                        };
                    } else {
                        console.log("No such document");
                    }
                } catch (error) {
                    console.error("Error getting documents: ", error);
                }
            };

            const acceptOffer = async (jobRef) => {
                const confirmAcceptOffer = confirm("Confirm acceptance of this offer?");
                if (confirmAcceptOffer) {
                    const docId = jobRef;
                    const originalDocRef = doc(db, `students/${currentUser.value.email}/OfferedJobs`, docId);
                    const docSnapshot = await getDoc(originalDocRef);
                    if (docSnapshot.exists()) {
                        const docData = docSnapshot.data();
                        const jobId = docData["jobId"];
                        const companyId = docData["companyId"];

                        // move within student collection
                        const jobNameRef = doc(db, `companies/${companyId}/jobs/${jobId}`);
                        const queryJob = await getDoc(jobNameRef);
                        if (queryJob.exists()) {
                            const jobDetail = queryJob.data();
                            const roleAccepted = jobDetail["jobTitle"];
                            const studentDocRef = doc(db, 'students', currentUser.value.email);
                            await updateDoc(studentDocRef, {
                                companyEmail: companyId,
                                jobRole: roleAccepted
                            });
                            console.log("Document updated successfully")
                        }
                        await deleteDoc(originalDocRef);

                        // update within company - jobs - applications collection
                        const applicationRef = doc(db, `companies/${companyId}/jobs/${jobId}/applications/${currentUser.value.email}`);
                        await updateDoc(applicationRef, {
                            status: "confirmed"
                        });
                        alert("Job offer accepted!")
                    
                    } else {
                        console.log("Document does not exist!");
                    }
                    actions();
                    compute();
                    feedbackForm();
                }
                
            };

            const declineOffer = async (jobRef) => {
                const confirmDeclineOffer = confirm("Confirm declining this offer?");
                if (confirmDeclineOffer) {
                    const docId = jobRef;
                    const originalDocRef = doc(db, `students/${currentUser.value.email}/OfferedJobs`, docId);
                    const docSnapshot = await getDoc(originalDocRef);
                    if (docSnapshot.exists()) {
                        const docData = docSnapshot.data();
                        const jobId = docData["jobId"];
                        const companyId = docData["companyId"];

                        const newDocRef = doc(db, `students/${currentUser.value.email}/DeclinedJobs`, docId);
                        // move within student collection
                        await setDoc(newDocRef, docData);
                        await deleteDoc(originalDocRef);

                        // move within companies collection
                        const applicationRef = doc(db, `companies/${companyId}/jobs/${jobId}/applications/${currentUser.value.email}`);
                        await updateDoc(applicationRef, {
                            status: "declined"
                        });
                        alert("Job offer declined!");
                    } else {
                        console.log("Document does not exist!");
                    }
                    actions();
                    compute();
                }
                
            };

            onMounted(() => { 
                onAuthStateChanged(auth, (user) => {
                    if (user) {
                        currentUser.value = user;
                        fetchJobs(currentTab.value); // Call fetchJobs when the component mounts
                        compute();
                        feedbackForm();
                        actions();
                    } else {
                        // Handle the case where there is no user logged in
                        console.log("No user is logged in");
                    }
                });
            });

            return { jobs, currentTab, fetchJobs, progress, progStatus, studentName, studentJob, saveReview, isButtonDisabled, profilePhotoURL, selectedRating, studentReview, companyPhotoURL, actions, actionsNeeded, acceptOffer, declineOffer, isAcceptDisabled, companyName };
        },
        methods: {
            formatDate(timestamp) {
            if (timestamp) {
                const date = timestamp.toDate();
                return date.toLocaleDateString();
            }
            return '';
            },
        },
};
</script>

<template>
        <div id="welcome-top">
            <div class="profile-and-welcome">
                <img v-if="profilePhotoURL" :src="profilePhotoURL" alt="User Profile Photo" class="user-profile-photo">
                <h1 id="welcome-msg">Welcome back, {{ studentName }}</h1>
            </div>
            <router-link to="/editProfile" id="settings-btn">Edit Profile</router-link>
        </div>
        <div class="profile-page">
            <div id="progress-bar">
                <p id="applicant-prog">Application Progress</p>
                <div id="prog-bar-wrapper">
                    <ProgressBar :value="progress"/>
                </div>
                <p id="prog-status">{{ progStatus }}</p>
                
            </div>
        
            <div id="double-contain">
                <div id="statuses">
                    <p id="applicant-prog">Your Applications</p>
                    <div class="tabs">
                        <button id="pending-approve" :class="{ active: currentTab === 'PendingJobs' }" @click="fetchJobs('PendingJobs')">Pending</button> |
                        <button id="pending-approve" :class="{ active: currentTab === 'OfferedJobs' }" @click="fetchJobs('OfferedJobs')">Offered</button> |
                        <button id="pending-approve" :class="{ active: currentTab === 'RejectedJobs' }" @click="fetchJobs('RejectedJobs')">Rejected</button> |
                        <button id="pending-approve" :class="{ active: currentTab === 'DeclinedJobs' }" @click="fetchJobs('DeclinedJobs')">Declined</button>
                    </div>
                    <div class="status-container">
                        <table>
                            <thead>
                                <tr>
                                <th>Company</th>
                                <th>Job Role</th>
                                <th>Date Applied</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="job in jobs" :key="job.id">
                                <td>{{ job.company }}</td>
                                <td>{{ job.role }}</td>
                                <td>{{ formatDate(job.dateApplied) }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div id="review">
                    <p id="applicant-prog">Leave a Review</p>
                    <div v-if="companyName.length > 0" id="company-feedback-info">
                        <img :src="companyPhotoURL" alt="Company Profile Photo" class="company-feedback-photo">
                        <div id="role-company-display">
                            <p id="student-company-name">{{ companyName }}</p>
                            <p id="student-job-name">{{ studentJob }}</p>
                        </div>
                    </div>
                    
                    <div id="rating-div">
                        <label for="mySelect">Rating: </label>
                        <select id="mySelect" v-model.number ="selectedRating" :disabled="isButtonDisabled">
                        <p>Rating: {{ selectedRating }} out of 5 stars</p>
                        <option disabled value="">Please select a rating</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        </select>
                        <p id="student-feedback">Leave Review:</p>
                        <textarea id="input-feedback" v-model="studentReview" :disabled="isButtonDisabled" placeholder="Type your review here..."></textarea>
                        <button id="save-review-btn" v-on:click="saveReview()" :disabled="isButtonDisabled"> Submit </button>
                    </div>
                    
                </div>
            </div>
            <div id="actions-needed">
                <p id="applicant-prog">Actions needed</p>
                <div class="status-container">
                    <table>
                        <thead>
                            <tr>
                            <th>Company</th>
                            <th>Job Role</th>
                            <th>Date Applied</th>
                            <th>Offer Decision</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="job in actionsNeeded" :key="job.id">
                            <td>{{ job.company }}</td>
                            <td>{{ job.role }}</td>
                            <td>{{ formatDate(job.dateApplied) }}</td>
                            <td><button v-on:click="acceptOffer(job.id)" :disabled="isAcceptDisabled" class="accept-offer-btn">Accept</button>
                            <button v-on:click="declineOffer(job.id)" class="decline-offer-btn">Decline</button></td>
                            </tr>
                        </tbody>
                        
                    </table>
                </div>
            </div>
        </div>
</template>


<style>
#welcome-top {
    display: flex;
    justify-content: space-between;
    margin-left: 50px;
}

.profile-and-welcome {
    display: flex;
    align-items: center; 
    gap: 15px; 
}

.user-profile-photo {
    width: 100px; 
    height: 100px; 
    border-radius: 50%;
    object-fit: cover;
}

#welcome-msg {
    padding-left: 15px;
    margin-left: 20px;
    color: #01889F; 
    font-family:"Poppins";
    font-size: 45px; 
    font-weight: bold; 
}

#settings-btn {
    margin-right: 50px;
    margin-top: 55px;
    margin-bottom: 50px;
    background-color: #01889F;
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

#settings-btn:hover {
    background-color: #017387;
}

.profile-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
}

#progress-bar {
    border-radius: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    width: 94%;
    text-align: center;
}

#applicant-prog {
    text-align: left;
    font-size: 20px;
    margin-left: 20px;
    margin-bottom: 2%;
    color: #01889F; 
    font-family:"Poppins";
    font-weight: bold;
}

#prog-bar-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
}

#prog-status {
    font-weight: lighter;
    font-family: "Poppins";
    color: black;
}

#double-contain {
    margin: 20px;
    display: flex;
    justify-content: space-between;
    width: 94%
}

#statuses {
    border-radius: 20px;
    width: 49%;
    background-color: #F5F5F5;    
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.status-container {
    width: 100%;
    margin-top: 2%;
    margin-bottom: 2%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-bottom: 2%;
}

.status-container table {
    width: 98%; 
    table-layout: fixed; 
    background-color: white;
    border-radius: 5px;
    padding: 8px;
}

.status-container th {
    text-align: left; 
    width: 33.3333%;
    font-weight: bold;
    border-bottom: 1px solid grey;
}

.status-container td {
    text-align: left; 
    width: 33.3333%;
    font-weight: lighter;
    color: black;
    border-bottom: 1px solid grey;
}

#review {
    display: block;
    border-radius: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    width: 49%;
    background-color: #F5F5F5;
}

#company-feedback-info {
    display: flex;
    margin-left:20px;
    margin-bottom: 10px;
}

#student-company-name {
    font-family: "Poppins";
    color: black;
    margin-left: 20px;
    font-weight:600;
    font-size: normal;
    margin-top: 5px;
    margin-bottom:0px;
}

#student-job-name {
    font-family: "Poppins";
    color: black;
    margin-left: 20px;
    font-weight:lighter;
    font-size: normal;
    margin-top: 0px;
}

.company-feedback-photo {
    width: 60px;
    height: 60px;
    border-radius: 30%;
    object-fit: cover;
}

#rating-div {
    align-items: center;
}

label[for="mySelect"] {
    margin-left: 20px;
    font-family: "Poppins";
    color: black;
    font-weight: Bold; 
}

#mySelect {
    margin-left: 20px;
    font-family: "Poppins";
    color: black;
    font-weight: lighter;
    border-radius: 5px; 
}

#mySelect:disabled {
    background-color: #c7c7c7;
    color: #7c7c7c;
    cursor: not-allowed;
}

#student-feedback {
    margin-left: 20px;
    font-family: "Poppins";
    color: black;
    font-weight: bold; 
}

#save-review-btn {
    margin-top: 10px;
    margin-bottom: 15px;
    margin-left: 20px;
    background-color: #01889F;
    color: white;
    font-family: "Poppins";
}

#save-review-btn:disabled {
    background-color: #c7c7c7;
    color: #7c7c7c;
    cursor: not-allowed;
}

#pending-approve {
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    color: black; /* Text link color, adjust as needed */
    font-family: "Poppins";
    font-weight: lighter;
    font-size: medium;
    text-decoration: bold;
    cursor: pointer; /* To show it's clickable */
    outline: none; /* Removes the focus outline */
    margin: 0%;
}

#pending-approve.active {
    font-weight: bold;
}

.tabs {
    margin-left: 20px;
}

#input-feedback {
    width: 90%;
    height: 50%;
    padding: 10px;
    margin-left: 20px;
    margin-right: 20px;
    font-family: "Poppins";
    font-weight:lighter;
    color: black;
    border-radius: 5px;
}

#input-feedback:disabled {
    background-color: #c7c7c7;
    color: #7c7c7c;
    cursor: not-allowed;
}

.accept-offer-btn {
    background-color: #01889F;
    color: white;
}

.accept-offer-btn:disabled {
    background-color: #c7c7c7;
    color: #7c7c7c;
    cursor: not-allowed;
}

.decline-offer-btn {
    background-color: #979797;
    color: white;
}

#actions-needed {
    border-radius: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    width: 94%;
    text-align: center;
    margin-bottom: 2%;
}

th {
    font-family: "Poppins";
}
</style>