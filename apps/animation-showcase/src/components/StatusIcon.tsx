import React from 'react';
import { Container, IconWrapper } from './StatusIcon.styles';
import { ButtonSize, SIZE_CONFIG, ButtonAnimationState } from './buttonConfig';

interface StatusIconProps {
  isSuccess: boolean;
  size: ButtonSize;
  isCentered?: boolean;
  animationState?: ButtonAnimationState;
  isOnLeft?: boolean;
}

const PLANE_PATH = "M916 1579 c-42 -33 -43 -28 79 -409 61 -190 143 -461 147 -485 3 -17 -3 -20 -37 -22 -22 -1 -83 -9 -136 -18 -78 -12 -360 -45 -389 -45 -4 0 -51 55 -104 123 -54 67 -113 139 -133 160 l-37 37 -106 0 c-118 0 -150 -12 -150 -57 0 -25 57 -218 120 -403 15 -47 40 -124 54 -171 32 -106 54 -129 133 -140 58 -8 403 -22 893 -37 511 -16 1067 0 1238 34 146 30 248 99 293 198 48 107 -2 222 -135 308 -126 81 -264 100 -597 79 -107 -7 -206 -14 -221 -17 -23 -5 -30 2 -65 56 -21 33 -98 151 -172 263 -74 111 -174 265 -224 342 -103 161 -118 180 -169 206 -30 15 -59 19 -146 19 -95 0 -113 -3 -136 -21z";

const TICK_PATH = "M1578 1287 c-20 -9 -526 -501 -994 -966 -3 -3 -91 81 -197 186 -121 121 -202 194 -220 198 -15 4 -42 4 -60 1 -73 -14 -109 -103 -69 -168 12 -18 125 -134 252 -258 240 -233 264 -251 326 -236 20 5 189 167 567 544 477 477 538 542 544 575 14 88 -71 159 -149 124z";

const StatusIcon: React.FC<StatusIconProps> = ({ isSuccess, size, isCentered = false, animationState, isOnLeft = false }) => {
  const iconSize = SIZE_CONFIG[size].iconSize;
  const isSwapping = animationState === 'svg-swapping';
  const showTick = isSwapping || isSuccess;
  // Icon should be on left during expanding phase, otherwise use isCentered logic
  const shouldBeCentered = isOnLeft ? false : isCentered;
  
  return (
    <Container $iconSize={iconSize} $isCentered={shouldBeCentered} $iconLeft={SIZE_CONFIG[size].iconLeft}>
      {/* Plane Icon - shown when not swapping and isSuccess is false */}
      <IconWrapper
        xmlns="http://www.w3.org/2000/svg"
        version="1.0"
        viewBox="0 0 285.000000 164.000000"
        preserveAspectRatio="xMidYMid meet"
        $isActive={!showTick}
      >
        <g transform="translate(0.000000,164.000000) scale(0.100000,-0.100000)" fill="white" stroke="none">
          <path d={PLANE_PATH} />
        </g>
      </IconWrapper>

      {/* Tick Icon - shown when swapping or isSuccess is true */}
      <IconWrapper
        xmlns="http://www.w3.org/2000/svg"
        version="1.0"
        viewBox="0 0 176.000000 135.000000"
        preserveAspectRatio="xMidYMid meet"
        $isActive={showTick}
      >
        <g transform="translate(0.000000,135.000000) scale(0.100000,-0.100000)" fill="white" stroke="none">
          <path d={TICK_PATH} />
        </g>
      </IconWrapper>
    </Container>
  );
};

export default StatusIcon;

