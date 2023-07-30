import { onMounted, onUnmounted } from 'vue';

export interface IntervalTimerCallback {
  (): Promise<void>;
}

export const useIntervalTimer = (
  intervalMs: number,
  timerTickCallback: IntervalTimerCallback
): void => {
  // Keep track of interval timer handle
  let timerHandle = undefined as number | undefined;

  onMounted(async () => {
    timerHandle = window.setInterval(async (): Promise<void> => {
      try {
        // Await the task that is being executed
        await timerTickCallback();

        // We swallow any errors because we assume
        // that tickTask is catching its own errors
      } catch {}
    }, intervalMs);
  });

  onUnmounted(() => {
    if (timerHandle !== undefined) {
      clearInterval(timerHandle);
    }
  });
};
