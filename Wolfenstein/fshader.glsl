#version 300 es
precision mediump float;

in vec2 fTexCoord;

out vec4 fColor;

uniform sampler2D imageSampler;

void main() {
    fColor = texture(imageSampler,fTexCoord);
    //fColor = vec4(1.0,1.0,1.0,1.0);
}
