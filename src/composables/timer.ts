import { onMounted, onUnmounted } from 'vue';

export const useTimer = (
  intervalMs: number,
  task: () => Promise<void>
): void => {
  // Keep track of interval timer handle
  let timerHandle = undefined as number | undefined;

  onMounted(async () => {
    timerHandle = window.setInterval(async (): Promise<void> => {
      try {
        // Await the task that is being executed
        await task();

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
