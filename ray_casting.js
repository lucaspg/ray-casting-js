const wallHeight = 64;
const wallWidth = 64;
const playerHeight = wallHeight / 32;
const fieldOfView = 60;
let playerX = 160;
let playerY = 160;
const planeWidth = 320;
const planeHeight = 200;
const angleBetweenRays = fieldOfView / planeWidth;
const distanceToProjectionPlane = 277; // ( planeWidth / 2 ) / tan(30º)

const map = [
    [1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 1, 1],
    [1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1],
];

const checkWallHit = (x, y) => {
    if ((x >= map.length) || (y >= map[0].length) || (x < 0) || (y < 0)) return true;
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
        x = playerX + (Math.abs(playerY - y) / Math.tan(findAngle(angle)));
    } else {
        x = playerX - (Math.abs(playerY - y) / Math.tan(findAngle(angle)));
    }

    let gridX = Math.floor(x / 64);
    let gridY = Math.floor(y / 64);

    // console.log(x + ' ' + y);
    // console.log(gridX + ' ' + gridY);

    wallHit = checkWallHit(gridX, gridY);

    const deltaY = isRayFacingUp(angle) ? -64 : 64;
    const deltaX = isRayFacingRight(angle) ? (64 / Math.tan(findAngle(angle))) : (64 / Math.tan(findAngle(angle))) * (-1);

    while (!wallHit) {
        x = x + deltaX;
        y = y + deltaY;

        gridX = Math.floor(x / 64);
        gridY = Math.floor(y / 64);

        // console.log(x + ' ' + y);
        // console.log(gridX + ' ' + gridY);

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
        y = playerY - (Math.abs(x - playerX) * Math.tan(findAngle(angle)));
    } else {
        y = playerY + (Math.abs(x - playerX) * Math.tan(findAngle(angle)));
    }

    let gridX = Math.floor(x / 64);
    let gridY = Math.floor(y / 64);

    // console.log(x + ' ' + y);
    // console.log(gridX + ' ' + gridY);

    wallHit = checkWallHit(gridX, gridY);

    const xA = isRayFacingRight(angle) ? 64 : -64;
    const yA = isRayFacingUp(angle) ? (64 * Math.tan(findAngle(angle))) * (-1) : (64 * Math.tan(findAngle(angle)));

    while (!wallHit) {
        x = x + xA;
        y = y + yA;

        gridX = Math.floor(x / 64);
        gridY = Math.floor(y / 64);

        // console.log(x + ' ' + y);
        // console.log(gridX + ' ' + gridY);

        wallHit = checkWallHit(gridX, gridY);
    }   

    return [x, y];
}

const findDistance = (x, y) => {
    return Math.sqrt(Math.pow(playerX - x, 2) + Math.pow(playerY - y, 2));
}

const drawGrid = (map) => {
    const rows = map.length;
    const columns = map[0].length;

    for (let row = 0; row <= rows; row++) {
        ctx.beginPath();
        ctx.moveTo(0, wallWidth * row);
        ctx.lineTo(columns * wallWidth, wallWidth * row);
        ctx.stroke();
        ctx.closePath();
    }

    for (let column = 0; column <= columns; column++) {
        ctx.beginPath();
        ctx.moveTo(wallWidth * column, 0);
        ctx.lineTo(wallWidth * column, rows * wallWidth);
        ctx.stroke();
        ctx.closePath();
    }
}

const findAngleBetween = (alpha, beta) => {
    const phi = Math.abs(beta - alpha) % 360;
    const distance = phi > 180 ? 360 - phi : phi;
    return distance;
}

const getPositiveAngle = (angle) => {
    return (angle > 0) ? angle : 360 + angle;
}

const clearCanvas = (canvas, context) => {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

const drawWall = (canvas, context, column, wallHeight) => {
    context.beginPath();
    context.moveTo(column, (canvas.height / 2) - wallHeight / 2);
    context.lineTo(column, (canvas.height / 2) + wallHeight / 2);
    context.strokeStyle = '#FF0000';
    context.stroke();
    context.closePath();
}

const drawFloor = (canvas, context, column, wallHeight) => {
    context.beginPath();
    context.moveTo(column, (canvas.height / 2) + wallHeight / 2);
    context.lineTo(column, canvas.height);
    context.strokeStyle = '#00FF00';
    context.stroke();
    context.closePath();
}

const drawRay = (intersection) => {
    ctx.beginPath();
    ctx.moveTo(playerX, playerY);
    ctx.lineTo(intersection[0], intersection[1]);
    ctx.stroke();
    ctx.closePath();
}

const drawCross = (context, canvas) => {
    context.beginPath();
    context.moveTo(canvas.width / 2, (canvas.height / 2) - 5);
    context.lineTo(canvas.width / 2, (canvas.height / 2) + 5);
    context.strokeStyle = '#FFFFFF';
    context.stroke();
    context.closePath();

    context.beginPath();
    context.moveTo((canvas.width / 2) - 5, canvas.height / 2);
    context.lineTo((canvas.width / 2) + 5, canvas.height / 2);
    context.strokeStyle = '#FFFFFF';
    context.stroke();
    context.closePath();
}

const drawScreen = (angle) => {
    clearCanvas(c, ctx);
    clearCanvas(c1, ctx1);

    drawGrid(map);

    let viewingAngle = getPositiveAngle(angle);
    let startingAngle = getPositiveAngle(viewingAngle - fieldOfView / 2);

    // console.log('startingAngle: ', startingAngle);
    // console.log(playerX + ' ' + playerY);

    for (let a = 319; a >= 0; a --) {
        const horizontalIntersection = findHorizontalIntersection(startingAngle);
        // console.log('------------');
        const verticalIntersection = findVerticalIntersection(startingAngle);

        const horizontalDistance = findDistance(horizontalIntersection[0], horizontalIntersection[1]);
        const verticalDistance = findDistance(verticalIntersection[0], verticalIntersection[1]);

        let closestIntersection = (horizontalDistance > verticalDistance) ? verticalIntersection : horizontalIntersection;
        let closestDistance = (horizontalDistance > verticalDistance) ? verticalDistance : horizontalDistance;
        let correctedDistance = closestDistance * Math.cos(degreesToRadians(findAngleBetween(startingAngle, viewingAngle)));

        const projetedWallSlice = wallHeight / correctedDistance * distanceToProjectionPlane;

        drawWall(c1, ctx1, a, projetedWallSlice);
        drawFloor(c1, ctx1, a, projetedWallSlice);
        drawRay(closestIntersection);

        startingAngle = (startingAngle + fieldOfView / c1.width) % 360;
    }

    drawCross(ctx1, c1);
}

var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");

var c1 = document.getElementById("3d_projection");
var ctx1 = c1.getContext("2d");

let currentAngle = 0;
drawScreen(currentAngle % 360);

document.onkeydown = function(e) {
    switch (e.keyCode) {
        case 87:
            playerX += Math.cos(degreesToRadians(currentAngle)) * 10;
            playerY -= Math.sin(degreesToRadians(currentAngle)) * 10;
            drawScreen(currentAngle % 360);
            break;
        case 83:
            playerX -= Math.cos(degreesToRadians(currentAngle)) * 10;
            playerY += Math.sin(degreesToRadians(currentAngle)) * 10;
            drawScreen(currentAngle % 360);
            break;
    }
};

c1.requestPointerLock = c1.requestPointerLock ||
                            c1.mozRequestPointerLock;

document.exitPointerLock = document.exitPointerLock ||
                           document.mozExitPointerLock;

c1.onclick = function() {
    c1.requestPointerLock();
}

const lockChangeAlert = () => {
    if (document.pointerLockElement === c1 ||
        document.mozPointerLockElement === c1) {
        console.log('The pointer lock status is now locked');
        document.addEventListener("mousemove", updateCamera, false);
    } else {
        console.log('The pointer lock status is now unlocked');
        document.removeEventListener("mousemove", updateCamera, false);
    }
}

const updateCamera = (e) => {
    const turn = e.movementX;
    currentAngle -= turn;
    drawScreen(currentAngle % 360);
}

document.addEventListener('pointerlockchange', lockChangeAlert, false);
document.addEventListener('mozpointerlockchange', lockChangeAlert, false);