const wallHeight = 64;
const playerHeight = wallHeight / 32;
const fieldOfView = 60;
let playerX = 160;
let playerY = 160;
const planeWidth = 320;
const planeHeight = 200;
const angleBetweenRays = fieldOfView / planeWidth;
const distanceToProjectionPlane = 277; // ( planeWidth / 2 ) / tan(30º)

const map = [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
];

/*
while(true) {
    const start = viewingAngle - (fieldOfView / 2);
    for (let i = 0; i < planeWidth; i++) {
        // cast ray
        // trace until it hits awall
        // record distance to wall
        // increment angleBetweenRays
    }
}
*/

const checkWallHit = (x, y) => {
    if ((x > 3) || (y > 3) || (x < 0) || (y < 0)) return true;
    return map[x][y];
}

const isRayFacingUp = (angle) => {
    return 0 <= angle && angle <= 180;
}

const isRayFacingRight = (angle) => {
    return 0 <= angle && angle <= 90 || 270 <= angle && angle <= 360;
}

const degreesToRadians = (angle) => {
    return angle * Math.PI / 180;
}

const findAngle = (angle) => {
    if (0 <= angle && angle <= 90) {
        return degreesToRadians(angle);
    } else if (90 < angle && angle <= 180) {
        return degreesToRadians(180 - angle);
    } else if (180 < angle && angle <= 270) {
        return degreesToRadians(angle - 180);
    } else if (270 < angle && angle <= 360) {
        return degreesToRadians(360 - angle);
    }
}

const findHorizontalIntersection = (angle) => {
    let wallHit = false;

    let y;
    if (isRayFacingUp(angle)) {
        y = Math.floor(playerY / 64) * 64 - 1;
    } else {
        y = Math.floor(playerY / 64) * 64 + 64;
    }

    let x;
    if (isRayFacingRight(angle)) {
        x = Math.floor(playerX + Math.abs(playerY - y) / Math.tan(findAngle(angle)));
    } else {
        x = Math.floor(playerX - Math.abs(playerY - y) / Math.tan(findAngle(angle)));
    }

    let gridX = Math.floor(x / 64);
    let gridY = Math.floor(y / 64);

    wallHit = checkWallHit(gridX, gridY);

    const deltaY = isRayFacingUp(angle) ? -64 : 64;
    const deltaX = isRayFacingRight(angle) ? Math.floor(64 / Math.tan(findAngle(angle))) : Math.floor(64 / Math.tan(findAngle(angle))) * (-1);

    while (!wallHit) {
        x = x + deltaX;
        y = y + deltaY;

        gridX = Math.floor(x / 64);
        gridY = Math.floor(y / 64);

        wallHit = checkWallHit(gridX, gridY);
    }   

    return [x, y];
}

const findVerticalIntersection = (angle) => {
    let wallHit = false;

    let x;
    if (isRayFacingRight(angle)) {
        x = Math.floor(playerX / 64) * 64 + 64;
    } else {
        x = Math.floor(playerX / 64) * 64 - 1;
    }

    let y;
    if (isRayFacingUp(angle)) {
        y = Math.floor(playerY - Math.abs(x - playerX) * Math.tan(findAngle(angle)));
    } else {
        y = Math.floor(playerY + Math.abs(x - playerX) * Math.tan(findAngle(angle)));
    }

    let gridX = Math.floor(x / 64);
    let gridY = Math.floor(y / 64);

    wallHit = checkWallHit(gridX, gridY);

    const xA = isRayFacingRight(angle) ? 64 : -64;
    const yA = isRayFacingUp(angle) ? Math.floor(64 * Math.tan(findAngle(angle))) * (-1) : Math.floor(64 * Math.tan(findAngle(angle)));

    while (!wallHit) {
        x = x + xA;
        y = y + yA;

        gridX = Math.floor(x / 64);
        gridY = Math.floor(y / 64);

        wallHit = checkWallHit(gridX, gridY);
    }   

    return [x, y];
}

const findDistance = (x, y) => {
    return Math.sqrt(Math.pow(playerX - x, 2) + Math.pow(playerY - y, 2));
}

var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");

var c1 = document.getElementById("3d_projection");
var ctx1 = c1.getContext("2d");

const drawGrid = () => {
    for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 64 * i);
        ctx.lineTo(320, 64 * i);
        ctx.stroke();
        ctx.closePath();
    }

    for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.moveTo(64 * i, 0);
        ctx.lineTo(64 * i, 320);
        ctx.stroke();
        ctx.closePath();
    }
}

const findAngleBetween = (alpha, beta) => {
    const phi = Math.abs(beta - alpha) % 360;
    const distance = phi > 180 ? 360 - phi : phi;
    return distance;
}

const getRightAngle = (angle) => {
    return (angle > 0) ? angle : 360 + angle;
}

const drawScreen = (angle) => {
    console.log(angle);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx1.clearRect(0, 0, c1.width, c1.height);
    drawGrid();
    let viewingAngle = getRightAngle(angle);
    let startingAngle = getRightAngle(viewingAngle - 30);

    for (let a = 0; a < 320; a ++) {
        const horizontalIntersection = findHorizontalIntersection(startingAngle);
        const verticalIntersection = findVerticalIntersection(startingAngle);

        const horizontalDistance = findDistance(horizontalIntersection[0], horizontalIntersection[1]);
        const verticalDistance = findDistance(verticalIntersection[0], verticalIntersection[1]);

        let closestIntersection = (horizontalDistance > verticalDistance) ? verticalIntersection : horizontalIntersection;
        let closestDistance = (horizontalDistance > verticalDistance) ? verticalDistance : horizontalDistance;
        let correctedDistance = closestDistance * Math.cos(degreesToRadians(findAngleBetween(startingAngle, viewingAngle)));

        const projetedWallSlice = 64 / correctedDistance * 277;
        ctx1.beginPath();
        ctx1.moveTo(a, 100 - projetedWallSlice / 2);
        ctx1.lineTo(a, 100 + projetedWallSlice / 2);
        ctx1.strokeStyle = '#FF0000';
        ctx1.stroke();
        ctx1.closePath();

        ctx.beginPath();
        ctx.moveTo(playerX, playerY);
        ctx.lineTo(closestIntersection[0], closestIntersection[1]);
        ctx.stroke();
        ctx.closePath();

        startingAngle = (startingAngle + 60/320) % 360;
    }
}

let currentAngle = 0;

document.onkeydown = function(e) {
    switch (e.keyCode) {
        case 37:
            currentAngle += 5;
            drawScreen(currentAngle % 360);
            break;
        case 38:
            playerX += Math.cos(degreesToRadians(currentAngle)) * 10;
            playerY -= Math.sin(degreesToRadians(currentAngle)) * 10;
            drawScreen(currentAngle % 360);
            break;
        case 39:
            currentAngle -= 5;
            drawScreen(currentAngle % 360);
            break;
        case 40:
            playerX -= Math.cos(degreesToRadians(currentAngle)) * 10;
            playerY += Math.sin(degreesToRadians(currentAngle)) * 10;
            drawScreen(currentAngle % 360);
            break;
    }
};