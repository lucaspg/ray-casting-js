export const loadCamera = (canvas, updateCamera) => {
    canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;

    document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;

    canvas.onclick = function() {
        canvas.requestPointerLock();
    }

    const lockChangeAlert = () => {
        if (document.pointerLockElement === canvas ||
            document.mozPointerLockElement === canvas) {
            console.log('The pointer lock status is now locked');
            document.addEventListener("mousemove", updateCamera, false);
        } else {
            console.log('The pointer lock status is now unlocked');
            document.removeEventListener("mousemove", updateCamera, false);
        }
    }

    document.addEventListener('pointerlockchange', lockChangeAlert, false);
    document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
}