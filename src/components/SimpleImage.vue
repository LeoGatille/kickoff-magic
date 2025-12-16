<script setup lang="ts">
defineProps<{
  src: string;
  alt: string;
}>();
</script>

<template>
  <img :src="src" :alt="alt" class="magic-item" />
</template>

<style scoped>
.magic-item {
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0.85;
  filter: drop-shadow(0 0 20px rgba(100, 200, 255, 0.4));
  transition: opacity 0.3s ease;
}
</style>
