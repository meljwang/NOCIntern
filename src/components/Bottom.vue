<script>
export default {
    name: "Bottom",
    data() {
        return {
        email: 'nocquery@nus.edu.sg',
        copySuccess: false,
        copyMessage: '',
        };
    },
    methods: {
        async copyEmail() {
        try {
            await navigator.clipboard.writeText(this.email);
            this.copySuccess = true;
            this.copyMessage = 'Email address copied!';
            // reset the message after a few seconds
            setTimeout(() => {
            this.copySuccess = false;
            this.copyMessage = '';
            }, 500); 
        } catch (err) {
            console.error('Failed to copy: ', err);
            this.copySuccess = true;
            this.copyMessage = 'Failed to copy email address. Please try manually.';
        }
        },
    },
}
</script>

<template>
    <div class="bottom">
        <div id="branding">
            <img src="../assets/TealNOCIntern_logo.png" id="teal-logo">
            <h2 id="noc-teal-word">NOCIntern</h2>
            <p id="address-line">21 Heng Mui Keng Terrace Level 5</p>
        </div>
        <div id="important-info">
            <div id="links">
                <p id="headers">Links</p>
                <router-link to = "/" class="feature-link"> Home </router-link> <br>
                <router-link to = "/companies" class="feature-link"> Company </router-link> <br>
                <router-link to = "/jobs" class="feature-link"> Jobs </router-link> <br>
            </div>
            <div id="socials">
                <p id="headers">NOC Socials</p>
                <a href="https://www.instagram.com/nusoverseascolleges/?hl=en" id=social-links>Instagram</a> <br>
                <a href="https://www.facebook.com/NUSOverseasColleges/" id=social-links>Facebook</a> <br>
                <a href="https://www.tiktok.com/@nusoverseascolleges" id=social-links>Tiktok</a> 
            </div>
            <div id="feedback">
                <p id="headers">Feedback</p>
                <button id=copy-email @click="copyEmail">Submit a feedback via Email</button>
                <p v-if="copySuccess" id="copy-success">{{ copyMessage }}</p>
            </div>
        </div>
    </div>
</template>

<style>

.bottom {
    display: flex;
    justify-content: flex-start;
}

#branding {
    text-align: center;
    margin-left: 5%;
}

#teal-logo {
    width: 30%;
    margin-top: 30px;
}

#noc-teal-word {
    font-family: "Poppins";
    color: black;
}

#address-line {
    color: grey;
    font-weight: lighter;
    font-family: "Poppins";
    font-size:small;
}

#important-info {
    display: flex;
    padding: 20px;
    width: 100%;
}

#links {
    margin-left: 15%;
}

#socials {
    margin-left: 15%;
}

#feedback {
    margin-left: 15%
}

.feature-link {
    text-decoration: none;
    color: grey;
    display: grid;
    font-weight: lighter;
    font-family: "Poppins"
}

#headers{
    font-weight: bold;
    font-family: "Poppins"
}

#social-links {
    color: grey;
    text-decoration: none;
    display: grid;
    font-weight: lighter;
    font-family: "Poppins"
}

#copy-email {
    font-family: "Poppins";
    font-weight: lighter;
    background-color: #01889F;
    color: white;
}

#copy-success {
    font-weight: lighter;
    color: black;
    font-family: "Poppins"
}
</style>