import React, { useState } from 'react';
import StatusIcon from './StatusIcon';
import { ButtonSize, SIZE_CONFIG, ButtonAnimationState } from './buttonConfig';
import { ANIMATION_TIMINGS } from './animationTimings';
import { StyledButton, ButtonText, SuccessText } from './ShowcaseButton.styles';

export type { ButtonAnimationState };

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
  const [isSuccessTextVisible, setIsSuccessTextVisible] = useState(false);

  // Derived states from animation state
  const isInitialTextVisible = animationState === 'idle';
  const isIconCentered = animationState === 'plane-centering' 
    || animationState === 'button-compressing' 
    || animationState === 'button-relaxing'
    || animationState === 'svg-swapping';
  const isIconOnLeft = animationState === 'button-expanding' || animationState === 'idle';

  const handleClick = () => {
    // Prevent clicks if animation is already in progress or completed
    if (animationState !== 'idle') {
      return;
    }

    // Reset success text visibility
    setIsSuccessTextVisible(false);
    // Step 1: Start text fading
    setAnimationState('text-fading');
    
    // Step 2: After text fade completes, start plane centering
    setTimeout(() => {
      setAnimationState('plane-centering');
      
      // Step 3: Start button compressing when plane centering is 80% complete
      setTimeout(() => {
        setAnimationState('button-compressing');
        
        // Step 4: After button compresses, start button relaxing
        setTimeout(() => {
          setAnimationState('button-relaxing');
          
          // Step 5: Start SVG swapping when button relaxing is 80% complete
          setTimeout(() => {
            setAnimationState('svg-swapping');
            
            // Step 6: After SVG swap completes, start button expanding
            setTimeout(() => {
              setAnimationState('button-expanding');
              // Delay text fade-in until button has expanded a bit
              setTimeout(() => {
                setIsSuccessTextVisible(true);
              }, ANIMATION_TIMINGS.TEXT_FADE_IN_DELAY);
            }, ANIMATION_TIMINGS.ICON_SWAP + ANIMATION_TIMINGS.DELAY_AFTER_ICON_SWAP);
          }, ANIMATION_TIMINGS.BUTTON_RELAX * 0.8 + ANIMATION_TIMINGS.DELAY_AFTER_BUTTON_RELAX);
        }, ANIMATION_TIMINGS.BUTTON_COMPRESS + ANIMATION_TIMINGS.DELAY_AFTER_BUTTON_COMPRESS);
      }, ANIMATION_TIMINGS.ICON_CENTER * 0.8 + ANIMATION_TIMINGS.DELAY_AFTER_ICON_CENTER);
    }, ANIMATION_TIMINGS.TEXT_FADE_OUT + ANIMATION_TIMINGS.DELAY_AFTER_TEXT_FADE_OUT);
    
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
      <ButtonText $isVisible={isInitialTextVisible} $textLeft={SIZE_CONFIG[size].textLeft}>
        {children}
      </ButtonText>
      <SuccessText $isVisible={isSuccessTextVisible} $textLeft={SIZE_CONFIG[size].textLeft}>
        flight booked
      </SuccessText>
    </StyledButton>
  );
};

export default ShowcaseButton;

