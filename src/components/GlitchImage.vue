<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  src: string;
  alt: string;
  isActive: boolean;
}>();

const containerClass = computed(() => {
  return {
    'glitch-container': true,
    'active': props.isActive
  };
});
</script>

<template>
  <div :class="containerClass">
    <img :src="src" :alt="alt" class="glitch-img" />
    <div class="glitch-layers">
      <div class="glitch-layer" :style="{ backgroundImage: `url(${src})` }"></div>
      <div class="glitch-layer" :style="{ backgroundImage: `url(${src})` }"></div>
      <div class="glitch-layer" :style="{ backgroundImage: `url(${src})` }"></div>
    </div>
  </div>
</template>

<style scoped>
.glitch-container {
  position: relative;
  width: 300px; /* Matching the previous max-width */
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.glitch-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0.85;
  filter: drop-shadow(0 0 20px rgba(100, 200, 255, 0.4));
  position: relative;
  z-index: 2;
}

.glitch-layers {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  pointer-events: none;
  opacity: 1; /* Always visible for glitch effect */
}

/* Base Glitch Effect (Always ON but subtle) */
.glitch-container .glitch-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0.7;
  mix-blend-mode: screen;
}

/* Layer specific offsets and colors - RGB channel separation */
.glitch-container .glitch-layer:nth-child(1) {
  filter: hue-rotate(0deg) saturate(2);
  animation: glitch-anim-1 2.5s infinite linear alternate-reverse;
  mix-blend-mode: lighten;
}

.glitch-container .glitch-layer:nth-child(2) {
  filter: hue-rotate(180deg) saturate(2);
  animation: glitch-anim-2 3s infinite linear alternate-reverse;
  mix-blend-mode: lighten;
}

.glitch-container .glitch-layer:nth-child(3) {
  filter: hue-rotate(90deg) saturate(1.5);
  animation: glitch-anim-3 2s infinite linear alternate-reverse;
  mix-blend-mode: screen;
}

/* Intensify on Active */
.glitch-container.active .glitch-layer:nth-child(1) {
  animation: glitch-anim-1-intense 0.4s infinite linear alternate-reverse;
  opacity: 1;
}

.glitch-container.active .glitch-layer:nth-child(2) {
  animation: glitch-anim-2-intense 0.4s infinite linear alternate-reverse;
  opacity: 1;
}

.glitch-container.active .glitch-layer:nth-child(3) {
  animation: glitch-anim-3-intense 0.4s infinite linear alternate-reverse;
  opacity: 1;
}

.glitch-container.active .glitch-img {
    filter: drop-shadow(0 0 25px rgba(200, 50, 255, 0.6)) hue-rotate(90deg);
    transition: filter 0.3s ease;
}


/* Keyframes for Subtle Glitch */
@keyframes glitch-anim-1 {
  0% { clip-path: inset(20% 0 80% 0); transform: translate(-2px, 1px); }
  20% { clip-path: inset(60% 0 10% 0); transform: translate(2px, -1px); }
  40% { clip-path: inset(40% 0 50% 0); transform: translate(-2px, 2px); }
  60% { clip-path: inset(80% 0 5% 0); transform: translate(2px, -2px); }
  80% { clip-path: inset(10% 0 70% 0); transform: translate(-1px, 1px); }
  100% { clip-path: inset(30% 0 50% 0); transform: translate(1px, -1px); }
}

@keyframes glitch-anim-2 {
  0% { clip-path: inset(10% 0 60% 0); transform: translate(2px, -1px); }
  20% { clip-path: inset(80% 0 5% 0); transform: translate(-2px, 2px); }
  40% { clip-path: inset(30% 0 20% 0); transform: translate(1px, -2px); }
  60% { clip-path: inset(15% 0 80% 0); transform: translate(-1px, 1px); }
  80% { clip-path: inset(55% 0 10% 0); transform: translate(2px, -1px); }
  100% { clip-path: inset(40% 0 30% 0); transform: translate(-2px, 2px); }
}

@keyframes glitch-anim-3 {
  0% { clip-path: inset(50% 0 30% 0); transform: translate(-2px, 2px); }
  20% { clip-path: inset(10% 0 80% 0); transform: translate(2px, -2px); }
  40% { clip-path: inset(90% 0 5% 0); transform: translate(-1px, 1px); }
  60% { clip-path: inset(25% 0 50% 0); transform: translate(1px, -1px); }
  80% { clip-path: inset(70% 0 20% 0); transform: translate(-2px, 1px); }
  100% { clip-path: inset(5% 0 60% 0); transform: translate(2px, -2px); }
}

/* Keyframes for Intense Glitch */
@keyframes glitch-anim-1-intense {
  0% { clip-path: inset(20% 0 80% 0); transform: translate(-10px, 5px); }
  20% { clip-path: inset(60% 0 10% 0); transform: translate(10px, -5px); }
  40% { clip-path: inset(40% 0 50% 0); transform: translate(-10px, 5px); }
  60% { clip-path: inset(80% 0 5% 0); transform: translate(10px, -10px); }
  80% { clip-path: inset(10% 0 70% 0); transform: translate(-5px, 5px); }
  100% { clip-path: inset(30% 0 50% 0); transform: translate(5px, -5px); }
}

@keyframes glitch-anim-2-intense {
  0% { clip-path: inset(10% 0 60% 0); transform: translate(10px, -5px); }
  20% { clip-path: inset(80% 0 5% 0); transform: translate(-10px, 10px); }
  40% { clip-path: inset(30% 0 20% 0); transform: translate(5px, -10px); }
  60% { clip-path: inset(15% 0 80% 0); transform: translate(-5px, 5px); }
  80% { clip-path: inset(55% 0 10% 0); transform: translate(10px, -5px); }
  100% { clip-path: inset(40% 0 30% 0); transform: translate(-10px, 10px); }
}

@keyframes glitch-anim-3-intense {
  0% { clip-path: inset(50% 0 30% 0); transform: translate(-10px, 10px); }
  20% { clip-path: inset(10% 0 80% 0); transform: translate(10px, -10px); }
  40% { clip-path: inset(90% 0 5% 0); transform: translate(-5px, 5px); }
  60% { clip-path: inset(25% 0 50% 0); transform: translate(5px, -5px); }
  80% { clip-path: inset(70% 0 20% 0); transform: translate(-10px, 5px); }
  100% { clip-path: inset(5% 0 60% 0); transform: translate(10px, -10px); }
}
</style>
