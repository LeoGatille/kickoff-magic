<script setup lang="ts">
import MysticCodeRain from './MysticCodeRain.vue';

defineProps<{
  active?: boolean
}>();
</script>

<template>
  <div class="parchment-container">
    <div class="parchment-bg"></div>
    <MysticCodeRain :active="active" />
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
  background-image: url('../assets/parchemin.png');
  background-size: cover;
  background-position: center;
  z-index: -2;
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
