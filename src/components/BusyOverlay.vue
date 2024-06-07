<template>
  <div :class="`overlay ${fullScreen ? 'full-screen' : ''} ${show ? 'show' : ''}`" :style="overlayStyles">
    <div class="spinner" :style="spinnerStyles"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  show: boolean;
  zIndex?: number;
  backgroundColor?: string;
  opacity?: string | number;
  fullScreen?: boolean;

  // Spinner props
  spinnerSize?: string;
  spinnerThickness?: string;
  spinnerColor?: string;
  spinnerBackgroundColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  backgroundColor: 'rgb(0, 0, 0)',
  opacity: 0.5,
  zIndex: 99999
});

const overlayStyles = computed((): string => {
  let style = '';

  if (props.backgroundColor) {
    style += `background-color: ${props.backgroundColor};`;
  }

  if (props.opacity) {
    style += `opacity: ${props.opacity};`;
  }

  if (props.zIndex) {
    style += `z-index: ${props.zIndex};`;
  }

  return style;
});

const spinnerStyles = computed((): string => {
  let style = '';

  const spinnerSize = props.spinnerSize ?? '120px';
  style += `width: ${spinnerSize}; height: ${spinnerSize};`;

  const spinnerThickness = props.spinnerThickness ?? '18px';
  const spinnerColor = props.spinnerColor ?? '#3498db';
  const spinnerBackgroundColor = props.spinnerBackgroundColor ?? '#f3f3f3';

  style += `border: ${spinnerThickness} solid ${spinnerBackgroundColor};`;

  style += `border-top: ${spinnerThickness} solid ${spinnerColor};`;

  style += 'border-radius: 50%;';

  style += `margin: ${'-76px'} 0 0 ${'-76px'};`;

  return style;
});
</script>

<style scoped lang="scss">
// Adapted from https://www.w3schools.com/howto/howto_css_overlay.asp
.overlay {
  // Fill parent (overlay siblings)
  position: absolute;

  &.full-screen {
    // Fill page (overlay page)
    position: fixed;
  }

  // Hidden by default
  display: none;

  // Full width (cover the whole page)
  width: 100%;

  // Full height (cover the whole page)
  height: 100%;

  // Pin to each corner
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  &.show {
    display: revert;
  }

  // Adapted from https://www.w3schools.com/howto/howto_css_loader.asp
  .spinner {
    position: absolute;
    left: 50%;
    top: 50%;
    -webkit-animation: spin 2s linear infinite; /* Safari */
    animation: spin 2s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
}
</style>
