<script setup lang="ts">
// Parchment Layout Component
</script>

<template>
  <div class="parchment-container">
    <div class="parchment-bg"></div>
    <div class="glyphs-overlay"></div>
    <div class="content-slot">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.parchment-container {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.parchment-bg {
  position: absolute;
  inset: 0;
  background-image: url('../assets/parchment_bg.png');
  background-size: cover;
  background-position: center;
  z-index: -2;
}

.glyphs-overlay {
  position: absolute;
  inset: 0;
  background-image: url('../assets/glyphs_pattern.png');
  background-repeat: repeat;
  background-size: 200px; /* Adjust size as needed */
  opacity: 0.7;
  z-index: -1;
  mask-image: radial-gradient(circle at center, transparent 20%, black 60%);
  -webkit-mask-image: radial-gradient(circle at center, transparent 20%, black 60%);
}

.content-slot {
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
