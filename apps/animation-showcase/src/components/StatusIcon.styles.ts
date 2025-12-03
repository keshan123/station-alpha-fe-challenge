import styled from 'styled-components';
import { ANIMATION_TIMINGS } from './animationTimings';
import { ButtonAnimationState } from './buttonConfig';

export const Container = styled.div<{ $iconSize: number; $isCentered: boolean; $iconLeft: number; $animationState?: ButtonAnimationState; $buttonHeight?: number }>`
  position: absolute;
  top: 50%;
  left: ${props => props.$isCentered ? '50%' : `${props.$iconLeft}px`};
  transform: ${props => props.$isCentered ? 'translate3d(-50%, -50%, 0)' : 'translate3d(0, -50%, 0)'};
  width: ${props => props.$iconSize}px;
  height: ${props => props.$iconSize}px;
  /* Force hardware acceleration and stable rendering to prevent jitter */
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* Use will-change to hint browser to optimize rendering during animations */
  will-change: ${props => {
    const isButtonResizing = props.$animationState === 'button-compressing' 
      || props.$animationState === 'button-relaxing' 
      || props.$animationState === 'svg-swapping';
    return isButtonResizing ? 'transform, opacity' : 'auto';
  }};
  /* Disable position transitions during button width changes to prevent shaking */
  transition: ${props => {
    const isButtonResizing = props.$animationState === 'button-compressing' 
      || props.$animationState === 'button-relaxing' 
      || props.$animationState === 'svg-swapping';
    
    if (isButtonResizing) {
      // Only transition opacity during button resizing, not position
      return `opacity ${ANIMATION_TIMINGS.ICON_SWAP}ms ease`;
    }
    
    // Normal transitions when button is not resizing
    const duration = props.$isCentered ? `${ANIMATION_TIMINGS.ICON_CENTER}ms` : `${ANIMATION_TIMINGS.ICON_MOVE_TO_LEFT}ms`;
    return `left ${duration} cubic-bezier(0.4, 0, 0.2, 1), transform ${duration} cubic-bezier(0.4, 0, 0.2, 1), opacity ${ANIMATION_TIMINGS.ICON_SWAP}ms ease`;
  }};
  
  @media (prefers-reduced-motion: reduce) {
    transition: left 0.01ms, transform 0.01ms, opacity 0.01ms;
    animation: none;
    will-change: auto;
  }
`;

export const IconWrapper = styled.svg<{ $isActive: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: ${props => props.$isActive 
    ? 'translate(-50%, -50%) scale(1)' 
    : 'translate(-50%, -50%) scale(0)'};
  width: 100%;
  height: 100%;
  transition: transform ${ANIMATION_TIMINGS.ICON_SWAP}ms cubic-bezier(0.34, 1.56, 0.64, 1),
              opacity ${ANIMATION_TIMINGS.ICON_SWAP}ms cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: center;
  opacity: ${props => props.$isActive ? 1 : 0};
`;

