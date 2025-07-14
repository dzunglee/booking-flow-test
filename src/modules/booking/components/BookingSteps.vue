<template>
  <div class="booking-steps-container">
    <div class="booking-steps">
      <div :class="['step', { active: stepNumber >= index + 1 }]" v-for="(step, index) in steps" :key="step">
        <span class="step-number">{{ index + 1 }}</span>
        <span class="step-name">{{ step }}</span>
        <hr class="step-line" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps({
  currentStep: {
    type: Number,
    default: 1,
  },
})

const stepNumber = computed(() => {
  return props.currentStep
})

const steps = ['Search', 'Select room', 'Contact details', 'Confirmation']
</script>

<style scoped>
.booking-steps-container {
  padding: 2rem 0;
  background-color: var(--color-light-gray);
  margin-bottom: 2rem;
}
.booking-steps {
  display: flex;
  justify-content: space-between;
  width: 700px;
  margin: 0 auto;
}

.step {
  display: flex;
  align-items: center;
  position: relative;
  flex-direction: row;
  text-align: center;
  color: #7f8c8d;
  font-weight: 500;
  font-size: 0.9rem;
  gap: 10px;
  text-transform: uppercase;
  font-weight: bold;
}

.step .step-number {
  background-color: white;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  line-height: 30px;
  font-size: 14px;
  color: white;
  text-align: center;
  background-color: #7f8c8d;
}
.step.active {
  color: black;
}
.step.active .step-number {
  background-color: black;
}
</style>
