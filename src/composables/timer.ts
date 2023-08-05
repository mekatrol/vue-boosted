import { onMounted, onUnmounted } from 'vue';

export interface IntervalTimerCallback {
  (): Promise<boolean>;
}

export const useIntervalTimer = (timerTickCallback: IntervalTimerCallback, intervalMs: number): void => {
  // Keep track of interval timer handle
  let timerHandle = undefined as number | undefined;

  const stopTimer = (): void => {
    if (timerHandle !== undefined) {
      // Stop timer
      clearInterval(timerHandle);

      // Clear handle
      timerHandle = undefined;
    }
  };

  // Start timer when mounted
  onMounted(async () => {
    timerHandle = window.setInterval(async (): Promise<void> => {
      try {
        // Await the callback task
        const continueTimer = await timerTickCallback();

        // If the callback returns false then stop timer
        if (!continueTimer) {
          stopTimer();
        }

        // Ignore any errors
      } catch {}
    }, intervalMs);
  });

  // Stop timer when unmounted
  onUnmounted(() => {
    stopTimer();
  });
};
