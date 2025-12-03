/**
 * Animation timing constants for the ShowcaseButton component.
 * Adjust these values to control the duration of each animation phase.
 * Ordered chronologically based on the animation sequence.
 */
export const ANIMATION_TIMINGS = {
  // Phase 1: Initial text fade out
  TEXT_FADE_OUT: 300,        // Duration for initial text to fade out

  // Phase 2: Plane icon moves to center
  ICON_CENTER: 400,          // Duration for plane icon to move to center

  // Phase 3: Button compresses
  BUTTON_COMPRESS: 400,      // Duration for button to compress to 58px

  // Phase 4: Button relaxes
  BUTTON_RELAX: 400,         // Duration for button to relax to 68px

  // Phase 5: SVG swap (plane to tick)
  ICON_SWAP: 300,            // Duration for SVG swap (plane to tick)

  // Phase 6: Button expands and icon moves to left
  BUTTON_EXPAND: 400,        // Duration for button to expand to full width
  ICON_MOVE_TO_LEFT: 400,    // Duration for icon to move from center to left

  // Phase 7: Success text fade in
  TEXT_FADE_IN_DELAY: 150,   // Delay before success text starts fading in (after button expansion begins)
  TEXT_FADE_IN: 300,         // Duration for success text to fade in
} as const;

