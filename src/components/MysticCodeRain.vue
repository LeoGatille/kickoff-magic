<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

const props = defineProps<{
  active?: boolean
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);

// Configuration for the mystic effect
const config = {
  fontFamily: '"Cinzel", "Courier New", monospace', 
  textColor: '#4a3b2a', 
  trailColor: 'rgba(240, 230, 210, 0.3)', 
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
  size: number;
  weight: string;
}

const draw = (ctx: CanvasRenderingContext2D, particles: Particle[], canvas: HTMLCanvasElement) => {
  // Fade effect
  ctx.fillStyle = config.trailColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  particles.forEach(p => {
    // Set particle specific font
    ctx.font = `${p.weight} ${p.size}px ${config.fontFamily}`;
    ctx.fillStyle = p.color;
    ctx.fillText(p.char, p.x, p.y);

  // Update position
    const speedMultiplier = props.active ? 3 : 1;
    p.x += p.vx * speedMultiplier;
    p.y += p.vy * speedMultiplier;

    // Randomly change character
    if (Math.random() > 0.95) {
       p.char = chars[Math.floor(Math.random() * chars.length)] || '?';
       
       // Dynamic color update based on active state
       if (props.active) {
         // Broader hue variety (0-360) and deeper colors (40-60% lightness)
         const hue = Math.floor(Math.random() * 360);
         p.color = `hsl(${hue}, ${85 + Math.random() * 15}%, ${45 + Math.random() * 15}%)`;
       } else {
         // Dark, low saturation
         const hue = 20 + Math.random() * 30; // 20-50 (Browns)
         p.color = `hsl(${hue}, ${20 + Math.random() * 20}%, ${15 + Math.random() * 15}%)`;
       }
    }

    // Reset if out of bounds
    // Margin depends on max size to ensure clear
    const margin = 100;
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
  
  // Randomize properties
  const angle = Math.random() * Math.PI * 2;
  // Speed variety: 0.5 to 4
  const speed = 0.5 + Math.random() * 3.5; 
  p.vx = Math.cos(angle) * speed;
  p.vy = Math.sin(angle) * speed;
  
  p.char = chars[Math.floor(Math.random() * chars.length)] || '?';
  
  // Size variety: 10px to 32px
  p.size = Math.floor(10 + Math.random() * 22);
  
  // Weight variety
  const weights = ['normal', 'bold', '100', '900'];
  p.weight = weights[Math.floor(Math.random() * weights.length)] || 'normal';

  // Color randomization
  if (props.active) {
     const hue = Math.floor(Math.random() * 360);
     p.weight = '900';
     p.color = `hsl(${hue}, ${85 + Math.random() * 15}%, ${45 + Math.random() * 15}%)`;
  } else {
     const hue = 20 + Math.random() * 30;
     p.color = `hsl(${hue}, ${20 + Math.random() * 20}%, ${15 + Math.random() * 15}%)`;
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
    
    // Density
    const particleCount = Math.floor((canvas.width * canvas.height) / 4000); 
    
    if (particles.length === 0) {
       // Init
       for (let i = 0; i < particleCount; i++) {
        const p = { x: 0, y: 0, vx: 0, vy: 0, char: '', color: '', size: 16, weight: 'normal' };
        resetParticle(p, canvas.width / 2, canvas.height / 2);
        // Scramble positions
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
