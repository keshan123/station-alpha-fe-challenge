/**
 * Animation timing constants for the ShowcaseButton component.
 * Adjust these values to control the duration of each animation phase.
 * Ordered chronologically based on the animation sequence.
 */
export const ANIMATION_TIMINGS = {
  // Phase 1: Initial text fade out
  TEXT_FADE_OUT: 400,        // Duration for initial text to fade out

  // Phase 2: Plane icon moves to center
  ICON_CENTER: 500,          // Duration for plane icon to move to center

  // Phase 3: Button compresses
  BUTTON_COMPRESS: 200,      // Duration for button to compress to 58px

  // Phase 4: Button relaxes
  BUTTON_RELAX: 1000,         // Duration for button to relax to 68px

  // Phase 5: SVG swap (plane to tick)
  ICON_SWAP: 500,            // Duration for SVG swap (plane to tick)

  // Phase 6: Button expands and icon moves to left
  BUTTON_EXPAND: 600,        // Duration for button to expand to full width
  ICON_MOVE_TO_LEFT: 400,    // Duration for icon to move from center to left

  // Phase 7: Success text fade in
  TEXT_FADE_IN_DELAY: 150,   // Delay before success text starts fading in (after button expansion begins)
  TEXT_FADE_IN: 300,         // Duration for success text to fade in

  // Phase transition delays (can be used to add pauses between phases)
  DELAY_AFTER_TEXT_FADE_OUT: 0,    // Additional delay after text fade out completes
  DELAY_AFTER_ICON_CENTER: 1,      // Additional delay after icon center completes
  DELAY_AFTER_BUTTON_COMPRESS: 200,  // Additional delay after button compress completes
  DELAY_AFTER_BUTTON_RELAX: 1,     // Additional delay after button relax completes
  DELAY_AFTER_ICON_SWAP: 600,        // Additional delay after icon swap completes
} as const;

