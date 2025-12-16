<script setup lang="ts">
import { ref } from 'vue';
import ParchmentLayout from './ParchmentLayout.vue';
import GlitchImage from './GlitchImage.vue';
import SimpleImage from './SimpleImage.vue';
import VortexTransition from './VortexTransition.vue';
import imgHa from '../assets/HelloAsso.png';
import itemBook from '../assets/item_book.png';

const currentComponent = ref<'potion' | 'book'>('potion');
const isButtonHovered = ref(false);
const isTransitioning = ref(false);
const showComponent = ref(true);

const toggleComponent = () => {
  isTransitioning.value = true;
  showComponent.value = false;
};

const onTransitionComplete = () => {
  currentComponent.value = currentComponent.value === 'potion' ? 'book' : 'potion';
  isTransitioning.value = false;
  showComponent.value = true;
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
        <VortexTransition 
          :is-transitioning="isTransitioning"
          @transition-complete="onTransitionComplete"
        >
          <Transition name="fade" mode="out-in">
            <GlitchImage 
              v-if="showComponent && currentComponent === 'potion'"
              :src="imgHa"
              alt="Magic Potion"
              :is-active="isButtonHovered"
              key="potion"
            />
            <SimpleImage 
              v-else-if="showComponent && currentComponent === 'book'"
              :src="itemBook"
              alt="Spellbook"
              key="book"
            />
          </Transition>
        </VortexTransition>
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

/* Transitions */
.fade-enter-active {
  transition: all 0.4s ease;
}

.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: scale(1.2);
}

.fade-leave-to {
  opacity: 0;
  transform: scale(0.5);
  filter: blur(5px);
}
</style>
