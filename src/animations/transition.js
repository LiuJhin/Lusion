import { gsap } from 'gsap'

/**
 * 页面过渡动画
 * @param {HTMLElement} transitionElement - 过渡元素
 * @param {string} pathname - 当前路径
 * @param {Object} renderer - WebGL渲染器实例
 */
export const pageTransition = (transitionElement, pathname, renderer) => {
  // 创建时间线
  const tl = gsap.timeline()
  
  // 页面离开动画
  tl.to(transitionElement, {
    y: '0%',
    duration: 0.6,
    ease: 'power2.inOut',
    onStart: () => {
      // 在过渡开始时调整渲染器
      if (renderer) {
        // 淡出当前页面的内容
        gsap.to('.page-content', {
          opacity: 0,
          y: -30,
          duration: 0.4,
          ease: 'power2.in'
        })
      }
    }
  })
  
  // 页面进入动画
  .to(transitionElement, {
    y: '-100%',
    duration: 0.6,
    ease: 'power2.inOut',
    delay: 0.1,
    onComplete: () => {
      // 在过渡完成后设置新页面
      if (renderer) {
        // 根据路径设置活动页面
        const pageName = pathname === '/' ? 'home' : pathname.substring(1)
        renderer.setActivePage(pageName)
        
        // 淡入新页面的内容
        gsap.fromTo('.page-content', 
          { opacity: 0, y: 30 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.8, 
            ease: 'power2.out',
            delay: 0.2
          }
        )
      }
    }
  })
  
  return tl
}