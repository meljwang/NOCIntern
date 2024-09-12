import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/home.vue";
import CreateJob from "@/views/company/createjob.vue";
import ViewListing from "@/views/company/viewListing.vue";
import MyListings from "@/views/company/mylistings.vue";
import ViewApplicants from "@/views/company/viewapplicants.vue";
import ApplicantDetails from "@/views/company/applicantdetails.vue";
import PartnerCompanies from "@/views/student/PartnerCompanies.vue";
import Jobs from "@/views/student/Jobs.vue";
import Application from "@/views/student/Application.vue";
import Profile from "@/views/student/Profile.vue";
import UserTypeSelection from "@/views/UserTypeSelection.vue";
import SignInStudent from "@/views/student/SignInStudent.vue";
import SignInCompany from "@/views/company/SignInCompany.vue";
import RegisterCompany from "@/views/company/RegisterCompany.vue";
import RegisterStudent from "@/views/student/RegisterStudent.vue";
import ForgetPasswordStudent from "@/views/student/ForgetPasswordStudent.vue";
import ForgetPasswordCompany from "@/views/company/ForgetPasswordCompany.vue";
import CompanyDetails from "@/views/company/companyDetails.vue";
import manageCompanies from "@/views/admin/manageCompanies.vue";
import viewCompany from "@/views/admin/viewCompany.vue";
import EditProfile from "@/views/student/EditProfile.vue";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import firebaseApp from "@/firebase";
import viewMentee from "@/views/admin/viewMentee.vue";
import manageMentees from "@/views/admin/manageMentees.vue";
import SignInAdmin from "@/views/admin/SignInAdmin.vue";
import JobListing from "@/views/company/jobListing.vue";

const routes = [
  {
    path: "/viewMentee/:menteeId",
    name: "viewMentee",
    component: viewMentee,
  },
  {
    path: "/manageMentees",
    name: "manageMentees",
    component: manageMentees,
  },
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/createJob",
    name: "CreateJob",
    component: CreateJob,
  },
  {
    path: "/myListings",
    name: "MyListings",
    component: MyListings,
  },
  {
    path: "/viewListing/:jobId",
    name: "ViewListing",
    component: ViewListing,
    props: true,
  },
  {
    path: "/viewApplicants/:jobId",
    name: "ViewApplicants",
    component: ViewApplicants,
    props: true,
  },
  {
    path: "/applicant-details/:jobId/:applicantId",
    name: "ApplicantDetails",
    component: ApplicantDetails,
    props: true,
  },
  {
    path: "/companies",
    name: "PartnerCompanies",
    component: PartnerCompanies,
  },
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/jobs",
    name: "Jobs",
    component: Jobs,
  },
  {
    path: "/apply",
    name: "Application",
    component: Application,
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
  },
  {
    path: "/viewCompany/:companyId",
    name: "viewCompany",
    component: viewCompany,
    props: true,
  },
  {
    path: "/manageCompanies",
    name: "manageCompanies",
    component: manageCompanies,
  },
  {
    path: "/CompanyDetails/:companyId",
    name: "CompanyDetails",
    component: CompanyDetails,
    props: true,
  },
  {
    path: "/createJob",
    name: "CreateJob",
    component: CreateJob,
  },
  {
    path: "/myListings",
    name: "MyListings",
    component: MyListings,
  },
  {
    path: "/viewListing/:jobId",
    name: "ViewListing",
    component: ViewListing,
  },
  {
    path: "/viewApplicants/:jobId",
    name: "ViewApplicants",
    component: ViewApplicants,
    props: true,
  },
  {
    path: "/jobListing/:companyId/:jobId",
    name: "JobListing",
    component: JobListing,
    props: true,
  },
  {
    path: "/applicant-details/:jobId/:applicantId",
    name: "ApplicantDetails",
    component: ApplicantDetails,
    props: true,
  },
  {
    path: "/companies",
    name: "PartnerCompanies",
    component: PartnerCompanies,
  },
  {
    path: "/jobs",
    name: "Jobs",
    component: Jobs,
  },
  {
    path: "/apply",
    name: "Application",
    component: Application,
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    beforeEnter: (to, from, next) => {
      const auth = getAuth(firebaseApp);
      onAuthStateChanged(auth, (user) => {
        if (user) {
          next();
        } else {
          next("/UserTypeSelection");
        }
      });
    },
  },
  {
    path: "/UserTypeSelection",
    name: "UserTypeSelection",
    component: UserTypeSelection,
  },
  {
    path: "/RegisterCompany",
    name: "RegisterCompany",
    component: RegisterCompany,
  },
  {
    path: "/RegisterStudent",
    name: "RegisterStudent",
    component: RegisterStudent,
  },
  {
    path: "/SignInStudent",
    name: "SignInStudent",
    component: SignInStudent,
  },
  {
    path: "/SignInCompany",
    name: "SignInCompany",
    component: SignInCompany,
  },
  {
    path: "/ForgetPasswordStudent",
    name: "ForgetPasswordStudent",
    component: ForgetPasswordStudent,
  },
  {
    path: "/ForgetPasswordCompany",
    name: "ForgetPasswordCompany",
    component: ForgetPasswordCompany,
  },
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/editProfile",
    name: "EditProfile",
    component: EditProfile,
  },
  {
    path: "/SignInAdmin",
    name: "SignInAdmin",
    component: SignInAdmin,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  },
});

export default router;
