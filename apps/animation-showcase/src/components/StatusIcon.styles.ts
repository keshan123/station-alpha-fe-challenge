import styled, { keyframes, css } from 'styled-components';
import { ANIMATION_TIMINGS } from './animationTimings';
import { ButtonAnimationState } from './buttonConfig';

// Keyframe animation for plane flying across the button on hover
const flyAcross = (iconLeft: number, iconSize: number) => keyframes`
  0% {
    left: ${iconLeft}px;
    transform: translate3d(0, -50%, 0);
    opacity: 1;
  }
  70% {
    left: calc(100% - ${iconLeft}px - ${iconSize}px);
    transform: translate3d(0, -50%, 0);
    opacity: 1;
  }
  80% {
    left: calc(100% - ${iconLeft}px - ${iconSize}px);
    transform: translate3d(0, -50%, 0);
    opacity: 0;
  }
  90% {
    left: ${iconLeft}px;
    transform: translate3d(0, -50%, 0);
    opacity: 0;
  }
  100% {
    left: ${iconLeft}px;
    transform: translate3d(0, -50%, 0);
    opacity: 1;
  }
`;

export const Container = styled.div<{ $iconSize: number; $isCentered: boolean; $iconLeft: number; $animationState?: ButtonAnimationState; $buttonHeight?: number; $isHovered?: boolean }>`
  position: absolute;
  top: 50%;
  left: ${props => {
    // During hover animation, use fixed left position (animation will handle movement)
    if (props.$isHovered) {
      return `${props.$iconLeft}px`;
    }
    return props.$isCentered ? '50%' : `${props.$iconLeft}px`;
  }};
  transform: ${props => {
    // During hover animation, use translateY only (animation will handle movement)
    if (props.$isHovered) {
      return 'translate3d(0, -50%, 0)';
    }
    return props.$isCentered ? 'translate3d(-50%, -50%, 0)' : 'translate3d(0, -50%, 0)';
  }};
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
    if (props.$isHovered) {
      return 'transform, opacity, left';
    }
    return isButtonResizing ? 'transform, opacity' : 'auto';
  }};
  /* Disable position transitions during button width changes or hover animation to prevent shaking */
  transition: ${props => {
    // During hover animation, disable transitions (animation handles movement)
    if (props.$isHovered) {
      return 'none';
    }
    
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
  
  /* Hover animation - plane flies across button */
  ${props => props.$isHovered && css`
    animation: ${flyAcross(props.$iconLeft, props.$iconSize)} 1.5s ease-in-out;
  `}
  
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

