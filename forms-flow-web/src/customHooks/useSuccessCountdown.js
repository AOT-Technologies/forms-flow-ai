import { useState, useEffect } from "react";

const INTERVAL_DELAY = 1000; 

const useSuccessCountdown = () => {
  const [successState, setSuccessState] = useState({
    showSuccess: false,
    countdown: 0,
  });
  const [onCountdownEnd, setOnCountdownEnd] = useState(null); // Store callback

  const startSuccessCountdown = (callback, initialCount = 2) => {
    setSuccessState({ showSuccess: true, countdown: initialCount });
    setOnCountdownEnd(() => callback); // Store the callback function
  };

  useEffect(() => {
    if (successState.countdown >= 0) {
      const interval = setInterval(() => {
        setSuccessState((prev) => {
          if (prev.countdown <= 0) {
            clearInterval(interval);
            if (onCountdownEnd) onCountdownEnd(); // Call callback at 0
            return { showSuccess: false, countdown: 0 };
          }
          return { ...prev, countdown: prev.countdown - 1 };
        });
      }, INTERVAL_DELAY);

      return () => clearInterval(interval); // Cleanup interval
    }
  }, [successState.countdown]); // Only depends on countdown state

  return { successState, startSuccessCountdown };
};

export default useSuccessCountdown;
