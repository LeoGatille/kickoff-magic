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

const containerRef = ref<HTMLElement | null>(null);

const updateCanvasSize = () => {
  if (containerRef.value && particlesCanvas.value) {
    const { width, height } = containerRef.value.getBoundingClientRect();
    particlesCanvas.value.width = width;
    particlesCanvas.value.height = height;
  }
};

onMounted(() => {
  if (particlesCanvas.value && containerRef.value) {
    // Initial size
    updateCanvasSize();
    
    // Observer for resize
    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });
    resizeObserver.observe(containerRef.value);
    
    // Cleanup observer on unmount
    onUnmounted(() => {
      resizeObserver.disconnect();
    });
    
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
  <div class="glitch-container" :class="{ active: isActive }" ref="containerRef">
    <!-- Main Image -->
    <img :src="src" :alt="alt" class="glitch-img main-img" />
    
    <!-- Scan Lines Layer -->
    <div class="scan-lines" :style="{ 
      maskImage: `url(${src})`, 
      maskSize: 'contain', 
      maskRepeat: 'no-repeat', 
      maskPosition: 'center',
      webkitMaskImage: `url(${src})`, 
      webkitMaskSize: 'contain', 
      webkitMaskRepeat: 'no-repeat', 
      webkitMaskPosition: 'center'
    }"></div>
    
    <!-- Particles Canvas -->
    <canvas ref="particlesCanvas" class="particles-layer"></canvas>
    
    <!-- RGB Glitch Layers -->
    <div class="glitch-layers">
      <img :src="src" class="glitch-layer layer-1" alt="" />
      <img :src="src" class="glitch-layer layer-2" alt="" />
      <img :src="src" class="glitch-layer layer-3" alt="" />
    </div>
  </div>
</template>

<style scoped>
.glitch-container {
  position: relative;
  /* Size is now controlled by parent */
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: visible; /* Changed to visible to let effects bleed slightly if needed, or keeping hidden? pure glitch usually keeps hidden but aura needs visible? Aura was absolute inside. Let's keep hidden for scanlines but maybe aura needs to be larger. */
  /* Actually, for the aura to be seen pulsing OUTSIDE, we might want visible, but scanlines need hidden. 
     Let's keep overflow hidden but ensure aura is inside? 
     The aura was -10px, so it might be clipped if overflow is hidden. 
     The original had overflow: hidden. Let's stick to that for now to contain scanlines. 
  */
  overflow: hidden; 
}

/* Main Image */
.glitch-img {
  width: 100%;
  height: 100%;
  object-fit: contain; /* Important for keeping aspect ratio */
  opacity: 1; /* Keep main image solid */
  filter: drop-shadow(0 0 10px rgba(100, 200, 255, 0.3));
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
    rgba(255, 20, 147, 0.1) 2px,
    rgba(138, 43, 226, 0.1) 3px,
    rgba(0, 206, 209, 0.1) 4px,
    transparent 4px,
    transparent 6px
  );
  background-size: 100% 6px;
  animation: scan-scroll 4s linear infinite;
  opacity: 0.3;
}

@keyframes scan-scroll {
  0% { background-position: 0 0; }
  100% { background-position: 0 120px; }
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
  mix-blend-mode: hard-light; /* Better for transparent images than screen */
}

.glitch-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain; /* Match main image */
  opacity: 0.6;
  display: block; /* ensure img behaves */
}

/* RGB channel separation simulation using filters + mix-blend-mode */
.layer-1 {
  filter: hue-rotate(-5deg) saturate(2) drop-shadow(-2px 0 0 rgba(255,0,0,0.5));
  animation: glitch-anim-1 2.5s infinite linear alternate-reverse;
  opacity: 0.5;
}

.layer-2 {
  filter: hue-rotate(5deg) saturate(2) drop-shadow(2px 0 0 rgba(0,255,0,0.5));
  animation: glitch-anim-2 3s infinite linear alternate-reverse;
  opacity: 0.5;
}

.layer-3 {
  filter: hue-rotate(180deg) saturate(1.5) drop-shadow(0 2px 0 rgba(0,0,255,0.5));
  animation: glitch-anim-3 2s infinite linear alternate-reverse;
  opacity: 0.5;
}

/* Intensify on Active */
.glitch-container.active .layer-1 {
  animation: glitch-anim-1-intense 0.4s infinite linear alternate-reverse;
  opacity: 0.8;
  filter: hue-rotate(-10deg) saturate(3) drop-shadow(-5px 0 0 rgba(255,0,0,0.8));
}

.glitch-container.active .layer-2 {
  animation: glitch-anim-2-intense 0.4s infinite linear alternate-reverse;
  opacity: 0.8;
  filter: hue-rotate(10deg) saturate(3) drop-shadow(5px 0 0 rgba(0,255,0,0.8));
}

.glitch-container.active .layer-3 {
  animation: glitch-anim-3-intense 0.4s infinite linear alternate-reverse;
  opacity: 0.8;
  filter: hue-rotate(180deg) saturate(3) drop-shadow(0 5px 0 rgba(0,0,255,0.8));
}

.glitch-container.active .glitch-img {
  filter: drop-shadow(0 0 15px rgba(255, 0, 255, 0.5));
  transform: scale(1.02);
  transition: all 0.3s ease;
}

/* Keyframes for Subtle Glitch - using clip-path on the image itself */
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
