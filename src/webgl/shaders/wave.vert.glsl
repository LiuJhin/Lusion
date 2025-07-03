uniform float uTime;
uniform vec2 uMouse;
uniform float uScroll;
uniform float uWaveAmplitude;
uniform float uWaveFrequency;
uniform float uNoiseStrength;
uniform float uNoiseScale;
uniform float uMouseStrength;

varying vec2 vUv;
varying float vElevation;

void main() {
    vUv = uv;
    
    // 简化的波浪效果
    float wave = sin(position.x * uWaveFrequency + uTime) * 
                sin(position.y * uWaveFrequency + uTime) * 
                uWaveAmplitude;
    
    // 鼠标交互
    float mouseEffect = 0.0;
    float mouseDistance = distance(uv, uMouse * 0.5 + 0.5);
    mouseEffect = (1.0 - mouseDistance) * uMouseStrength;
    
    // 组合效果
    float elevation = wave + mouseEffect;
    
    // 保存高度用于片段着色器中的颜色计算
    vElevation = elevation;
    
    // 应用位移
    vec3 newPosition = position + normal * elevation;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}