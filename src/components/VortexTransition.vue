<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps<{
  isTransitioning: boolean;
}>();

const emit = defineEmits<{
  transitionComplete: [];
}>();

// Refs
const canvasRef = ref<HTMLCanvasElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);
const itemRef = ref<HTMLDivElement | null>(null);

// Animation state
let animationFrameId: number | null = null;
let ctx: CanvasRenderingContext2D | null = null;

let phase: 'idle' | 'charging' | 'explosion' | 'cooldown' = 'idle';
let frameCount = 0;
const CHARGE_FRAMES = 5;
const EXPLOSION_FRAMES = 40;
const COOLDOWN_FRAMES = 20;

let centerX = 0;
let centerY = 0;

// Particle System
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
}

let particles: Particle[] = [];

// Explosion Logic
const spawnExplosion = () => {
  particles = [];
  const colors = ['#FFD700', '#FF4500', '#FFFFFF', '#FFFF00', '#FF8C00']; // Added DarkOrange
  
  // Create massive burst of particles
  for (let i = 0; i < 1200; i++) {
    const angle = Math.random() * Math.PI * 2;
    // Very high velocity for massive explosion, with more variance
    const speed = Math.random() * 35 + 15; 
    
    particles.push({
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: Math.random() * 6 + 1, // varied sizes
      color: colors[Math.floor(Math.random() * colors.length)]!,
      alpha: 1,
      decay: Math.random() * 0.015 + 0.002 // slower decay for longer lasting particles
    });
  }
};

const drawParticles = () => {
  if (!ctx) return;
  
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  // Draw Shockwave
  if (phase === 'explosion') {
    const progress = frameCount / EXPLOSION_FRAMES;
    const maxRadius = Math.max(ctx.canvas.width, ctx.canvas.height) * 0.8;
    const currentRadius = maxRadius * Math.pow(progress, 0.5); // Fast start, slow end
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 255, 255, ${1 - progress})`;
    ctx.lineWidth = 20 * (1 - progress);
    ctx.stroke();
  }

  // Draw Particles
  particles.forEach((p, index) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.92; // Friction
    p.vy *= 0.92;
    p.alpha -= p.decay;

    if (p.alpha > 0) {
      ctx!.globalAlpha = p.alpha;
      ctx!.fillStyle = p.color;
      ctx!.beginPath();
      ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx!.fill();
    } else {
      particles.splice(index, 1);
    }
  });
  
  ctx.globalAlpha = 1;
};

// Main Loop
const animate = () => {
  frameCount++;
  
  // Flash Effect Overlay
  if (containerRef.value) {
     if (phase === 'explosion' && frameCount < 10) {
         // Bright flash at start of explosion
         const flashIntensity = 1 - (frameCount / 10);
         containerRef.value.style.setProperty('--flash-opacity', `${flashIntensity}`);
         
         // Trigger content swap exactly when flash is brightest (start of explosion)
         if (frameCount === 1) {
             emit('transitionComplete');
         }
     } else {
         containerRef.value.style.setProperty('--flash-opacity', '0');
     }
  }

  // Animation Phases
  switch (phase) {
    case 'charging':
        // Optional pre-explosion accumulation
        if (frameCount >= CHARGE_FRAMES) {
            phase = 'explosion';
            frameCount = 0;
            spawnExplosion();
            
            // Jolt the item
             if (itemRef.value) {
                itemRef.value.style.transform = `scale(0.01)`; // Shrink to vanish instantly
                itemRef.value.style.transition = 'transform 0.05s ease-in';
             }
        }
        break;
        
    case 'explosion':
      drawParticles();
      
      // Bring item back
      if (frameCount === 5 && itemRef.value) {
          itemRef.value.style.transform = `scale(1)`;
          itemRef.value.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'; // Elastic bounce back
      }

      if (frameCount >= EXPLOSION_FRAMES) {
        phase = 'cooldown';
        frameCount = 0;
      }
      break;
      
    case 'cooldown':
      drawParticles(); // Keep drawing fading particles
      if (frameCount >= COOLDOWN_FRAMES) {
        phase = 'idle';
        cleanup();
      }
      break;
      
    case 'idle':
        return;
  }

  if (phase !== 'idle') {
    animationFrameId = requestAnimationFrame(animate);
  }
};

const startAnimation = () => {
  if (!canvasRef.value || !containerRef.value) return;
  
  const canvas = canvasRef.value;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const rect = containerRef.value.getBoundingClientRect();
  centerX = rect.left + rect.width / 2;
  centerY = rect.top + rect.height / 2;
  
  ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  phase = 'charging';
  frameCount = 0;
  animate();
};

const cleanup = () => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  phase = 'idle';
};

watch(() => props.isTransitioning, (newVal) => {
  if (newVal && phase === 'idle') {
    startAnimation();
  }
});

onMounted(() => {
    if (canvasRef.value) {
        canvasRef.value.width = window.innerWidth;
        canvasRef.value.height = window.innerHeight;
    }
    window.addEventListener('resize', handleResize);
});

const handleResize = () => {
    if (canvasRef.value) {
        canvasRef.value.width = window.innerWidth;
        canvasRef.value.height = window.innerHeight;
    }
};

onUnmounted(() => {
  cleanup();
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <div ref="containerRef" class="vortex-container">
    <canvas ref="canvasRef" class="effects-canvas"></canvas>
    <div class="flash-overlay"></div>
    <div ref="itemRef" class="content-wrapper">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.vortex-container {
  position: relative;
  width: 100%;
  height: 100%;
  --flash-opacity: 0;
  /* CENTER THE CONTENT */
  display: flex;
  justify-content: center;
  align-items: center;
}

.effects-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 9999; /* Above everything */
}

.flash-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: white;
  opacity: var(--flash-opacity);
  pointer-events: none;
  z-index: 30; /* Highest priority */
  transition: opacity 0.05s linear;
}

.content-wrapper {
  position: relative;
  z-index: 10;
  /* Ensure content doesn't overflow if it gets big */
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}
</style>
