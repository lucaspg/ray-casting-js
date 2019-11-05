export const shadeColor = (color, percent) => {
    if (percent < -80) {
        percent = -80;
    }

    let r = parseInt(color.substring(1, 3), 16);
    let g = parseInt(color.substring(3, 5), 16);
    let b = parseInt(color.substring(5, 7), 16);

    r = parseInt(r * (100 + Math.floor(percent)) / 100);
    g = parseInt(g * (100 + Math.floor(percent)) / 100);
    b = parseInt(b * (100 + Math.floor(percent)) / 100);

    r = (r < 255) ? r : 255;
    g = (g < 255) ? g : 255;  
    b = (b < 255) ? b : 255;

    return rgbToHexColor(r, g, b);
}

const rgbToHex = (rgb) => { 
    let hex = Number(rgb).toString(16);

    if (hex.length < 2) {
         hex = "0" + hex;
    }

    return hex;
}

export const rgbToHexColor = (r, g, b) => {
    let red = rgbToHex(r);
    let green = rgbToHex(g);
    let blue = rgbToHex(b);
    return `#${red}${green}${blue}`;
}
