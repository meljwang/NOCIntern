<script>
export default {

}
</script>

<template>
    <div class="features">
        <div id="feature-card">
            <img src= "../assets/DiscoverOpp.jpg" id="feature-icon">
            <h3 id="feature-title">Discover Opportunities</h3>
            <p id="feature-desc">Preview potential roles and companies across the globe, tailed to your entrepreneurial spirit and career aspirations.</p>
        </div>
        <div id="feature-card">
            <img src= "../assets/StrategiseChoice.jpg" id="feature-icon">
            <h3 id="feature-title">Strategise Your Choices</h3>
            <p id="feature-desc">Use the insights gleaned from detailed job previous to refine you program country selection.</p>
        </div>
        <div id="feature-card">
            <img src= "../assets/SeamlessApp.jpg" id="feature-icon">
            <h3 id="feature-title">Seamless Applications</h3>
            <p id="feature-desc">Once your NOC adventure is set to begin, shift gears on the same platform to apply directly to the job openings that inspire you.</p>
        </div>
        <div id="feature-card">
            <img src= "../assets/EngageAdv.jpg" id="feature-icon">
            <h3 id="feature-title">Engage with Advisors</h3>
            <p id="feature-desc">For NOC Advisors, the portal offers a streamlined oversight platform to track advisees' proress, manage job listings and uphold the NOC programme's excellence.</p>
        </div>
    </div>
    
</template>

<style>
.features {
    background-color: #B0DBE2;
    padding: 20px;
    display: grid;
    grid-template-columns: repeat(2, 1fr); /* 2 columns with equal width */
    grid-template-rows: repeat(2, 1fr); /* 2 rows with equal height */
}

#feature-card {
    background-color: white;
    align-items: center;
    justify-content: center;
    border-radius: 20px;
    margin: 30px;
    padding: 20px;
    text-align: center;
}

#feature-icon {
    width: 15%;
}

#feature-title {
    font-family: "Poppins";
    font-weight: bold;
    color: black;
    margin-top: 15px;
}

#feature-desc {
    font-family: "Poppins";
    text-align: center;
    color: black;
    font-weight:lighter;
}
</style>