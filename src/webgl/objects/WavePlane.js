import * as THREE from 'three'
import { gsap } from 'gsap'

// 内联着色器代码
const vertexShader = `
uniform float uTime;
uniform vec2 uMouse;
uniform float uScroll;
uniform float uWaveAmplitude;
uniform float uWaveFrequency;
uniform float uNoiseStrength;
uniform float uNoiseScale;
uniform float uMouseStrength;
uniform vec2 uResolution;

varying vec2 vUv;
varying float vElevation;
varying vec3 vNormal;
varying vec3 vPosition;

// 噪声函数 - 简化版Perlin噪声
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    
    // 四个角的伪随机值
    float a = sin(dot(i, vec2(12.9898, 78.233)) * 43758.5453);
    float b = sin(dot(i + vec2(1.0, 0.0), vec2(12.9898, 78.233)) * 43758.5453);
    float c = sin(dot(i + vec2(0.0, 1.0), vec2(12.9898, 78.233)) * 43758.5453);
    float d = sin(dot(i + vec2(1.0, 1.0), vec2(12.9898, 78.233)) * 43758.5453);

    // 平滑插值
    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
    vUv = uv;
    vNormal = normal;
    vPosition = position;
    
    // 复杂的波浪效果
    float wave1 = sin(position.x * uWaveFrequency + uTime) * 
                sin(position.y * uWaveFrequency + uTime) * 
                uWaveAmplitude;
    
    float wave2 = sin(position.x * uWaveFrequency * 1.3 + uTime * 0.7) * 
                sin(position.z * uWaveFrequency * 0.8 + uTime * 1.2) * 
                uWaveAmplitude * 0.8;
    
    // 添加噪声
    float noiseValue = noise(vec2(position.x * uNoiseScale + uTime * 0.2, 
                               position.y * uNoiseScale - uTime * 0.1)) * uNoiseStrength;
    
    // 高级鼠标交互 - 创建波纹效果
    float mouseEffect = 0.0;
    vec2 mousePos = uMouse * 0.5 + 0.5; // 转换到0-1范围
    float mouseDistance = distance(uv, mousePos);
    
    // 创建波纹效果
    float ripple = sin(mouseDistance * 20.0 - uTime * 5.0) * 0.5 + 0.5;
    ripple *= exp(-mouseDistance * 8.0); // 衰减函数
    
    // 鼠标压下效果
    float mousePush = (1.0 - smoothstep(0.0, 0.3, mouseDistance)) * uMouseStrength;
    
    // 组合鼠标效果
    mouseEffect = ripple * 0.05 + mousePush;
    
    // 滚动效果
    float scrollEffect = uScroll * 0.05 * sin(position.x * 2.0 + position.y * 2.0);
    
    // 组合所有效果
    float elevation = wave1 + wave2 + noiseValue + mouseEffect + scrollEffect;
    
    // 保存高度用于片段着色器中的颜色计算
    vElevation = elevation;
    
    // 应用位移
    vec3 newPosition = position + normal * elevation;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
uniform vec2 uMouse;
uniform float uColorIntensity;
uniform vec2 uResolution;

varying vec2 vUv;
varying float vElevation;
varying vec3 vNormal;
varying vec3 vPosition;

// 辅助函数 - 创建渐变
vec3 gradient(vec3 colorA, vec3 colorB, float t) {
    return mix(colorA, colorB, t);
}

void main() {
    // 动态基础颜色 - 随时间变化的渐变
    vec3 colorA = vec3(0.05, 0.1, 0.5); // 深蓝色
    vec3 colorB = vec3(0.1, 0.4, 0.8);  // 亮蓝色
    vec3 colorC = vec3(0.2, 0.5, 0.9);  // 天蓝色
    vec3 colorD = vec3(0.0, 0.2, 0.6);  // 深蓝色
    
    // 时间变化的渐变
    float gradientMix = sin(uTime * 0.2) * 0.5 + 0.5;
    vec3 baseColor = gradient(gradient(colorA, colorB, gradientMix), 
                             gradient(colorC, colorD, gradientMix), 
                             vUv.y);
    
    // 基于UV和高度添加一些变化
    vec3 color = baseColor;
    
    // 添加高度影响 - 使凸起部分更亮
    color += vec3(vElevation * 0.8);
    
    // 添加边缘发光效果
    float edge = 1.0 - max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0)));
    color += vec3(0.2, 0.5, 1.0) * edge * 0.5;
    
    // 添加鼠标位置高光
    vec2 mousePos = uMouse * 0.5 + 0.5; // 转换到0-1范围
    float mouseDistance = distance(vUv, mousePos);
    float mouseLightIntensity = 1.0 - smoothstep(0.0, 0.3, mouseDistance);
    color += vec3(0.3, 0.6, 1.0) * mouseLightIntensity * 0.5;
    
    // 添加时间动画 - 脉冲效果
    float pulse = sin(uTime * 0.5) * 0.5 + 0.5;
    color += vec3(0.1, 0.2, 0.5) * pulse * 0.2;
    
    // 应用颜色强度
    color *= uColorIntensity;
    
    // 动态透明度 - 基于高度和边缘
    float alpha = 0.7 + edge * 0.2 + vElevation * 0.1;
    alpha = clamp(alpha, 0.6, 0.95); // 限制透明度范围
    
    gl_FragColor = vec4(color, alpha);
}
`;

class WavePlane {
  constructor() {
    this.geometry = null
    this.material = null
    this.mesh = null
    this.time = 0
    this.mouse = new THREE.Vector2(0, 0)
    this.targetMouse = new THREE.Vector2(0, 0)
    this.scrollY = 0
    this.targetScrollY = 0
    this.mouseVelocity = new THREE.Vector2(0, 0)
    this.lastMouse = new THREE.Vector2(0, 0)
    this.isMouseDown = false
    
    this.params = {
      waveAmplitude: 0.1,
      waveFrequency: 3.0,
      noiseStrength: 0.2,
      noiseScale: 1.5,
      colorIntensity: 1.0,
      mouseStrength: 0.3
    }
    
    // 绑定事件处理器
    this.handleMouseDown = this.handleMouseDown.bind(this)
    this.handleMouseUp = this.handleMouseUp.bind(this)
    
    // 添加鼠标事件监听
    window.addEventListener('mousedown', this.handleMouseDown)
    window.addEventListener('mouseup', this.handleMouseUp)
    window.addEventListener('touchstart', this.handleMouseDown)
    window.addEventListener('touchend', this.handleMouseUp)
    
    // 新增：入场动画状态
    this.isEntranceComplete = false;
    this.entranceProgress = 0;
    
    this.init()
    
    // 启动入场动画
    this.startEntranceAnimation();
  }
  
  // 新增：入场动画方法
  startEntranceAnimation() {
    try {
      console.log('开始入场动画...');
      
      // 初始状态：完全透明，无波动
      if (this.material && this.material.uniforms) {
        this.material.uniforms.uColorIntensity.value = 0;
        this.material.uniforms.uWaveAmplitude.value = 0;
        this.material.uniforms.uNoiseStrength.value = 0;
      }
      
      // 网格初始缩放为0
      if (this.mesh) {
        this.mesh.scale.set(0, 0, 0);
        this.mesh.rotation.z = Math.PI;
      }
      
      // 创建入场动画时间线
      const entranceTl = gsap.timeline({
        onComplete: () => {
          this.isEntranceComplete = true;
          console.log('入场动画完成');
        }
      });
      
      // 第一阶段：网格缩放和旋转入场 (0-1.5s)
      entranceTl.to(this.mesh.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 1.5,
        ease: 'elastic.out(1, 0.5)'
      }, 0);
      
      entranceTl.to(this.mesh.rotation, {
        z: 0,
        duration: 1.5,
        ease: 'power2.out'
      }, 0);
      
      // 第二阶段：材质透明度渐入 (0.5-2s)
      if (this.material && this.material.uniforms) {
        entranceTl.to(this.material.uniforms.uColorIntensity, {
          value: this.params.colorIntensity,
          duration: 1.5,
          ease: 'power2.out'
        }, 0.5);
        
        // 第三阶段：波浪效果逐渐激活 (1-3s)
        entranceTl.to(this.material.uniforms.uWaveAmplitude, {
          value: this.params.waveAmplitude,
          duration: 2,
          ease: 'elastic.out(1, 0.3)'
        }, 1);
        
        entranceTl.to(this.material.uniforms.uNoiseStrength, {
          value: this.params.noiseStrength,
          duration: 2,
          ease: 'power2.out'
        }, 1.2);
        
        // 第四阶段：添加入场波纹效果 (2-4s)
        entranceTl.call(() => {
          this.addEntranceRipples();
        }, null, 2);
      }
      
      // 更新入场进度
      entranceTl.to(this, {
        entranceProgress: 1,
        duration: 3,
        ease: 'none'
      }, 0);
      
    } catch (error) {
      console.error('入场动画启动失败:', error);
      // 如果动画失败，直接设置为完成状态
      this.isEntranceComplete = true;
      this.entranceProgress = 1;
    }
  }
  
  // 新增：入场波纹效果
  addEntranceRipples() {
    try {
      if (!this.material || !this.material.uniforms) return;
      
      // 创建多个波纹效果
      const rippleCount = 3;
      
      for (let i = 0; i < rippleCount; i++) {
        setTimeout(() => {
          // 临时增加波浪参数
          const currentFreq = this.material.uniforms.uWaveFrequency.value;
          const currentAmp = this.material.uniforms.uWaveAmplitude.value;
          
          gsap.to(this.material.uniforms.uWaveFrequency, {
            value: currentFreq * (2 + i * 0.5),
            duration: 0.4,
            ease: 'power2.out',
            yoyo: true,
            repeat: 1
          });
          
          gsap.to(this.material.uniforms.uWaveAmplitude, {
            value: currentAmp * (1.5 + i * 0.3),
            duration: 0.4,
            ease: 'power2.out',
            yoyo: true,
            repeat: 1
          });
        }, i * 600);
      }
    } catch (error) {
      console.error('入场波纹效果失败:', error);
    }
  }
  
  // 增强现有的update方法
  update() {
    try {
      // 更新时间
      this.time += 0.01;
      
      // 检查材质和uniforms是否存在
      if (!this.material || !this.material.uniforms) {
        return;
      }
      
      // 更新时间uniform
      if (this.material.uniforms.uTime) {
        this.material.uniforms.uTime.value = this.time;
      }
      
      // 如果入场动画未完成，添加额外的动态效果
      if (!this.isEntranceComplete) {
        this.updateEntranceEffects();
      }
      
      // 计算鼠标速度
      this.mouseVelocity.x = this.targetMouse.x - this.lastMouse.x;
      this.mouseVelocity.y = this.targetMouse.y - this.lastMouse.y;
      this.lastMouse.x = this.targetMouse.x;
      this.lastMouse.y = this.targetMouse.y;
      
      // 平滑过渡鼠标位置 - 根据鼠标按下状态调整跟随速度
      const followSpeed = this.isMouseDown ? 0.2 : 0.1;
      this.mouse.x += (this.targetMouse.x - this.mouse.x) * followSpeed;
      this.mouse.y += (this.targetMouse.y - this.mouse.y) * followSpeed;
      
      // 更新鼠标uniform
      if (this.material.uniforms.uMouse) {
        this.material.uniforms.uMouse.value = this.mouse;
      }
      
      // 平滑过渡滚动位置
      this.scrollY += (this.targetScrollY - this.scrollY) * 0.1;
      
      // 更新滚动uniform
      if (this.material.uniforms.uScroll) {
        this.material.uniforms.uScroll.value = this.scrollY;
      }
      
      // 增强鼠标速度响应
      const mouseSpeed = Math.sqrt(this.mouseVelocity.x * this.mouseVelocity.x + this.mouseVelocity.y * this.mouseVelocity.y);
      if (mouseSpeed > 0.01) {
        this.addDynamicMouseResponse(mouseSpeed);
      }
      
    } catch (error) {
      console.error('WavePlane更新错误:', error);
    }
  }
  
  // 新增：入场动画期间的额外效果
  updateEntranceEffects() {
    try {
      if (!this.material || !this.material.uniforms) return;
      
      // 基于入场进度添加动态颜色变化
      const colorPulse = Math.sin(this.time * 2) * 0.1 * (1 - this.entranceProgress);
      const currentIntensity = this.material.uniforms.uColorIntensity.value;
      
      if (currentIntensity > 0) {
        this.material.uniforms.uColorIntensity.value = Math.max(0, currentIntensity + colorPulse);
      }
      
      // 添加轻微的旋转效果
      if (this.mesh && this.entranceProgress < 1) {
        this.mesh.rotation.y = Math.sin(this.time * 0.5) * 0.1 * (1 - this.entranceProgress);
      }
    } catch (error) {
      console.error('入场效果更新失败:', error);
    }
  }
  
  // 新增：增强的鼠标响应
  addDynamicMouseResponse(mouseSpeed) {
    try {
      if (!this.material || !this.material.uniforms) return;
      
      // 根据鼠标速度动态调整多个参数
      const speedMultiplier = Math.min(mouseSpeed * 10, 2);
      
      // 临时增加波浪振幅
      const tempAmplitude = Math.min(0.3, this.params.waveAmplitude + speedMultiplier * 0.1);
      this.material.uniforms.uWaveAmplitude.value = tempAmplitude;
      
      // 临时增加颜色强度
      const tempColorIntensity = Math.min(1.5, this.params.colorIntensity + speedMultiplier * 0.2);
      this.material.uniforms.uColorIntensity.value = tempColorIntensity;
      
      // 恢复动画
      setTimeout(() => {
        if (this.material && this.material.uniforms) {
          gsap.to(this.material.uniforms.uWaveAmplitude, {
            value: this.params.waveAmplitude,
            duration: 1.0,
            ease: 'power2.out'
          });
          
          gsap.to(this.material.uniforms.uColorIntensity, {
            value: this.params.colorIntensity,
            duration: 1.0,
            ease: 'power2.out'
          });
        }
      }, 200);
    } catch (error) {
      console.error('动态鼠标响应失败:', error);
    }
  }
  
  // 增强现有的handleMouseDown方法
  handleMouseDown() {
    this.isMouseDown = true;
    
    // 鼠标按下时的增强效果
    if (this.material && this.material.uniforms && this.material.uniforms.uMouseStrength) {
      gsap.to(this.material.uniforms.uMouseStrength, {
        value: this.params.mouseStrength * 3,
        duration: 0.3,
        ease: 'power2.out'
      });
      
      // 同时增加颜色强度
      gsap.to(this.material.uniforms.uColorIntensity, {
        value: this.params.colorIntensity * 1.3,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
    
    // 添加强烈的波纹效果
    this.addIntenseRippleEffect();
  }
  
  // 增强现有的handleMouseUp方法
  handleMouseUp() {
    this.isMouseDown = false;
    
    // 鼠标抬起时的恢复效果
    if (this.material && this.material.uniforms) {
      gsap.to(this.material.uniforms.uMouseStrength, {
        value: this.params.mouseStrength,
        duration: 1.2,
        ease: 'elastic.out(1, 0.3)'
      });
      
      gsap.to(this.material.uniforms.uColorIntensity, {
        value: this.params.colorIntensity,
        duration: 1.2,
        ease: 'elastic.out(1, 0.3)'
      });
    }
  }
  
  // 新增：强烈波纹效果
  addIntenseRippleEffect() {
    try {
      if (!this.material || !this.material.uniforms) return;
      
      // 创建强烈的波纹动画
      const timeline = gsap.timeline();
      
      // 快速增加所有波浪参数
      timeline.to(this.material.uniforms.uWaveFrequency, {
        value: this.params.waveFrequency * 2.5,
        duration: 0.2,
        ease: 'power2.out'
      }, 0);
      
      timeline.to(this.material.uniforms.uWaveAmplitude, {
        value: this.params.waveAmplitude * 3,
        duration: 0.2,
        ease: 'power2.out'
      }, 0);
      
      timeline.to(this.material.uniforms.uNoiseStrength, {
        value: this.params.noiseStrength * 2,
        duration: 0.2,
        ease: 'power2.out'
      }, 0);
      
      // 然后弹性恢复
      timeline.to(this.material.uniforms.uWaveFrequency, {
        value: this.params.waveFrequency,
        duration: 1.5,
        ease: 'elastic.out(1, 0.4)'
      }, 0.2);
      
      timeline.to(this.material.uniforms.uWaveAmplitude, {
        value: this.params.waveAmplitude,
        duration: 1.5,
        ease: 'elastic.out(1, 0.4)'
      }, 0.2);
      
      timeline.to(this.material.uniforms.uNoiseStrength, {
        value: this.params.noiseStrength,
        duration: 1.5,
        ease: 'elastic.out(1, 0.4)'
      }, 0.2);
      
    } catch (error) {
      console.error('强烈波纹效果失败:', error);
    }
  }
  
  updateScroll(scrollY) {
    // 将滚动值归一化
    this.targetScrollY = scrollY / (document.body.scrollHeight - window.innerHeight)
  }
  
  updatePage(page) {
    // 根据页面调整参数
    if (page === 'home') {
      gsap.to(this.params, {
        waveAmplitude: 0.1,
        waveFrequency: 3.0,
        noiseStrength: 0.2,
        noiseScale: 1.5,
        colorIntensity: 1.0,
        mouseStrength: 0.3,
        duration: 1.5,
        ease: 'power2.inOut',
        onUpdate: () => this.updateUniforms()
      })
      
      // 添加一个波动动画效果
      this.addWaveAnimation()
    } else if (page === 'about') {
      gsap.to(this.params, {
        waveAmplitude: 0.05,
        waveFrequency: 2.0,
        noiseStrength: 0.15,
        noiseScale: 2.0,
        colorIntensity: 0.8,
        mouseStrength: 0.2,
        duration: 1.5,
        ease: 'power2.inOut',
        onUpdate: () => this.updateUniforms()
      })
    }
  }
  
  // 添加波动动画
  addWaveAnimation() {
    try {
      if (!this.material || !this.material.uniforms) return;
      
      // 创建一个循环动画
      const timeline = gsap.timeline({
        repeat: -1,
        yoyo: true,
        repeatDelay: 3
      });
      
      // 波浪频率变化
      timeline.to(this.material.uniforms.uWaveFrequency, {
        value: this.params.waveFrequency * 1.5,
        duration: 2,
        ease: 'sine.inOut'
      }, 0);
      
      // 颜色强度变化
      timeline.to(this.material.uniforms.uColorIntensity, {
        value: this.params.colorIntensity * 1.2,
        duration: 2,
        ease: 'sine.inOut'
      }, 0);
      
      // 噪声强度变化
      timeline.to(this.material.uniforms.uNoiseStrength, {
        value: this.params.noiseStrength * 1.5,
        duration: 2.5,
        ease: 'sine.inOut'
      }, 0.5);
    } catch (error) {
      console.error('添加波动动画时出错:', error);
    }
  }
  
  updateSection(index) {
    // 根据部分调整参数
    const intensity = 0.8 + (index * 0.05)
    const frequency = 2.0 + (index * 0.2)
    
    gsap.to(this.params, {
      waveFrequency: frequency,
      colorIntensity: intensity,
      duration: 1.0,
      ease: 'power2.inOut',
      onUpdate: () => this.updateUniforms()
    })
  }
  
  updateUniforms() {
    try {
      // 检查材质和uniforms是否存在
      if (!this.material || !this.material.uniforms) {
        console.warn('材质或uniforms不存在，无法更新');
        return;
      }
      
      // 更新着色器uniforms - 添加检查以防止错误
      if (this.material.uniforms.uWaveAmplitude) {
        this.material.uniforms.uWaveAmplitude.value = this.params.waveAmplitude;
      }
      
      if (this.material.uniforms.uWaveFrequency) {
        this.material.uniforms.uWaveFrequency.value = this.params.waveFrequency;
      }
      
      if (this.material.uniforms.uNoiseStrength) {
        this.material.uniforms.uNoiseStrength.value = this.params.noiseStrength;
      }
      
      if (this.material.uniforms.uNoiseScale) {
        this.material.uniforms.uNoiseScale.value = this.params.noiseScale;
      }
      
      if (this.material.uniforms.uColorIntensity) {
        this.material.uniforms.uColorIntensity.value = this.params.colorIntensity;
      }
      
      if (this.material.uniforms.uMouseStrength) {
        this.material.uniforms.uMouseStrength.value = this.params.mouseStrength;
      }
    } catch (error) {
      console.error('更新uniforms时出错:', error);
    }
  }
  
  onResize() {
    try {
      // 检查材质和uniforms是否存在
      if (!this.material || !this.material.uniforms || !this.material.uniforms.uResolution) {
        console.warn('材质、uniforms或uResolution不存在，无法更新分辨率');
        return;
      }
      
      // 更新分辨率uniform
      this.material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
      console.log('更新分辨率:', window.innerWidth, window.innerHeight);
    } catch (error) {
      console.error('更新分辨率时出错:', error);
    }
  }
  
  dispose() {
    try {
      console.log('清理WavePlane资源...');
      
      // 移除事件监听器
      window.removeEventListener('mousedown', this.handleMouseDown);
      window.removeEventListener('mouseup', this.handleMouseUp);
      window.removeEventListener('touchstart', this.handleMouseDown);
      window.removeEventListener('touchend', this.handleMouseUp);
      
      // 检查几何体和材质是否存在
      if (this.geometry) {
        this.geometry.dispose();
        console.log('几何体已清理');
      }
      
      if (this.material) {
        this.material.dispose();
        console.log('材质已清理');
      }
      
      // 清理GSAP动画
      gsap.killTweensOf(this.material?.uniforms?.uWaveFrequency);
      gsap.killTweensOf(this.material?.uniforms?.uWaveAmplitude);
      gsap.killTweensOf(this.material?.uniforms?.uColorIntensity);
      gsap.killTweensOf(this.material?.uniforms?.uNoiseStrength);
      gsap.killTweensOf(this.material?.uniforms?.uMouseStrength);
      
      console.log('WavePlane资源清理完成');
    } catch (error) {
      console.error('清理资源时出错:', error);
    }
  }
}

export default WavePlane