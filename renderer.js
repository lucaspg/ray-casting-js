import { shadeColor, rgbToHexColor } from './colorUtils.js';

import { map } from './ray_casting.js';

const WALL_WIDTH = 64;

const PLAYER_HEIGHT = 32;

const distanceToProjectionPlane = 277;

export default class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
    }

    getTextureIdByWallType(wallType) {
        const textureMap = {
            2: "redbrick"
        };

        return textureMap[wallType];
    }

    drawGrid(map) {
        const rows = map.length;
        const columns = map[0].length;
    
        for (let row = 0; row < rows; row++) {
            for (let column = 0; column < columns; column++) {
                this.context.strokeStyle = '#000000';
                this.context.fillStyle = '#000000'; 
                this.context.beginPath();
                this.context.lineWidth = 1;
                this.context.rect(WALL_WIDTH * column, WALL_WIDTH * row, WALL_WIDTH, WALL_WIDTH);
                if (map[row][column] > 0) {
                    this.context.fill();
                } else {
                    this.context.stroke();
                }
                this.context.closePath();
            } 
        }
    }

    drawWall (column, wallHeight, dist, wallType, offset, relativeAngle, playerX, playerY, startingAngle) {
        if (wallType === 1) {
            this.context.beginPath();
            this.context.fillStyle = shadeColor('#FFFFFF', dist / 448 * -100); 
            this.context.fillRect(column, (this.canvas.height / 2) - wallHeight / 2, 1, wallHeight);
            this.context.fill();
            this.context.closePath();
        } else {
            this.context.beginPath();
            const textureId = this.getTextureIdByWallType(wallType)
            const img = document.getElementById(textureId);
            this.context.drawImage(img, offset, 0, 1, 64, column, (this.canvas.height / 2) - wallHeight / 2, 1, wallHeight)
            const alpha = (dist / 448) < 0.8 ? (dist/ 448) : 0.8;
            this.context.fillStyle = `rgba(0, 0, 0, ${alpha})`;
            this.context.fillRect(column, (this.canvas.height / 2) - wallHeight / 2, 1, wallHeight);
            this.context.closePath();
        }
        let bottomWallPixel = (this.canvas.height / 2) + (Math.floor(wallHeight / 2));
        this.context.beginPath();
        for (bottomWallPixel; bottomWallPixel < this.canvas.height; bottomWallPixel++) {
            const straightDistance = (PLAYER_HEIGHT / (bottomWallPixel - (this.canvas.height / 2))) * distanceToProjectionPlane;
            const actualDistance = straightDistance / Math.cos(relativeAngle);
            let floorY = Math.floor(actualDistance * Math.sin(startingAngle));
            let floorX = Math.floor(actualDistance * Math.cos(startingAngle));
            floorX = playerX + floorX;
            floorY = playerY - floorY;
            const tileRow = Math.floor(floorY % 64);
            const tileColumn = Math.floor(floorX % 64);
            const floor = document.getElementById("floor");
            this.context.drawImage(floor, tileRow, tileColumn, 1, 1, column, bottomWallPixel, 1, 1)
            this.context.drawImage(floor, tileRow, tileColumn, 1, 1, column, this.canvas.height - bottomWallPixel, 1, 1)
            const alpha = (actualDistance / 448) < 0.8 ? (actualDistance/ 448) : 0.8;
            this.context.fillStyle = `rgba(0, 0, 0, ${alpha})`;
            this.context.fillRect(column, bottomWallPixel, 1, 1);
            this.context.fillRect(column, this.canvas.height - bottomWallPixel, 1, 1);
        }
        this.context.closePath();
    }

    drawLine(startX, startY, endX, endY, cssColor) {
        this.context.strokeStyle = cssColor; 
        this.context.beginPath();
        this.context.moveTo(startX, startY);
        this.context.lineTo(endX, endY);	
        this.context.stroke();
        this.context.closePath();
    }

    drawBackground() {
        let colorValue = 255;
        let line;
        let increment = 0.5;

        for (line = 0; line < this.canvas.height / 2; line += increment) {
            let color = rgbToHexColor(0, 200, colorValue);
            this.drawLine(0, line, this.canvas.width, line, color);			
            colorValue += increment;
        }

        colorValue = 100;

        for (line = this.canvas.height / 2; line < this.canvas.height; line += increment) {
            let color = rgbToHexColor(0, colorValue, 0);
            
            this.drawLine(0, line, this.canvas.width, line, color);			
            colorValue += increment;
        }
    }

    drawCross() {
        this.context.beginPath();
        this.context.moveTo(this.canvas.width / 2, (this.canvas.height / 2) - 5);
        this.context.lineTo(this.canvas.width / 2, (this.canvas.height / 2) + 5);
        this.context.strokeStyle = '#FFFFFF';
        this.context.stroke();
        this.context.closePath();
    
        this.context.beginPath();
        this.context.moveTo((this.canvas.width / 2) - 5, this.canvas.height / 2);
        this.context.lineTo((this.canvas.width / 2) + 5, this.canvas.height / 2);
        this.context.strokeStyle = '#FFFFFF';
        this.context.stroke();
        this.context.closePath();
    }

    drawRay(playerX, playerY, intersection) {
        this.context.beginPath();
        this.context.moveTo(playerX, playerY);
        this.context.lineTo(intersection[0], intersection[1]);
        this.context.lineWidth = 5;
        this.context.strokeStyle = '#00FF00';
        this.context.stroke();
        this.context.closePath();
    }

    drawPlayer(playerX, playerY) {
        this.context.beginPath();
        this.context.arc(playerX, playerY, 10, 0, 2 * Math.PI);
        this.context.fillStyle = '#FF0000'; 
        this.context.fill();
        this.context.closePath();
    }

    clearCanvas() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}