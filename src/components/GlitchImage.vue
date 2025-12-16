<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  src: string;
  alt: string;
  isActive: boolean;
}>();

// Canvas reference for particles
const particlesCanvas = ref<HTMLCanvasElement | null>(null);
let animationFrameId: number | null = null;
let particles: Particle[] = [];

// Particle interface
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  life: number;
  maxLife: number;
  flicker: boolean;
  flickerPhase: number;
}

// Particle system
const createParticle = (canvasWidth: number, canvasHeight: number): Particle => {
  // Spawn from edges
  const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
  let x = 0, y = 0;
  
  switch(edge) {
    case 0: // top
      x = Math.random() * canvasWidth;
      y = 0;
      break;
    case 1: // right
      x = canvasWidth;
      y = Math.random() * canvasHeight;
      break;
    case 2: // bottom
      x = Math.random() * canvasWidth;
      y = canvasHeight;
      break;
    case 3: // left
      x = 0;
      y = Math.random() * canvasHeight;
      break;
  }

  // 90% magical colors, 10% corrupted RGB
  const isCorrupted = Math.random() < 0.1;
  const magicalColors = ['#FFD700', '#00FFFF', '#9D00FF'];
  const rgbColors = ['#FF0000', '#00FF00', '#0000FF'];
  
  const color = isCorrupted 
    ? rgbColors[Math.floor(Math.random() * rgbColors.length)]!
    : magicalColors[Math.floor(Math.random() * magicalColors.length)]!;

  return {
    x,
    y,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    size: Math.floor(Math.random() * 3) + 1, // 1-3 pixels
    color,
    opacity: Math.random() * 0.4 + 0.5, // 50% to 90%
    life: 0,
    maxLife: Math.random() * 100 + 50,
    flicker: Math.random() < 0.2, // 20% flicker
    flickerPhase: 0
  };
};

const updateParticles = (canvasWidth: number, canvasHeight: number) => {
  // Add new particles
  if (particles.length < 80) {
    particles.push(createParticle(canvasWidth, canvasHeight));
  }

  // Update existing particles
  particles = particles.filter(particle => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.life++;
    particle.flickerPhase += 0.1;

    // Fade out as life progresses (disintegration effect)
    const lifeRatio = particle.life / particle.maxLife;
    particle.opacity = (1 - lifeRatio) * (Math.random() * 0.4 + 0.5);

    // Remove dead particles
    return particle.life < particle.maxLife;
  });
};

const drawParticles = (ctx: CanvasRenderingContext2D) => {
  particles.forEach(particle => {
    let opacity = particle.opacity;
    
    // Flicker effect
    if (particle.flicker) {
      opacity *= 0.5 + 0.5 * Math.sin(particle.flickerPhase * 3);
    }

    ctx.fillStyle = particle.color;
    ctx.globalAlpha = opacity;
    ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
    
    // Pixel trail effect
    ctx.globalAlpha = opacity * 0.3;
    ctx.fillRect(particle.x - particle.vx, particle.y - particle.vy, particle.size, particle.size);
  });
  ctx.globalAlpha = 1;
};

const animate = () => {
  if (!particlesCanvas.value) return;
  
  const canvas = particlesCanvas.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update and draw particles
  updateParticles(canvas.width, canvas.height);
  drawParticles(ctx);

  animationFrameId = requestAnimationFrame(animate);
};

onMounted(() => {
  if (particlesCanvas.value) {
    const canvas = particlesCanvas.value;
    canvas.width = 300;
    canvas.height = 300;
    animate();
  }
});

onUnmounted(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }
});
</script>

<template>
  <div class="glitch-container" :class="{ active: isActive }">
    <!-- Glitch Aura (behind) -->
    <div class="glitch-aura"></div>
    
    <!-- Main Image -->
    <img :src="src" :alt="alt" class="glitch-img" />
    
    <!-- Scan Lines Layer -->
    <div class="scan-lines"></div>
    
    <!-- Particles Canvas -->
    <canvas ref="particlesCanvas" class="particles-layer"></canvas>
    
    <!-- RGB Glitch Layers -->
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
  width: 300px;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

/* Glitch Aura - Behind everything */
.glitch-aura {
  position: absolute;
  top: -10px;
  left: -10px;
  width: calc(100% + 20px);
  height: calc(100% + 20px);
  background: radial-gradient(circle, #9370DB 0%, #00FFFF 100%);
  filter: blur(5px);
  z-index: 1;
  opacity: 0.5;
  animation: aura-pulse 2s ease-in-out infinite, aura-distortion 0.333s steps(1) infinite;
}

/* Aura pulsation */
@keyframes aura-pulse {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.8; }
}

/* Aura distortion every 10 frames (~333ms at 30fps) */
@keyframes aura-distortion {
  0%, 90% { transform: translateX(0); }
  10% { transform: translateX(3px); }
  20% { transform: translateX(-4px); }
  30% { transform: translateX(2px); }
  40% { transform: translateX(-5px); }
  50% { transform: translateX(4px); }
  60% { transform: translateX(-3px); }
  70% { transform: translateX(5px); }
  80% { transform: translateX(-2px); }
}

/* Aura corruption blocks */
.glitch-aura::before,
.glitch-aura::after {
  content: '';
  position: absolute;
  width: 3px;
  height: 3px;
  animation: corruption-flicker 0.5s steps(1) infinite;
}

.glitch-aura::before {
  background: #FF0000;
  top: 20%;
  left: 30%;
  animation-delay: 0s;
}

.glitch-aura::after {
  background: #00FF00;
  top: 70%;
  left: 60%;
  animation-delay: 0.25s;
}

@keyframes corruption-flicker {
  0%, 40% { opacity: 0; }
  41%, 60% { opacity: 1; }
  61%, 100% { opacity: 0; }
}

/* Main Image */
.glitch-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0.85;
  filter: drop-shadow(0 0 20px rgba(100, 200, 255, 0.4));
  position: relative;
  z-index: 2;
}

/* Scan Lines Layer */
.scan-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 4;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(255, 20, 147, 0.3) 2px,
    rgba(138, 43, 226, 0.4) 3px,
    rgba(0, 206, 209, 0.3) 4px,
    transparent 4px,
    transparent 6px
  );
  background-size: 100% 6px;
  animation: scan-scroll 4s linear infinite, scan-distortion 0.1s steps(1) infinite;
  opacity: 0.5;
}

/* Scan lines scrolling */
@keyframes scan-scroll {
  0% { background-position: 0 0; }
  100% { background-position: 0 120px; }
}

/* Scan line distortion every 3 lines */
@keyframes scan-distortion {
  0%, 66% { transform: translateX(0); }
  33% { transform: translateX(3px); }
  66% { transform: translateX(-4px); }
}

/* Particles Canvas */
.particles-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 5;
  pointer-events: none;
}

/* RGB Glitch Layers */
.glitch-layers {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  pointer-events: none;
  opacity: 0.3;
}

.glitch-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0.5;
  mix-blend-mode: screen;
}

/* RGB channel separation */
.glitch-layer:nth-child(1) {
  filter: hue-rotate(0deg) saturate(2);
  animation: glitch-anim-1 2.5s infinite linear alternate-reverse;
  mix-blend-mode: lighten;
}

.glitch-layer:nth-child(2) {
  filter: hue-rotate(180deg) saturate(2);
  animation: glitch-anim-2 3s infinite linear alternate-reverse;
  mix-blend-mode: lighten;
}

.glitch-layer:nth-child(3) {
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

.glitch-container.active .glitch-aura {
  animation: aura-pulse 1s ease-in-out infinite, aura-distortion 0.2s steps(1) infinite;
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
