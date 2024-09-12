<script>
import { VueperSlides, VueperSlide } from 'vueperslides';
import 'vueperslides/dist/vueperslides.css';
import Beijing from "@/assets/Beijing.jpeg";
import Chicago from "@/assets/Chicago.jpeg";
import Chongqing from "@/assets/Chongqing.jpeg";
import Indonesia from "@/assets/Indonesia.jpeg";
import Japan from "@/assets/Japan.jpeg";
import London from "@/assets/London.jpeg";
import Malaysia from "@/assets/Malaysia.jpeg";
import Munich from "@/assets/Munich.jpeg";
import Newyork from "@/assets/Newyork.jpeg";
import Norway from "@/assets/Norway.jpeg";
import Paris from "@/assets/Paris.jpeg";
import Santiago from "@/assets/Santiago.jpeg";
import Shanghai from "@/assets/Shanghai.jpeg";
import SV from "@/assets/SiliconValley.jpeg"
import Singapore from  "@/assets/Singapore.jpeg";
import Stockholm from "@/assets/Stockholm.jpeg";
import Thailand from "@/assets/Thailand.jpeg";
import GreaterBay from "@/assets/GreaterBay.jpeg";
import Philippines from "@/assets/Philippines.jpeg";
import Toronto from  "@/assets/Toronto.jpeg";
import Vietnam from  "@/assets/Vietnam.jpeg";

export default {
    name: "ImageCarousel",
    components: { VueperSlides, VueperSlide },
    data: () => ({
        slides: [
        {
            title: "Beijing",
            image: Beijing
        },
        {
            title: "Chicago",
            image: Chicago
        },
        {
            title: "Chong Qing",
            image: Chongqing
        },
        {
            title: "Indonesia",
            image: Indonesia
        },
        {
            title: "Japan",
            image: Japan
        },
        {
            title: "London",
            image: London
        },
        {
            title: "Malaysia",
            image: Malaysia
        },
        {
            title: "Munich",
            image: Munich
        },
        {
            title: "New York",
            image: Newyork
        },
        {
            title: "Norway",
            image: Norway
        },
        {
            title: "Paris",
            image: Paris
        },
        {
            title: "Santiago",
            image: Santiago
        },
        {
            title: "Shanghai",
            image: Shanghai
        },
        {
            title: "Silicon Valley",
            image: SV
        },
        {
            title: "Singapore",
            image: Singapore
        },
        {
            title: "Stockholm",
            image: Stockholm
        },
        {
            title: "Thailand",
            image: Thailand
        },
        {
            title: "The Greater Bay Area",
            image: GreaterBay
        },
        {
            title: "Philippines",
            image: Philippines
        },
        {
            title: "Toronto",
            image: Toronto
        },
        {
            title: "Vietnam",
            image: Vietnam
        }
        ]
    })
}
</script>

<template>
    <div id="carousel-wrapper">
        <div id="vueper-carousell">
            <vueper-slides
                class="no-shadow"
                :visible-slides="3"
                :slide-ratio="1 / 4"
                :dragging-distance="70"
                :gap="3">
                <vueper-slide
                    v-for="(slide, i) in slides"
                    :key="i"
                    :title="slide.title"
                    :image="slide.image"
                    >
                    <template #content>
                        <h2 id="slide-name-title"> {{ slide.title }} </h2>
                    </template>
                </vueper-slide>
        
            </vueper-slides>
        </div>
    </div>
</template>

<style scoped>
#carousel-wrapper{
    display: flex;
    justify-content: center; /* Center horizontally */
    align-items: center; /* Center vertically (optional, if you want vertical centering) */
    margin-bottom: 2%;
}
#vueper-carousell {
    width:90%;
}

#slide-name-title {
    color: white;
    font-family: "Poppins";
}

</style>





