export const isRayFacingUp = (angle) => {
    return 0 <= angle && angle <= 180;
}

export const isRayFacingRight = (angle) => {
    return 0 <= angle && angle <= 90 || 270 <= angle && angle <= 360;
}

export const degreesToRadians = (angle) => {
    return angle * Math.PI / 180;
}

export const findRelativeAngle = (angle) => {
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

export const findAngleBetween = (alpha, beta) => {
    const phi = Math.abs(beta - alpha) % 360;
    const distance = phi > 180 ? 360 - phi : phi;
    return distance;
}

export const getPositiveAngle = (angle) => {
    return (angle > 0) ? angle : 360 + angle;
}

export const findDistance = (a, b, x, y) => {
    return Math.sqrt(Math.pow(a - x, 2) + Math.pow(b - y, 2));
}