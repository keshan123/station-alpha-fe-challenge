import styled, { css, keyframes } from 'styled-components';
import { ANIMATION_TIMINGS } from './animationTimings';

// Keyframe animation for plane flying across the button
// Flies from left to right, fades out at right, then fades back in at left
const flyAcross = (iconLeft: number, iconSize: number) => keyframes`
  0% {
    left: ${iconLeft}px;
    transform: translateY(-50%);
    opacity: 1;
  }
  70% {
    left: calc(100% - ${iconLeft}px - ${iconSize}px);
    transform: translateY(-50%);
    opacity: 1;
  }
  80% {
    left: calc(100% - ${iconLeft}px - ${iconSize}px);
    transform: translateY(-50%);
    opacity: 0;
  }
  90% {
    left: ${iconLeft}px;
    transform: translateY(-50%);
    opacity: 0;
  }
  100% {
    left: ${iconLeft}px;
    transform: translateY(-50%);
    opacity: 1;
  }
`;

export const Container = styled.div<{ $iconSize: number; $isCentered: boolean; $iconLeft: number; $isHovered: boolean }>`
  position: absolute;
  top: 50%;
  left: ${props => {
    if (props.$isHovered) {
      return `${props.$iconLeft}px`;
    }
    return props.$isCentered ? '50%' : `${props.$iconLeft}px`;
  }};
  transform: ${props => {
    if (props.$isHovered) {
      return 'translateY(-50%)';
    }
    return props.$isCentered ? 'translate(-50%, -50%)' : 'translateY(-50%)';
  }};
  width: ${props => props.$iconSize}px;
  height: ${props => props.$iconSize}px;
  opacity: ${props => props.$isHovered ? 1 : 1};
  transition: ${props => {
    if (props.$isHovered) {
      return 'none';
    }
    const duration = props.$isCentered ? `${ANIMATION_TIMINGS.ICON_CENTER}ms` : `${ANIMATION_TIMINGS.ICON_MOVE_TO_LEFT}ms`;
    return `left ${duration} cubic-bezier(0.4, 0, 0.2, 1), transform ${duration} cubic-bezier(0.4, 0, 0.2, 1), opacity ${duration} ease`;
  }};
  
  ${props => props.$isHovered && css`
    animation: ${flyAcross(props.$iconLeft, props.$iconSize)} 1.5s ease-in-out infinite;
  `}
  
  @media (prefers-reduced-motion: reduce) {
    transition: left 0.01ms, transform 0.01ms;
    animation: none;
  }
`;

export const IconWrapper = styled.svg<{ $isActive: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  transition: transform ${ANIMATION_TIMINGS.ICON_SWAP}ms cubic-bezier(0.34, 1.56, 0.64, 1),
              opacity ${ANIMATION_TIMINGS.ICON_SWAP}ms cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: center;
  
  ${props => props.$isActive ? css`
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  ` : css`
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  `}
`;

