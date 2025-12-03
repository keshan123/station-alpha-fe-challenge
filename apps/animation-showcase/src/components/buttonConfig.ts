export type ButtonSize = 'small' | 'medium' | 'large';

export type ButtonAnimationState = 
  | 'idle'              // Initial state - text visible, plane on left
  | 'text-fading'       // Text is fading out
  | 'plane-centering'   // Plane is moving to center
  | 'button-compressing' // Button width is shrinking to 58px
  | 'button-relaxing'   // Button width is growing to 68px
  | 'svg-swapping'      // SVG swapping from plane to tick
  | 'button-expanding'; // Button expanding to full width with text fade-in

// Size configurations
export const SIZE_CONFIG = {
  small: {
    height: 48,
    fontSize: '1rem',
    iconSize: 24,
    iconLeft: 16,
    textLeft: 48, // iconLeft (16) + iconSize (24) + gap (8)
    minWidth: 180,
  },
  medium: {
    height: 68,
    fontSize: '1.25rem',
    iconSize: 36,
    iconLeft: 24,
    textLeft: 76, // iconLeft (24) + iconSize (36) + gap (16)
    minWidth: 240,
  },
  large: {
    height: 88,
    fontSize: '1.5rem',
    iconSize: 48,
    iconLeft: 32,
    textLeft: 96, // iconLeft (32) + iconSize (48) + gap (16)
    minWidth: 300,
  },
} as const;

