import styled, { css } from 'styled-components';
import { ANIMATION_TIMINGS } from './animationTimings';

export const Container = styled.div<{ $iconSize: number; $isCentered: boolean; $iconLeft: number }>`
  position: absolute;
  top: 50%;
  left: ${props => props.$isCentered ? '50%' : `${props.$iconLeft}px`};
  transform: ${props => props.$isCentered ? 'translate(-50%, -50%)' : 'translateY(-50%)'};
  width: ${props => props.$iconSize}px;
  height: ${props => props.$iconSize}px;
  transition: left ${props => props.$isCentered ? `${ANIMATION_TIMINGS.ICON_CENTER}ms` : `${ANIMATION_TIMINGS.ICON_MOVE_TO_LEFT}ms`} cubic-bezier(0.4, 0, 0.2, 1),
              transform ${props => props.$isCentered ? `${ANIMATION_TIMINGS.ICON_CENTER}ms` : `${ANIMATION_TIMINGS.ICON_MOVE_TO_LEFT}ms`} cubic-bezier(0.4, 0, 0.2, 1);
  
  @media (prefers-reduced-motion: reduce) {
    transition: left 0.01ms, transform 0.01ms;
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

