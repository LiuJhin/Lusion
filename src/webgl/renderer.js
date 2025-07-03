import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { gsap } from 'gsap'
import WavePlane from './objects/WavePlane'

class Renderer {
  constructor() {
    // 初始化状态标志
    this.isInitialized = false;
    
    try {
      console.log('Renderer构造函数开始执行');
      
      // 创建容器
      this.container = document.createElement('div');
      this.container.classList.add('webgl-container');
      document.body.appendChild(this.container);
      console.log('WebGL容器已创建并添加到DOM');
      
      // 初始化属性
      this.mouse = new THREE.Vector2(0, 0);
      this.scrollY = 0;
      this.activePage = 'home';
      this.activeSection = 0;
      
      // 检查WebGL支持
      if (!this.checkWebGLSupport()) {
        throw new Error('WebGL不受支持');
      }
      
      // 设置组件
      this.setupRenderer();
      this.setupScene();
      this.setupCamera();
      this.setupLights();
      this.setupObjects();
      this.setupEvents();
      
      // 标记初始化完成
      this.isInitialized = true;
      console.log('Renderer初始化完成');
      
      // 通知应用程序渲染器已成功初始化
      const loadingCompleteEvent = new CustomEvent('webglLoadingComplete', { detail: { success: true } });
      window.dispatchEvent(loadingCompleteEvent);
      
      // 开始渲染循环
      this.render();
    } catch (error) {
      console.error('Renderer构造函数错误:', error);
      this.handleInitError(error);
    }
  }
  
  // 检查WebGL支持
  checkWebGLSupport() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      const isSupported = !!gl;
      console.log('WebGL支持状态:', isSupported ? '支持' : '不支持');
      return isSupported;
    } catch (e) {
      console.error('检查WebGL支持时出错:', e);
      return false;
    }
  }
  
  // 处理初始化错误
  handleInitError(error) {
    console.error('渲染器初始化失败:', error);
    
    // 创建错误消息元素
    const errorContainer = document.createElement('div');
    errorContainer.style.position = 'fixed';
    errorContainer.style.top = '50%';
    errorContainer.style.left = '50%';
    errorContainer.style.transform = 'translate(-50%, -50%)';
    errorContainer.style.color = 'white';
    errorContainer.style.background = 'rgba(0,0,0,0.8)';
    errorContainer.style.padding = '20px';
    errorContainer.style.borderRadius = '5px';
    errorContainer.style.zIndex = '1000';
    errorContainer.textContent = '3D渲染初始化失败，请尝试使用最新的浏览器。';
    
    // 添加到DOM
    if (this.container && this.container.parentNode) {
      document.body.appendChild(errorContainer);
    }
  }
  
  setupRenderer() {
    try {
      console.log('设置WebGL渲染器...');
      
      // 创建渲染器，使用更保守的设置
      this.renderer = new THREE.WebGLRenderer({ 
        antialias: false, // 关闭抗锯齿以提高性能
        alpha: true,
        powerPreference: 'default', // 使用默认性能配置
        failIfMajorPerformanceCaveat: false // 即使在性能较差的设备上也尝试渲染
      });
      
      // 设置渲染器尺寸和像素比
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      // 限制像素比，提高性能
      const pixelRatio = Math.min(window.devicePixelRatio, 1.5);
      this.renderer.setPixelRatio(pixelRatio);
      this.renderer.setClearColor(0x000000, 1);
      
      // 添加到DOM
      this.container.appendChild(this.renderer.domElement);
      console.log('WebGL渲染器设置完成');
    } catch (error) {
      console.error('设置渲染器时出错:', error);
      throw new Error('无法创建WebGL渲染器: ' + error.message);
    }
  }
  
  setupScene() {
    this.scene = new THREE.Scene()
  }
  
  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    )
    this.camera.position.set(0, 0, 2)
    this.scene.add(this.camera)
    
    // 开发模式下可以使用OrbitControls
    // this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    // this.controls.enableDamping = true
  }
  
  setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    this.scene.add(ambientLight)
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(1, 1, 1)
    this.scene.add(directionalLight)
  }
  
  setupObjects() {
    try {
      console.log('设置场景对象...');
      
      // 尝试创建波浪平面
      this.wavePlane = new WavePlane();
      
      // 检查mesh是否存在
      if (!this.wavePlane || !this.wavePlane.mesh) {
        throw new Error('WavePlane创建失败或mesh不存在');
      }
      
      // 添加到场景
      this.scene.add(this.wavePlane.mesh);
      console.log('场景对象设置完成');
    } catch (error) {
      console.error('设置场景对象时出错:', error);
      
      // 创建备用平面
      console.log('创建备用平面...');
      const geometry = new THREE.PlaneGeometry(4, 3);
      const material = new THREE.MeshBasicMaterial({ 
        color: 0x0055ff, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
      });
      
      // 创建备用对象
      this.wavePlane = {
        mesh: new THREE.Mesh(geometry, material),
        update: () => {}, // 空函数
        updateMouse: () => {},
        updateScroll: () => {},
        updatePage: () => {},
        updateSection: () => {},
        onResize: () => {},
        dispose: () => {
          if (geometry) geometry.dispose();
          if (material) material.dispose();
        }
      };
      
      // 添加备用对象到场景
      this.scene.add(this.wavePlane.mesh);
      console.log('备用平面已创建并添加到场景');
    }
  }
  
  setupEvents() {
    window.addEventListener('resize', this.onResize.bind(this))
    window.addEventListener('mousemove', this.onMouseMove.bind(this))
  }
  
  onResize() {
    // 更新相机
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    
    // 更新渲染器
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    
    // 更新波浪平面
    if (this.wavePlane) {
      this.wavePlane.onResize()
    }
  }
  
  onMouseMove(event) {
    // 将鼠标位置归一化为 -1 到 1 之间
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    
    // 更新波浪平面的鼠标位置
    if (this.wavePlane) {
      this.wavePlane.updateMouse(this.mouse)
    }
  }
  
  updateScroll(scrollY) {
    this.scrollY = scrollY
    
    // 更新波浪平面的滚动位置
    if (this.wavePlane) {
      this.wavePlane.updateScroll(scrollY)
    }
  }
  
  setActivePage(page) {
    this.activePage = page
    
    // 根据页面调整波浪平面的参数
    if (this.wavePlane) {
      this.wavePlane.updatePage(page)
    }
  }
  
  onSectionVisible(index) {
    this.activeSection = index
    
    // 根据部分调整波浪平面的参数
    if (this.wavePlane) {
      this.wavePlane.updateSection(index)
    }
  }
  
  animateCamera(options) {
    const { position, rotation, duration = 2 } = options
    
    if (position) {
      gsap.to(this.camera.position, {
        x: position.x,
        y: position.y,
        z: position.z,
        duration,
        ease: 'power2.inOut'
      })
    }
    
    if (rotation) {
      gsap.to(this.camera.rotation, {
        x: rotation.x,
        y: rotation.y,
        z: rotation.z,
        duration,
        ease: 'power2.inOut'
      })
    }
  }
  
  resetCamera() {
    gsap.to(this.camera.position, {
      x: 0,
      y: 0,
      z: 2,
      duration: 1.5,
      ease: 'power2.inOut'
    })
    
    gsap.to(this.camera.rotation, {
      x: 0,
      y: 0,
      z: 0,
      duration: 1.5,
      ease: 'power2.inOut'
    })
  }
  
  render() {
    try {
      // 检查初始化状态
      if (!this.isInitialized) {
        console.warn('渲染器未完全初始化，跳过渲染');
        return;
      }
      
      // 检查必要组件
      if (!this.renderer || !this.scene || !this.camera) {
        console.warn('渲染所需组件不存在，跳过渲染');
        return;
      }
      
      // 更新波浪平面
      if (this.wavePlane) {
        this.wavePlane.update();
      }
      
      // 渲染场景
      this.renderer.render(this.scene, this.camera);
      
      // 使用箭头函数避免this绑定问题
      requestAnimationFrame(() => this.render());
    } catch (error) {
      console.error('渲染循环错误:', error);
      // 尝试在短暂延迟后恢复渲染
      setTimeout(() => {
        console.log('尝试恢复渲染循环...');
        requestAnimationFrame(() => this.render());
      }, 1000);
    }
  }
  
  // 检查WebGL支持
  checkWebGLSupport() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      const isSupported = !!gl;
      
      if (isSupported) {
        console.log('WebGL支持检测: 支持');
      } else {
        console.warn('WebGL支持检测: 不支持');
      }
      
      return isSupported;
    } catch (error) {
      console.error('WebGL支持检测错误:', error);
      return false;
    }
  }
  
  // 处理初始化错误
  handleInitError(error) {
    console.error('渲染器初始化错误:', error);
    
    // 创建错误消息元素
    const errorContainer = document.createElement('div');
    errorContainer.style.position = 'absolute';
    errorContainer.style.top = '50%';
    errorContainer.style.left = '50%';
    errorContainer.style.transform = 'translate(-50%, -50%)';
    errorContainer.style.color = '#ff0000';
    errorContainer.style.background = 'rgba(0, 0, 0, 0.7)';
    errorContainer.style.padding = '20px';
    errorContainer.style.borderRadius = '5px';
    errorContainer.style.textAlign = 'center';
    errorContainer.style.maxWidth = '80%';
    errorContainer.style.zIndex = '1000';
    
    // 设置错误消息
    errorContainer.innerHTML = `
      <h3>渲染错误</h3>
      <p>${error.message || '无法初始化3D渲染'}</p>
      <p>请尝试使用最新版Chrome或Firefox浏览器</p>
    `;
    
    // 添加到容器
    if (this.container) {
      this.container.appendChild(errorContainer);
    } else {
      document.body.appendChild(errorContainer);
    }
    
    // 通知应用程序加载完成（即使是错误状态）
    const loadingCompleteEvent = new CustomEvent('webglLoadingComplete', { detail: { success: false, error } });
    window.dispatchEvent(loadingCompleteEvent);
  }
  
  dispose() {
    try {
      console.log('清理渲染器资源...');
      
      // 移除事件监听器
      window.removeEventListener('resize', this.onResize);
      window.removeEventListener('mousemove', this.onMouseMove);
      
      // 清理波浪平面
      if (this.wavePlane) {
        this.wavePlane.dispose();
      }
      
      // 清理渲染器
      if (this.renderer) {
        this.renderer.dispose();
        
        // 从DOM中移除canvas
        if (this.renderer.domElement && this.renderer.domElement.parentNode) {
          this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        }
      }
      
      // 清理场景
      if (this.scene) {
        this.scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(material => material.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
      }
      
      console.log('渲染器资源清理完成');
    } catch (error) {
      console.error('清理渲染器资源时出错:', error);
    }
  }
}

export default Renderer