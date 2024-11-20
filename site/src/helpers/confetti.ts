import confetti from "canvas-confetti";
export function kaboom() {
    const duration = 1.5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
  
    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }
  
    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
  
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
  
      const particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.2, 0.4), y: randomInRange(0.3, 0.5) },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.6, 0.8), y: randomInRange(0.3, 0.5) },
      });
    }, 250);
  }