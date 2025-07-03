import Lenis from '@studio-freight/lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * 设置平滑滚动和滚动动画
 * @param {Object} renderer - WebGL渲染器实例
 */
export const setupScrollAnimation = (renderer) => {
  // 初始化Lenis平滑滚动 - 优化配置
  const lenis = new Lenis({
    duration: 1.5, // 增加持续时间，让滚动更平滑
    easing: (t) => {
      // 自定义缓动函数，提供更自然的滚动感觉
      return t < 0.5 
        ? 4 * t * t * t 
        : 1 - Math.pow(-2 * t + 2, 3) / 2
    },
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1.2, // 增加鼠标滚轮敏感度
    smoothTouch: true, // 启用触摸设备平滑滚动
    touchMultiplier: 1.5, // 优化触摸滚动倍数
    infinite: false,
    normalizeWheel: true, // 标准化滚轮事件
    lerp: 0.1 // 线性插值系数，控制滚动的平滑度
  })
  
  // 滚动进度追踪
  let scrollProgress = 0
  let scrollVelocity = 0
  
  // 将滚动位置传递给渲染器，并添加更多交互效果
  lenis.on('scroll', ({ scroll, limit, velocity, direction, progress }) => {
    scrollProgress = progress
    scrollVelocity = velocity
    
    if (renderer) {
      renderer.updateScroll(scroll)
      
      // 根据滚动速度调整WebGL效果
      if (renderer.updateScrollVelocity) {
        renderer.updateScrollVelocity(velocity)
      }
      
      // 根据滚动进度调整场景
      if (renderer.updateScrollProgress) {
        renderer.updateScrollProgress(progress)
      }
    }
    
    // 动态调整页面元素的视差效果
    updateParallaxElements(progress, velocity)
  })
  
  // 视差效果函数
  function updateParallaxElements(progress, velocity) {
    const parallaxElements = document.querySelectorAll('[data-parallax]')
    
    parallaxElements.forEach(element => {
      const speed = parseFloat(element.dataset.parallax) || 0.5
      const yPos = -(progress * speed * 100)
      element.style.transform = `translateY(${yPos}px)`
    })
    
    // 根据滚动速度添加动态模糊效果
    const blurAmount = Math.min(Math.abs(velocity) * 0.1, 5)
    document.body.style.filter = `blur(${blurAmount}px)`
    
    // 清除模糊效果
    clearTimeout(window.blurTimeout)
    window.blurTimeout = setTimeout(() => {
      document.body.style.filter = 'blur(0px)'
    }, 100)
  }
  
  // 将Lenis与GSAP的requestAnimationFrame集成
  function raf(time) {
    lenis.raf(time)
    requestAnimationFrame(raf)
  }
  
  requestAnimationFrame(raf)
  
  // 设置ScrollTrigger - 增强配置
  ScrollTrigger.defaults({
    scroller: document.body,
    toggleActions: 'play pause resume reverse',
    markers: false, // 开发时可设为true查看触发点
    refreshPriority: 1
  })
  
  // 添加全局滚动进度指示器
  const progressBar = document.createElement('div')
  progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 0%;
    height: 3px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    z-index: 9999;
    transition: width 0.1s ease;
  `
  document.body.appendChild(progressBar)
  
  // 更新进度条
  lenis.on('scroll', ({ progress }) => {
    progressBar.style.width = `${progress * 100}%`
  })
  
  // 添加键盘导航支持
  document.addEventListener('keydown', (e) => {
    switch(e.key) {
      case 'ArrowUp':
        lenis.scrollTo(lenis.scroll - window.innerHeight * 0.5, { duration: 1 })
        break
      case 'ArrowDown':
        lenis.scrollTo(lenis.scroll + window.innerHeight * 0.5, { duration: 1 })
        break
      case 'Home':
        lenis.scrollTo(0, { duration: 2 })
        break
      case 'End':
        lenis.scrollTo(document.body.scrollHeight, { duration: 2 })
        break
    }
  })
  
  // 刷新ScrollTrigger以确保正确工作
  ScrollTrigger.refresh()
  
  // 返回lenis实例和清理函数
  return {
    lenis,
    destroy: () => {
      lenis.destroy()
      document.body.removeChild(progressBar)
      clearTimeout(window.blurTimeout)
      document.body.style.filter = 'blur(0px)'
    }
  }
}