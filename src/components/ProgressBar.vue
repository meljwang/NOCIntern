<script>
import LvProgressBar from 'lightvue/progress-bar';

export default {
  props: {
    // Define 'value' as a prop instead of data property
    value: {
      type: Number,
      default: 33.3 // You can set a default value if you want
    }
  },
  components: {
    LvProgressBar: LvProgressBar // No need for quotes if the name is a variable
  },
};
</script>

<template>
    <div id="prog">
      <LvProgressBar :value="value" :showValue="false" color="#38b2ac" />
    </div>
</template>

<style>
#prog {
    width: 90%

}
</style>