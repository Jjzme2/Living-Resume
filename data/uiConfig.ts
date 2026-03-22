// UI behaviour configuration.
// Adjust these values to tune animations and transitions site-wide.

export const uiConfig = {
  hero: {
    // KineticText typewriter settings
    typeSpeed:  80,    // ms per character typed
    eraseSpeed: 35,    // ms per character erased
    startDelay: 300,   // ms before the first character appears
    pauseTime:  2200,  // ms to hold each completed word before erasing
  },

  scrollReveal: {
    threshold:  0.08,             // fraction of element visible before animating
    rootMargin: '0px 0px -60px 0px', // shrinks the detection zone at the bottom
  },
}
