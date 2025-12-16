<script setup lang="ts">
import { ref } from 'vue';
import ParchmentLayout from './ParchmentLayout.vue';
import itemPotion from '../assets/item_potion.png';
import itemBook from '../assets/item_book.png';

const currentComponent = ref<'potion' | 'book'>('potion');
const isButtonHovered = ref(false);

const toggleComponent = () => {
  currentComponent.value = currentComponent.value === 'potion' ? 'book' : 'potion';
};
</script>

<template>
  <ParchmentLayout :active="isButtonHovered">
    <div class="interface-container">
      <button 
        class="magic-button" 
        @click="toggleComponent"
        @mouseenter="isButtonHovered = true"
        @mouseleave="isButtonHovered = false"
      >
        Transmute
      </button>

      <div class="center-stage">
        <Transition name="fade" mode="out-in">
          <img 
            v-if="currentComponent === 'potion'" 
            :src="itemPotion" 
            alt="Magic Potion" 
            class="magic-item" 
            key="potion"
          />
          <img 
            v-else 
            :src="itemBook" 
            alt="Spellbook" 
            class="magic-item" 
            key="book"
          />
        </Transition>
      </div>
    </div>
  </ParchmentLayout>
</template>

<style scoped>
.interface-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 80vh;
  width: 100%;
}

.magic-button {
  margin-top: 2rem;
  padding: 1rem 2rem;
  font-family: 'Cinzel', serif; /* Assuming a serif font, fallback will be serif */
  font-size: 1.5rem;
  color: #4a3b2a;
  background: rgba(255, 255, 255, 0.4);
  border: 2px solid #4a3b2a;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.magic-button:hover {
  background: rgba(255, 255, 255, 0.6);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.center-stage {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.magic-item {
  max-width: 300px;
  max-height: 300px;
  opacity: 0.85; /* Slight transparency as requested */
  filter: drop-shadow(0 0 20px rgba(100, 200, 255, 0.4));
  transition: opacity 0.3s ease;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
  filter: blur(10px);
}
</style>
