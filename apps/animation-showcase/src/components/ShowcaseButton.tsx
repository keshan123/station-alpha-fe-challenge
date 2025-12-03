import React, { useState } from 'react';
import styled from 'styled-components';
import StatusIcon from './StatusIcon';
import { ButtonSize, SIZE_CONFIG, ButtonAnimationState } from './buttonConfig';

export type { ButtonAnimationState };

const BUTTON_COMPRESS_DURATION = 400;
const BUTTON_RELAX_DURATION = 400;
const BUTTON_EXPAND_DURATION = 400;
const TEXT_FADE_IN_DURATION = 300;

const StyledButton = styled.button<{ $size: ButtonSize; $animationState: ButtonAnimationState }>`
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
  cursor: pointer;
  overflow: hidden;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease,
              width ${props => {
                if (props.$animationState === 'button-compressing') {
                  return `${BUTTON_COMPRESS_DURATION}ms`;
                }
                if (props.$animationState === 'button-relaxing') {
                  return `${BUTTON_RELAX_DURATION}ms`;
                }
                if (props.$animationState === 'button-expanding') {
                  return `${BUTTON_EXPAND_DURATION}ms`;
                }
                return '0ms';
              }} cubic-bezier(0.4, 0, 0.2, 1),
              min-width ${props => {
                if (props.$animationState === 'button-compressing') {
                  return `${BUTTON_COMPRESS_DURATION}ms`;
                }
                if (props.$animationState === 'button-relaxing') {
                  return `${BUTTON_RELAX_DURATION}ms`;
                }
                if (props.$animationState === 'button-expanding') {
                  return `${BUTTON_EXPAND_DURATION}ms`;
                }
                return '0ms';
              }} cubic-bezier(0.4, 0, 0.2, 1);
  
  @media (prefers-reduced-motion: reduce) {
    transition: background-color 0.2s ease, width 0.01ms, min-width 0.01ms;
  }

  /* Show default outline for keyboard navigation (accessibility) */
  &:focus-visible {
    outline: 2px solid #196BFF;
    outline-offset: 2px;
  }

  &:hover {
    background-color: #0056b3;
  }

  &:active {
    transform: scale(0.96);
    
    @media (prefers-reduced-motion: reduce) {
      transform: none;
    }
  }
`;

const ButtonText = styled.span<{ $isVisible: boolean; $textLeft: number }>`
  position: absolute;
  left: ${props => props.$textLeft}px;
  top: 50%;
  transform: translateY(-50%);
  white-space: nowrap;
  transition: opacity ${TEXT_FADE_IN_DURATION}ms ease-out;
  opacity: ${props => props.$isVisible ? 1 : 0};
  
  @media (prefers-reduced-motion: reduce) {
    transition: opacity 0.01ms;
  }
`;

interface ShowcaseButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  isSuccess?: boolean;
  size?: ButtonSize;
}

const ShowcaseButton: React.FC<ShowcaseButtonProps> = ({ 
  children = 'Book a flight', 
  onClick, 
  isSuccess = false,
  size = 'medium'
}) => {
  const [animationState, setAnimationState] = useState<ButtonAnimationState>('idle');

  // Derived states from animation state
  const isInitialTextVisible = animationState === 'idle';
  const isSuccessTextVisible = animationState === 'button-expanding';
  const isIconCentered = animationState === 'plane-centering' 
    || animationState === 'button-compressing' 
    || animationState === 'button-relaxing'
    || animationState === 'svg-swapping';
  const isIconOnLeft = animationState === 'button-expanding' || animationState === 'idle';

  const handleClick = () => {
    // Step 1: Start text fading
    setAnimationState('text-fading');
    
    // Step 2: After text fade completes (300ms), start plane centering
    setTimeout(() => {
      setAnimationState('plane-centering');
      
      // Step 3: After plane reaches center (400ms), start button compressing
      setTimeout(() => {
        setAnimationState('button-compressing');
        
        // Step 4: After button compresses (BUTTON_COMPRESS_DURATION), start button relaxing
        setTimeout(() => {
          setAnimationState('button-relaxing');
          
          // Step 5: After button relaxes (BUTTON_RELAX_DURATION), start SVG swapping
          setTimeout(() => {
            setAnimationState('svg-swapping');
            
            // Step 6: After SVG swap completes (ICON_TRANSITION_DURATION), start button expanding
            setTimeout(() => {
              setAnimationState('button-expanding');
            }, 300); // Using ICON_TRANSITION_DURATION
          }, BUTTON_RELAX_DURATION);
        }, BUTTON_COMPRESS_DURATION);
      }, 400);
    }, 300);
    
    if (onClick) {
      onClick();
    }
  };

  return (
    <StyledButton onClick={handleClick} $size={size} $animationState={animationState}>
      <StatusIcon 
        isSuccess={animationState === 'svg-swapping' || animationState === 'button-expanding' || isSuccess} 
        size={size} 
        isCentered={isIconCentered}
        animationState={animationState}
        isOnLeft={isIconOnLeft}
      />
      {isInitialTextVisible && (
        <ButtonText $isVisible={isInitialTextVisible} $textLeft={SIZE_CONFIG[size].textLeft}>
          {children}
        </ButtonText>
      )}
      {isSuccessTextVisible && (
        <ButtonText $isVisible={isSuccessTextVisible} $textLeft={SIZE_CONFIG[size].textLeft}>
          flight booked
        </ButtonText>
      )}
    </StyledButton>
  );
};

export default ShowcaseButton;

