import {
    degreesToRadians
} from './angleUtils.js';

import {
    checkWallHit
} from './ray_casting.js';

const wallSize = 64;

export const getPlayerPos = (keysPressed, playerX, playerY, currentAngle) => {
    let xDisplacement = 0;
    let yDisplacement = 0;

    if (!keysPressed[87] && !keysPressed[83] && !keysPressed[65] && !keysPressed[68]) {
        return null;
    }

    if (keysPressed[87]) {
        xDisplacement += Math.cos(degreesToRadians(currentAngle)) * 2;
        yDisplacement += Math.sin(degreesToRadians(currentAngle)) * -2;
    }

    if (keysPressed[83]) {
        xDisplacement += Math.cos(degreesToRadians(currentAngle)) * -2;
        yDisplacement += Math.sin(degreesToRadians(currentAngle)) * 2;
    }

    if (keysPressed[65]) {
        xDisplacement += Math.cos(degreesToRadians(currentAngle - 90)) * -2;
        yDisplacement += Math.sin(degreesToRadians(currentAngle - 90)) * 2;
    }

    if (keysPressed[68]) {
        xDisplacement += Math.cos(degreesToRadians(currentAngle - 90)) * 2;
        yDisplacement += Math.sin(degreesToRadians(currentAngle - 90)) * -2;
    }

    playerX += xDisplacement;
    playerY += yDisplacement;

    const playerXGrid = Math.floor(playerX / wallSize);
    const playerYGrid = Math.floor(playerY / wallSize);

    const playerXGridOffset = playerX % wallSize;
    const playerYGridOffset = playerY % wallSize;

    const minDistanceToWall = 15;

    if (xDisplacement > 0) {
        if (checkWallHit(playerXGrid + 1, playerYGrid) && (playerXGridOffset > (wallSize - minDistanceToWall))) {
            playerX -= playerXGridOffset - (wallSize - minDistanceToWall);
        }
    } else {
        if (checkWallHit(playerXGrid - 1, playerYGrid) && (playerXGridOffset < (minDistanceToWall))) {
            playerX += minDistanceToWall - playerXGridOffset;
        }
    }

    if (yDisplacement < 0) {
        if (checkWallHit(playerXGrid, playerYGrid - 1) && (playerYGridOffset < (minDistanceToWall))) {
            playerY += minDistanceToWall - playerYGridOffset;
        }
    } else {
        if (checkWallHit(playerXGrid, playerYGrid + 1) && (playerYGridOffset > (wallSize - minDistanceToWall))) {
            playerY -= playerYGridOffset - (wallSize - minDistanceToWall);
        }
    }

    return [playerX, playerY];
};