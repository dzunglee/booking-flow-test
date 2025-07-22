<template>
  <div class="booking-steps-container">
    <div class="booking-steps">
      <div :class="['step', { active: currentStep >= index + 1 }]" v-for="(step, index) in steps" :key="step">
        <span class="step-number">{{ index + 1 }}</span>
        <span class="step-name">{{ step }}</span>
        <hr v-if="index < steps.length - 1" class="step-line" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  currentStep?: number
}

const props = withDefaults(defineProps<Props>(), {
  currentStep: 1,
})

const steps = ['Search', 'Select Room', 'Contact Details', 'Confirmation']
</script>

<style scoped>
.booking-steps-container {
  padding: 2rem 0;
  background-color: #f8f9fa;
  margin-bottom: 2rem;
  border-top: 1px solid #dee2e6;
  border-bottom: 1px solid #dee2e6;
}

.booking-steps {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 800px;
  margin: 0 auto;
  gap: 1rem;
  padding: 0 1rem;
}

.step {
  display: flex;
  align-items: center;
  position: relative;
  color: #7f8c8d;
  font-weight: 500;
  font-size: 0.9rem;
  gap: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.step-number {
  background-color: #7f8c8d;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  line-height: 32px;
  font-size: 14px;
  color: white;
  text-align: center;
  font-weight: bold;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.step-name {
  font-weight: 600;
  white-space: nowrap;
}

.step.active {
  color: #2c3e50;
}

.step.active .step-number {
  background-color: black;
  box-shadow: 0 2px 4px rgba(52, 152, 219, 0.3);
}

.step-line {
  width: 30px;
  height: 2px;
  border: none;
  background-color: #dee2e6;
  margin: 0 1rem;
  position: relative;
}

.step.active + .step .step-line {
  background-color: black;
}

@media (max-width: 768px) {
  .booking-steps {
    flex-direction: column;
    gap: 1rem;
  }

  .step {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }

  .step-line {
    display: none;
  }

  .booking-steps-container {
    padding: 1.5rem 0;
  }
}

@media (max-width: 640px) {
  .step-name {
    font-size: 0.8rem;
  }

  .step-number {
    width: 28px;
    height: 28px;
    line-height: 28px;
    font-size: 12px;
  }
}
</style>
