import styled from 'styled-components';
import { ButtonSize, SIZE_CONFIG, ButtonAnimationState } from './buttonConfig';
import { ANIMATION_TIMINGS } from './animationTimings';

export const StyledButton = styled.button<{ $size: ButtonSize; $animationState: ButtonAnimationState }>`
  position: relative;
  height: ${props => SIZE_CONFIG[props.$size].height}px;
  width: ${props => {
    if (props.$animationState === 'button-compressing') {
      return '58px';
    }
    if (props.$animationState === 'button-relaxing' || props.$animationState === 'svg-swapping') {
      return `${SIZE_CONFIG[props.$size].height}px`;
    }
    if (props.$animationState === 'button-expanding') {
      return `${SIZE_CONFIG[props.$size].minWidth}px`;
    }
    return 'auto';
  }};
  min-width: ${props => {
    if (props.$animationState === 'button-compressing') {
      return '58px';
    }
    if (props.$animationState === 'button-relaxing' || props.$animationState === 'svg-swapping') {
      return `${SIZE_CONFIG[props.$size].height}px`;
    }
    if (props.$animationState === 'button-expanding') {
      return `${SIZE_CONFIG[props.$size].minWidth}px`;
    }
    return `${SIZE_CONFIG[props.$size].minWidth}px`;
  }};
  border-radius: 9999px;
  background-color: #196BFF;
  color: white;
  font-weight: 500;
  font-size: ${props => SIZE_CONFIG[props.$size].fontSize};
  border: none;
  box-shadow:
    0 0 18px rgba(26, 115, 232, 0.5),
    0 4px 10px rgba(0, 0, 0, 0.15);
  font-family: "Inter", "Google Sans", -apple-system, BlinkMacSystemFont, sans-serif;
  outline: none;
  cursor: ${props => props.$animationState === 'idle' ? 'pointer' : 'not-allowed'};
  overflow: hidden;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: width ${props => {
                if (props.$animationState === 'button-compressing') {
                  return `${ANIMATION_TIMINGS.BUTTON_COMPRESS}ms`;
                }
                if (props.$animationState === 'button-relaxing') {
                  return `${ANIMATION_TIMINGS.BUTTON_RELAX}ms`;
                }
                if (props.$animationState === 'button-expanding') {
                  return `${ANIMATION_TIMINGS.BUTTON_EXPAND}ms`;
                }
                return '0ms';
              }} cubic-bezier(0.4, 0, 0.2, 1),
              min-width ${props => {
                if (props.$animationState === 'button-compressing') {
                  return `${ANIMATION_TIMINGS.BUTTON_COMPRESS}ms`;
                }
                if (props.$animationState === 'button-relaxing') {
                  return `${ANIMATION_TIMINGS.BUTTON_RELAX}ms`;
                }
                if (props.$animationState === 'button-expanding') {
                  return `${ANIMATION_TIMINGS.BUTTON_EXPAND}ms`;
                }
                return '0ms';
              }} cubic-bezier(0.4, 0, 0.2, 1);
  
  @media (prefers-reduced-motion: reduce) {
    transition: width 0.01ms, min-width 0.01ms;
  }

  /* Show default outline for keyboard navigation (accessibility) */
  &:focus-visible {
    outline: 2px solid #196BFF;
    outline-offset: 2px;
  }

  &:active {
    transform: scale(0.96);
    
    @media (prefers-reduced-motion: reduce) {
      transform: none;
    }
  }
`;

export const ButtonText = styled.span<{ $isVisible: boolean; $textLeft: number; $isHoverAnimationPlaying?: boolean }>`
  position: absolute;
  left: ${props => props.$textLeft}px;
  top: 50%;
  transform: translateY(-50%);
  white-space: nowrap;
  transition: opacity ${ANIMATION_TIMINGS.TEXT_FADE_OUT}ms ease-out;
  opacity: ${props => {
    if (!props.$isVisible) return 0;
    // During hover animation, reduce opacity to 70%
    return props.$isHoverAnimationPlaying ? 0.7 : 1;
  }};
  pointer-events: none;
  
  @media (prefers-reduced-motion: reduce) {
    transition: opacity 0.01ms;
  }
`;

export const SuccessText = styled.span<{ $isVisible: boolean; $textLeft: number }>`
  position: absolute;
  left: ${props => props.$isVisible ? `${props.$textLeft}px` : '50%'};
  top: 50%;
  transform: ${props => props.$isVisible ? 'translateY(-50%)' : 'translate(-50%, -50%)'};
  white-space: nowrap;
  transition: opacity ${ANIMATION_TIMINGS.TEXT_FADE_IN}ms ease-out,
              left ${ANIMATION_TIMINGS.TEXT_FADE_IN}ms ease-out,
              transform ${ANIMATION_TIMINGS.TEXT_FADE_IN}ms ease-out;
  opacity: ${props => props.$isVisible ? 1 : 0};
  pointer-events: none;
  
  @media (prefers-reduced-motion: reduce) {
    transition: opacity 0.01ms, left 0.01ms, transform 0.01ms;
  }
`;

