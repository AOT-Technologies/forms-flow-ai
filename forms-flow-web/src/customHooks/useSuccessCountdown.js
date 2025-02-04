import { useState, useEffect } from "react";

const useSuccessCountdown = () => {
  const [successState, setSuccessState] = useState({
    showSuccess: false,
    countdown: 0,
  });
  const [onCountdownEnd, setOnCountdownEnd] = useState(null); // Store callback

  const startSuccessCountdown = (initialCount = 2, callback) => {
    setSuccessState({ showSuccess: true, countdown: initialCount });
    setOnCountdownEnd(() => callback); // Store the callback function
  };

  useEffect(() => {
    if (successState.countdown >= 0) {
      const interval = setInterval(() => {
        setSuccessState((prev) => {
          if (prev.countdown === 1) {
            return { ...prev, countdown: 0 }; // Show 0 before redirecting
          }
          if (prev.countdown === 0) {
            clearInterval(interval);
            if (onCountdownEnd) onCountdownEnd(); // Call callback at 0
            return { showSuccess: false, countdown: 0 };
          }
          return { ...prev, countdown: prev.countdown - 1 };
        });
      }, 1000);

      return () => clearInterval(interval); // Cleanup interval
    }
  }, [successState.countdown]); // Only depends on countdown state

  return { successState, startSuccessCountdown };
};

export default useSuccessCountdown;
