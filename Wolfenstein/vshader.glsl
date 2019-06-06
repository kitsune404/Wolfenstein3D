#version 300 es

in vec2 vPosition;
//Texture Coord
in vec2 vTexCoord;

out vec2 fTexCoord;

void main() {
    fTexCoord = vTexCoord;
    gl_Position = vec4(vPosition,0.0,1.0);
}
