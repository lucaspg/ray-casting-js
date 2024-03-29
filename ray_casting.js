import Renderer from "./renderer.js";
import {
    degreesToRadians,
    findRelativeAngle,
    findAngleBetween,
    findDistance,
    getPositiveAngle,
    isRayFacingUp,
    isRayFacingRight,
} from './angleUtils.js';
import { loadCamera } from "./camera.js";
import { getPlayerPos } from "./movement.js";

let playerX = 96;
let playerY = 96;
let keysPressed = {};
let currentAngle = 0;
let mapCanvas = document.getElementById("mapCanvas");
let screenCanvas = document.getElementById("screenCanvas");
const wallSize = 64;
const fieldOfView = 60;
const distanceToProjectionPlane = 277;
const map = [
    [2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 0, 2, 0, 0, 2, 0, 0, 2],
    [2, 0, 2, 2, 0, 2, 0, 2, 2],
    [2, 0, 0, 0, 0, 2, 0, 2, 2],
    [2, 0, 2, 2, 2, 2, 0, 2, 2],
    [2, 0, 2, 2, 2, 0, 0, 0, 2],
    [2, 0, 0, 0, 2, 2, 2, 0, 2],
    [2, 2, 2, 0, 0, 0, 0, 0, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2],
];

export const checkWallHit = (x, y) => {
    if ((x >= map.length) || (y >= map[0].length) || (x < 0) || (y < 0)) return true;
    return map[y][x] > 0;
}

const findHorizontalIntersection = (angle) => {
    let wallHit = false;

    let y;
    if (isRayFacingUp(angle)) {
        y = Math.floor(playerY / wallSize) * wallSize;
    } else {
        y = Math.floor(playerY / wallSize) * wallSize + wallSize;
    }

    let x;
    if (isRayFacingRight(angle)) {
        x = playerX + (Math.abs(playerY - y) / Math.tan(findRelativeAngle(angle)));
    } else {
        x = playerX - (Math.abs(playerY - y) / Math.tan(findRelativeAngle(angle)));
    }

    if (isRayFacingUp(angle)) {
        y = y - 1;
    }

    let gridX = Math.floor(x / wallSize);
    let gridY = Math.floor(y / wallSize);

    wallHit = checkWallHit(gridX, gridY);

    const deltaY = isRayFacingUp(angle) ? -wallSize : wallSize;
    const deltaX = isRayFacingRight(angle) ? (wallSize / Math.tan(findRelativeAngle(angle))) : (wallSize / Math.tan(findRelativeAngle(angle))) * (-1);

    while (!wallHit) {
        x = x + deltaX;
        y = y + deltaY;

        gridX = Math.floor(x / wallSize);
        gridY = Math.floor(y / wallSize);

        wallHit = checkWallHit(gridX, gridY);
    }   

    return [x, y];
}

const isSpecialCorner = (x, y, angle) => {
    return !isRayFacingRight(angle) && isRayFacingUp(angle) && x % wallSize === 0 && y % wallSize === 0;
}

const findVerticalIntersection = (angle) => {
    let wallHit = false;

    let x;
    if (isRayFacingRight(angle)) {
        x = Math.floor(playerX / wallSize) * wallSize + wallSize;
    } else {
        x = Math.floor(playerX / wallSize) * wallSize;
    }

    let y;
    if (isRayFacingUp(angle)) {
        y = playerY - (Math.abs(x - playerX) * Math.tan(findRelativeAngle(angle)));
    } else {
        y = playerY + (Math.abs(x - playerX) * Math.tan(findRelativeAngle(angle)));
    }

    if (isSpecialCorner(x, y, angle)) {
        y = y - 1;
    }

    if (!isRayFacingRight(angle)) {
        x = x - 1;
    }

    let gridX = Math.floor(x / wallSize);
    let gridY = Math.floor(y / wallSize);

    wallHit = checkWallHit(gridX, gridY);

    const xA = isRayFacingRight(angle) ? wallSize : -wallSize;
    const yA = isRayFacingUp(angle) ? (wallSize * Math.tan(findRelativeAngle(angle))) * (-1) : (wallSize * Math.tan(findRelativeAngle(angle)));

    while (!wallHit) {
        x = x + xA;
        y = y + yA;

        gridX = Math.floor(x / wallSize);
        gridY = Math.floor(y / wallSize);

        wallHit = checkWallHit(gridX, gridY);
    }   

    return [x, y];
}

const drawScreen = () => {
    const playerPos = getPlayerPos(keysPressed, playerX, playerY, currentAngle);
    if (playerPos) {
        playerX = playerPos[0];
        playerY = playerPos[1];
    }

    const roundedAngle = currentAngle % 360;

    const mapRenderer = new Renderer(mapCanvas);
    const screenRenderer = new Renderer(screenCanvas);

    mapRenderer.clearCanvas();
    screenRenderer.clearCanvas();

    mapRenderer.drawGrid(map);

    let viewingAngle = getPositiveAngle(roundedAngle);
    let startingAngle = getPositiveAngle(viewingAngle - fieldOfView / 2);

    screenRenderer.drawBackground();

    for (let wallSlice = screenCanvas.width; wallSlice >= 0; wallSlice--) {
        const horizontalIntersection = findHorizontalIntersection(startingAngle);
        const verticalIntersection = findVerticalIntersection(startingAngle);

        const horizontalDistance = findDistance(playerX, playerY, horizontalIntersection[0], horizontalIntersection[1]);
        const verticalDistance = findDistance(playerX, playerY, verticalIntersection[0], verticalIntersection[1]);

        let closestIntersection = (horizontalDistance > verticalDistance) ? verticalIntersection : horizontalIntersection;
        let closestDistance = (horizontalDistance > verticalDistance) ? verticalDistance : horizontalDistance;
        let correctedDistance = closestDistance * Math.cos(degreesToRadians(findAngleBetween(startingAngle, viewingAngle)));

        const projetedWallSlice = wallSize / correctedDistance * distanceToProjectionPlane;

        const closestIntersectionGridX = Math.floor(closestIntersection[0] / wallSize);
        const closestIntersectionGridY = Math.floor(closestIntersection[1] / wallSize);

        const wallType = map[closestIntersectionGridY][closestIntersectionGridX];

        const isVertical = horizontalDistance > verticalDistance;

        const offset = isVertical ? closestIntersection[1] % wallSize : closestIntersection[0] % wallSize;

        screenRenderer.drawWall(wallSlice, projetedWallSlice, Math.floor(correctedDistance), wallType, Math.floor(offset));
        mapRenderer.drawRay(playerX, playerY, closestIntersection);
        mapRenderer.drawPlayer(playerX, playerY);

        startingAngle = (startingAngle + fieldOfView / screenCanvas.width) % 360;
    }

    screenRenderer.drawCross();

    window.requestAnimationFrame(drawScreen);
}

const updateCamera = (e) => {
    const turn = e.movementX / 2;
    currentAngle -= turn;
}

document.onkeydown = function(e) {
    keysPressed[e.keyCode] = true;
};

document.onkeyup = function(e) {
    keysPressed[e.keyCode] = false;
};

window.onload = function() {
    loadCamera(screenCanvas, updateCamera);
    window.requestAnimationFrame(drawScreen);
}