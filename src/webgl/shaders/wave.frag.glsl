uniform float uTime;
uniform vec2 uMouse;
uniform float uColorIntensity;

varying vec2 vUv;
varying float vElevation;

void main() {
    // 简化的颜色计算
    vec3 baseColor = vec3(0.1, 0.3, 0.8); // 蓝色基调
    
    // 基于UV和高度添加一些变化
    vec3 color = baseColor + vec3(vUv.x * 0.2, vUv.y * 0.1, vElevation * 0.5);
    
    // 添加时间动画
    color += vec3(sin(uTime * 0.5) * 0.1);
    
    // 应用颜色强度
    color *= uColorIntensity;
    
    // 固定透明度
    float alpha = 0.8;
    
    gl_FragColor = vec4(color, alpha);
}