<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

const canvasRef = ref<HTMLCanvasElement | null>(null);

// Configuration for the mystic effect
const config = {
  fontSize: 16,
  fontFamily: '"Cinzel", "Courier New", monospace', 
  textColor: '#4a3b2a', 
  trailColor: 'rgba(240, 230, 210, 0.3)', // Slightly more opaque trail for radial to look good
  speedBase: 2,
};

let animationId: number;

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$<>[]{}/*&^%#@!あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  char: string;
  color: string;
}

const draw = (ctx: CanvasRenderingContext2D, particles: Particle[], canvas: HTMLCanvasElement) => {
  // Fade effect
  ctx.fillStyle = config.trailColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = `${config.fontSize}px ${config.fontFamily}`;

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  particles.forEach(p => {
    // Draw particle
    ctx.fillStyle = p.color;
    ctx.fillText(p.char, p.x, p.y);

    // Update position
    p.x += p.vx;
    p.y += p.vy;

    // Randomly change character
    if (Math.random() > 0.95) {
       p.char = chars[Math.floor(Math.random() * chars.length)] || '?';
    }

    // Reset if out of bounds
    // We add a margin so they fully clear the screen before resetting
    const margin = 50;
    if (
      p.x < -margin || 
      p.x > canvas.width + margin || 
      p.y < -margin || 
      p.y > canvas.height + margin
    ) {
      resetParticle(p, centerX, centerY);
    }
  });
};

const resetParticle = (p: Particle, centerX: number, centerY: number) => {
  p.x = centerX;
  p.y = centerY;
  const angle = Math.random() * Math.PI * 2;
  const speed = config.speedBase + Math.random() * 2; // Variance in speed
  p.vx = Math.cos(angle) * speed;
  p.vy = Math.sin(angle) * speed;
  p.char = chars[Math.floor(Math.random() * chars.length)] || '?';
  
  // Color randomization
  if (Math.random() > 0.9) {
     p.color = '#8b4513'; // SaddleBrown glimmer
  } else {
     p.color = config.textColor;
  }
};

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let particles: Particle[] = [];

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Re-init particles on resize or just let them flow?
    // Let's ensure we have enough particles for the new size
    const particleCount = Math.floor((canvas.width * canvas.height) / 4000); 
    
    if (particles.length === 0) {
       // Init
       for (let i = 0; i < particleCount; i++) {
        const p = { x: 0, y: 0, vx: 0, vy: 0, char: '', color: '' };
        // Start them at random positions initially so it doesn't just explode all at once from center
        resetParticle(p, canvas.width / 2, canvas.height / 2);
        // Scramble positions initially to fill screen
        p.x = Math.random() * canvas.width;
        p.y = Math.random() * canvas.height;
        particles.push(p);
       }
    }
  };
  
  window.addEventListener('resize', resize);
  resize();

  const animate = () => {
    draw(ctx, particles, canvas);
    animationId = requestAnimationFrame(animate);
  };

  animate();
});

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId);
});
</script>

<template>
  <canvas ref="canvasRef" class="mystic-rain"></canvas>
</template>

<style scoped>
.mystic-rain {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0; 
  opacity: 0.6; 
  pointer-events: none;
}
</style>
