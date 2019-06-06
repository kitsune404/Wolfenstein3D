"use strict";
var gl;
var canvas;
var texCanvas;
var program;
var keys;
//Our Image
var screenImage;
var textureAtlas;
var textureData;
//Our Texture
var screenTex;
var atlasTex;
var uScreenSampler;
//Our "Screen"
var screen;
//Attributes Regarding BJ's Placement And Forward Direction In The Map
var posX;
var posY;
var dirX;
var dirY;
//Camera Attributes
var planeX;
var planeY;
//Color Or Texture Rendering
var renderType;
//Point Attributes
var vPosition;
var vTexCoord;
//Aspects Regarding BJ's Movement
var moveSpeed = .15;
var rotSpeed = .05;
//Attributes Regarding The Map Itself
//var MAP_WIDTH = 24;
//var MAP_HEIGHT = 24;
var worldMap = [
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,0,0,0,0,2,2,2,2,2,0,0,0,0,3,0,3,0,3,0,0,0,1],
[1,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,0,0,0,0,2,0,0,0,2,0,0,0,0,3,0,0,0,3,0,0,0,1],
[1,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,0,0,0,0,2,2,0,2,2,0,0,0,0,3,0,3,0,3,0,0,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,13,13,13,13,13,13,13,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,13,0,13,0,0,0,0,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,13,0,0,0,0,4,0,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,13,0,13,0,0,0,0,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,13,0,13,13,13,13,13,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,13,13,13,13,13,13,13,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];
window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext('webgl2', {antialias:true});
    if (!gl) {
        alert("WebGL isn't available");
    }
    program = initShaders(gl, "vshader.glsl", "fshader.glsl");
    gl.useProgram(program);
    uScreenSampler = gl.getUniformLocation(program, "imageSampler");//get reference to sampler2D
    keys = [];
    //Init Player
    posX = 22;
    posY = 12;
    dirX  = -1;
    dirY = 0;
    planeX = 0;
    planeY = .66;
    //Init Visuals
    renderType = true;
    makeScreen();
    initTextures();
    initTexData();
    gl.clearColor(0.0,0.0,0.0,1.0);
    gl.viewport(0, 0, canvas.width, canvas.height);
    window.addEventListener("keydown",keysPressed,false);
    window.addEventListener("keyup",keysReleased,false);
    setInterval(update,16);
};

function update(){
    requestAnimationFrame(render);
}

function keysPressed(e){
    if(e.keyCode === 83){
        renderType = !renderType;
    }
    keys[e.keyCode] = true;
}

function keysReleased(e){
    keys[e.keyCode] = false;
}

function updatePosition(){
    if(keys[38]){//Up
        if(worldMap[Math.floor(posX + dirX * moveSpeed * 1.015)][Math.floor(posY)] === 0){
            posX += dirX * moveSpeed;
        }
        if(worldMap[Math.floor(posX)][Math.floor(posY + dirY * moveSpeed * 1.015)] === 0){
            posY += dirY * moveSpeed;
        }
    }
    if(keys[40]){//Down
        if(worldMap[Math.floor(posX - dirX * moveSpeed * 1.015)][Math.floor(posY)] === 0){
            posX -= dirX * moveSpeed;
        }
        if(worldMap[Math.floor(posX)][Math.floor(posY - dirY * moveSpeed *1.015)] === 0){
            posY -= dirY * moveSpeed;
        }
    }
    if(keys[37]){//Left
        var oldDirX = dirX;
        dirX = dirX * Math.cos(rotSpeed) - dirY * Math.sin(rotSpeed);
        dirY = oldDirX * Math.sin(rotSpeed) + dirY * Math.cos(rotSpeed);
        var oldPlaneX = planeX;
        planeX = planeX * Math.cos(rotSpeed) - planeY * Math.sin(rotSpeed);
        planeY = oldPlaneX * Math.sin(rotSpeed) + planeY * Math.cos(rotSpeed);
    }
    if(keys[39]){
        oldDirX = dirX;
        dirX = dirX * Math.cos(-rotSpeed) - dirY * Math.sin(-rotSpeed);
        dirY = oldDirX * Math.sin(-rotSpeed) + dirY * Math.cos(-rotSpeed);
        oldPlaneX = planeX;
        planeX = planeX * Math.cos(-rotSpeed) - planeY * Math.sin(-rotSpeed);
        planeY = oldPlaneX * Math.sin(-rotSpeed) + planeY * Math.cos(-rotSpeed);
    }
}

function makeScreen(){
    screen = [];
    screen.push(vec2(-1.0,-1.0));
    screen.push(vec2(0.0,0.0));
    screen.push(vec2(1.0,-1.0));
    screen.push(vec2(1.0,0.0));
    screen.push(vec2(1.0,1.0));
    screen.push(vec2(1.0,1.0));
    screen.push(vec2(-1.0,1.0));
    screen.push(vec2(0.0,1.0));

    //we need some graphics memory for this information
    var buffer = gl.createBuffer();
    //tell WebGL that the buffer we just created is the one we want to work with right now
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    //send the local data over to this buffer on the graphics card.  Note our use of Angel's "flatten" function
    gl.bufferData(gl.ARRAY_BUFFER, flatten(screen), gl.STATIC_DRAW);

    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 16, 0); //stride is 16 bytes total for position, texcoord
    gl.enableVertexAttribArray(vPosition);

    vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 16, 8); //stride is 16 bytes total for position, texcoord
    gl.enableVertexAttribArray(vTexCoord);
}

function initTextures(){
    initializeImage();
    screenTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, screenTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, screenImage);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    //Init Texture Atlas
    atlasTex = gl.createTexture();
    textureAtlas = new Image();
    textureAtlas.onload = function() { handleTextureLoaded(textureAtlas, atlasTex); };
    textureAtlas.src = "wolf3d-edit.png";
}

function initTexData(){
    texCanvas = document.createElement('canvas');
    var texContext = texCanvas.getContext('2d');
    texCanvas.width = textureAtlas.width;
    texCanvas.height = textureAtlas.height;
    texContext.drawImage(textureAtlas, 0, 0);
    textureData = texContext.getImageData(0, 0, textureAtlas.width, textureAtlas.height);
    //debugger;
}

function handleTextureLoaded(image, texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);  //disagreement over whether positive y goes up or down
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); //if you want to see some aliasing
    gl.bindTexture(gl.TEXTURE_2D, null); //we aren't bound to any textures now
}

function initializeImage(){
    var i,j;
    var texWidth = 512;
    var texHeight = 512;
    screenImage = new Uint8Array(texWidth * texHeight *4);

    for(i = 0; i < texWidth; i++){
        for(j = 0; j < texHeight; j++){
            screenImage[4*(texHeight * j + i)] = 255;
            screenImage[4*(texHeight * j + i) + 1] = 255;
            screenImage[4*(texHeight * j + i) + 2] = 255;
            screenImage[4*(texHeight * j + i) + 3] = 255;
        }
    }
}

function render(){
    updatePosition();
    gl.clear(gl.COLOR_BUFFER_BIT);
    newFrame();
    gl.activeTexture(gl.TEXTURE0); //we're using texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, screenTex);
    gl.uniform1i(uScreenSampler, 0);

    gl.drawArrays(gl.TRIANGLE_FAN,0,4)
}

function newFrame(){
    setFrame();
    gl.bindTexture(gl.TEXTURE_2D, screenTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, screenImage);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

}

function setFrame(){
    for(var x = 0.0; x < canvas.width; x++){
        //debugger;
        var cameraX = 2 * x / canvas.width - 1;//X Coord In Camera Space
        var rayPosX = posX;
        var rayPosY = posY;
        var rayDirX = dirX + planeX * cameraX;
        var rayDirY = dirY + planeY * cameraX;
        //Which Grid Slot We Are In
        var mapX = Math.floor(rayPosX);
        var mapY = Math.floor(rayPosY);

        //Length Of Ray From Current Position To Next X Or Y Side
        var sideDistX, sideDistY;

        //Length Of Ray From One X Or Y Side To Next X Or Y Side
        var deltaDistX = Math.sqrt(1 + (rayDirY * rayDirY) / (rayDirX * rayDirX));
        var deltaDistY = Math.sqrt(1 + (rayDirX * rayDirX) / (rayDirY * rayDirY));
        var perpWallDist;

        //Which Direction To Step
        var stepX, stepY;

        //Was A Wall Hit?
        var hit = 0;
        var side; //NS Or EW Wall Hit
        //Calculate Step And Initial sideDist
        if(rayDirX < 0){
            stepX = -1;
            sideDistX = (rayPosX - mapX) * deltaDistX;
        }else{
            stepX = 1;
            sideDistX = (mapX + 1.0 - rayPosX) * deltaDistX;
        }

        if(rayDirY < 0){
            stepY = -1;
            sideDistY = (rayPosY - mapY) * deltaDistY;
        }else{
            stepY = 1;
            sideDistY = (mapY + 1.0 - rayPosY) * deltaDistY;
        }

        //Perform DDA
        while(hit === 0){
            //Jump To Next Map Square, Or In X-Direction, Or In Y-Direction
            if(sideDistX < sideDistY){
                sideDistX += deltaDistX;
                mapX += stepX;
                side = 0;
            }else{
                sideDistY += deltaDistY;
                mapY += stepY;
                side = 1;
            }
            //Check If Hit A Wall
            if(worldMap[mapX][mapY] > 0){
                hit = 1;
            }
        }

        if(side === 0){
            perpWallDist = (mapX - rayPosX + (1 - stepX) / 2) / rayDirX;
        }else{
            perpWallDist = (mapY - rayPosY + (1 - stepY) / 2) / rayDirY;
        }

        //Calculate Height Of Strip To Draw
        var lineHeight = Math.floor(canvas.height / perpWallDist);

        //Calculate Lowest And Highest Pixel To File In Current Stripe
        var drawStart = Math.floor(-lineHeight / 2 + canvas.height /2);
        if(drawStart < 0){
            drawStart = 0;
        }
        var drawEnd = Math.floor(lineHeight / 2 + canvas.height /2);
        if(drawEnd >= canvas.height){
            drawEnd = canvas.height - 1;
        }

        if(renderType){
            var R,G,B;
            switch (worldMap[mapX][mapY]){
                case 1:
                    R = 255;
                    G = 0;
                    B = 0;
                    break;
                case 2:
                    R = 0;
                    G = 255;
                    B = 0;
                    break;
                case 3:
                    R = 0;
                    G = 0;
                    B = 255;
                    break;
                case 13:
                    R = 255;
                    G = 255;
                    B = 255;
                    break;
                default:
                    R = 255;
                    G = 255;
                    B = 0;
            }
            if(side === 1){
                R = Math.floor(R / 2);
                G = Math.floor(G / 2);
                B = Math.floor(B / 2);
            }
            vertLineColor(x, drawStart, drawEnd, R, G, B);
        }else{
            var index; //The Index Of Which Texture We Want
            var wallX; //Exact Place On Wall We Need
            if(side === 0){
                index = (2 * worldMap[mapX][mapY]) - 2;
                wallX = rayPosY + perpWallDist * rayDirY;
            }else{
                index = (2 * worldMap[mapX][mapY]) - 1;
                wallX = rayPosX + perpWallDist * rayDirX;
            }
            wallX = wallX - Math.floor(wallX);

            //X Coordinate On The Texture
            var xOffset = Math.floor(wallX * 124);
            if((side === 0 && rayDirX > 0) || (side === 1 && rayDirY < 0)){
                xOffset = 124 - xOffset - 2;
            }else{
                xOffset = xOffset - 2;
            }

            debugger;
            vertLineTex(x,drawStart, drawEnd, index, xOffset, lineHeight);
        }

    }
}

function vertLineColor(x , drawStart, drawEnd, R, G, B){
    //debugger;
    var texHeight = 512;
    for(var i = 0; i < drawStart; i++){
        screenImage[4*(texHeight * i + x)] = 79;
        screenImage[4*(texHeight * i + x) + 1] = 79;
        screenImage[4*(texHeight * i + x) + 2] = 79;
        screenImage[4*(texHeight * i + x) + 3] = 255;
    }
    for(i = drawStart; i < drawEnd; i++){
        screenImage[4*(texHeight * i + x)] = R;
        screenImage[4*(texHeight * i + x) + 1] = G;
        screenImage[4*(texHeight * i + x) + 2] = B;
        screenImage[4*(texHeight * i + x) + 3] = 255;
    }
    for(i = drawEnd; i < texHeight; i++){
        screenImage[4*(texHeight * i + x)] = 163;
        screenImage[4*(texHeight * i + x) + 1] = 163;
        screenImage[4*(texHeight * i + x) + 2] = 163;
        screenImage[4*(texHeight * i + x) + 3] = 255;
    }
}

function vertLineTex(x, drawStart, drawEnd, index, xOffset, lineHeight){
    var texHeight = 512;// = h
    var texX = (index % 8);
    texX = (128 * texX) + xOffset;
    var texYBase = Math.floor(index / 8);
    texYBase = 128 * texYBase;
    var texY;
    var texInd;
    for(var i = 0; i < drawStart; i++){
        screenImage[4*(texHeight * i + x)] = 79;
        screenImage[4*(texHeight * i + x) + 1] = 79;
        screenImage[4*(texHeight * i + x) + 2] = 79;
        screenImage[4*(texHeight * i + x) + 3] = 255;
    }
    for(i = drawStart; i < drawEnd; i++){
        var d = Math.floor((i * 256) - (texHeight * 128)+ (lineHeight * 128));
        texY = texYBase + Math.floor(((d * 128) / lineHeight) / 256);
        texInd = 4 * ( texX + texY * 1024 );
        screenImage[4*(texHeight * i + x)] = textureData.data[texInd];
        screenImage[4*(texHeight * i + x) + 1] = textureData.data[texInd + 1];
        screenImage[4*(texHeight * i + x) + 2] = textureData.data[texInd + 2];
        screenImage[4*(texHeight * i + x) + 3] = 255;
    }
    for(i = drawEnd; i < texHeight; i++){
        screenImage[4*(texHeight * i + x)] = 163;
        screenImage[4*(texHeight * i + x) + 1] = 163;
        screenImage[4*(texHeight * i + x) + 2] = 163;
        screenImage[4*(texHeight * i + x) + 3] = 255;
    }
}