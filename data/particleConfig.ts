// Particle field visual and physics configuration.
// Tune these to change the look and feel of the hero background.

export const particleConfig = {
  count:            80,     // total number of particles
  connectionDist:   130,    // max px distance to draw a connecting line
  mouseRepelRadius: 110,    // px radius of mouse repulsion field

  // Spawn ranges (random values are distributed within these bounds)
  velocitySpread:   0.35,   // vx/vy spawns in [-spread/2, +spread/2]
  radiusMin:        0.4,    // minimum particle dot radius
  radiusSpread:     1.6,    // added to radiusMin: actual max = 2.0
  opacityMin:       0.15,   // minimum particle opacity
  opacitySpread:    0.45,   // added to opacityMin: actual max = 0.60
  twinkleSpeedMin:  0.004,  // slowest twinkle oscillation
  twinkleSpeedSpread: 0.01, // range added to twinkleSpeedMin

  // Physics
  twinkleAmplitude: 0.12,   // how much opacity varies during twinkle
  damping:          0.998,  // velocity decay per frame (1 = no decay)
  maxSpeed:         1.2,    // velocity ceiling in canvas units

  // Rendering
  edgeBuffer:           10,   // px past canvas edge before wrapping
  connectionAlpha:      0.18, // max opacity of connection lines
  connectionLineWidth:  0.6,  // stroke width of connection lines

  resizeDebounceMs: 200,    // ms to wait after window resize before reinitialising
}
