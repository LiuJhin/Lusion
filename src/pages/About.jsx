import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const About = ({ renderer }) => {
  const aboutRef = useRef(null)
  const sectionsRef = useRef([])
  const titleRefs = useRef([])
  const textRefs = useRef([])
  const heroRef = useRef(null)
  const backgroundRef = useRef(null)
  
  useEffect(() => {
    if (renderer && renderer.isInitialized) {
      // 设置当前活动页面
      renderer.setActivePage('about')
      
      // Hero区域入场动画
      const heroTl = gsap.timeline({ delay: 0.3 })
      heroTl.fromTo(heroRef.current, 
        { opacity: 0, scale: 0.9, y: 50 },
        { 
          opacity: 1, 
          scale: 1, 
          y: 0, 
          duration: 1.5, 
          ease: 'power3.out' 
        }
      )
      
      // 相机动画 - 移动到更远的位置以便更好地查看内容
      renderer.animateCamera({
        position: { x: 0, y: 0, z: 4 },
        rotation: { x: 0, y: 0, z: 0 },
        duration: 2.5
      })
      
      // 为每个section设置复杂的ScrollTrigger动画
      const sections = sectionsRef.current
      const titles = titleRefs.current
      const texts = textRefs.current
      
      sections.forEach((section, index) => {
        const title = titles[index]
        const text = texts[index]
        
        // Section容器动画
        gsap.fromTo(section, 
          { 
            opacity: 0, 
            y: 80,
            scale: 0.95,
            rotationX: 15
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotationX: 0,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 85%',
              end: 'top 30%',
              toggleActions: 'play none none reverse',
              onEnter: () => {
                 // 通知渲染器当前查看的部分
                 if (renderer.onSectionVisible) {
                   renderer.onSectionVisible(index + 1)
                 }
               },
               onLeave: () => {
                 // 离开时的效果
                 if (renderer.onSectionVisible) {
                   renderer.onSectionVisible(0)
                 }
               }
            }
          }
        )
        
        // 标题动画 - 分别处理每个标题
        if (title) {
          gsap.fromTo(title,
            { 
              opacity: 0, 
              x: -50,
              rotationY: -15
            },
            {
              opacity: 1,
              x: 0,
              rotationY: 0,
              duration: 1,
              ease: 'back.out(1.7)',
              scrollTrigger: {
                trigger: section,
                start: 'top 75%',
                end: 'top 40%',
                toggleActions: 'play none none reverse'
              },
              delay: 0.2
            }
          )
        }
        
        // 文本动画 - 逐字符或逐行显示效果
        if (text) {
          gsap.fromTo(text,
            { 
              opacity: 0, 
              y: 30,
              clipPath: 'inset(100% 0 0 0)'
            },
            {
              opacity: 1,
              y: 0,
              clipPath: 'inset(0% 0 0 0)',
              duration: 1.5,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: section,
                start: 'top 70%',
                end: 'top 35%',
                toggleActions: 'play none none reverse'
              },
              delay: 0.4
            }
          )
        }
        
        // 为不同section添加特殊效果
        switch(index) {
          case 0: // About This Experience
            gsap.to(section, {
              backgroundPosition: '200% 50%',
              duration: 20,
              ease: 'none',
              repeat: -1,
              yoyo: true,
              scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play pause resume pause'
              }
            })
            break
            
          case 1: // Technology Stack
            // 添加技术图标动画效果
            gsap.fromTo(section,
              { filter: 'hue-rotate(0deg)' },
              {
                filter: 'hue-rotate(360deg)',
                duration: 8,
                ease: 'none',
                repeat: -1,
                scrollTrigger: {
                  trigger: section,
                  start: 'top 80%',
                  end: 'bottom 20%',
                  toggleActions: 'play pause resume pause'
                }
              }
            )
            break
            
          case 2: // Interaction
            // 添加交互式悬浮效果
            gsap.to(section, {
              y: -10,
              duration: 2,
              ease: 'power2.inOut',
              repeat: -1,
              yoyo: true,
              scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play pause resume pause'
              }
            })
            break
            
          case 3: // Performance
            // 添加性能指示器动画
            gsap.fromTo(section,
              { boxShadow: '0 0 0 rgba(64, 128, 255, 0)' },
              {
                boxShadow: '0 0 30px rgba(64, 128, 255, 0.5)',
                duration: 3,
                ease: 'power2.inOut',
                repeat: -1,
                yoyo: true,
                scrollTrigger: {
                  trigger: section,
                  start: 'top 80%',
                  end: 'bottom 20%',
                  toggleActions: 'play pause resume pause'
                }
              }
            )
            break
        }
      })
      
      // 全局滚动进度动画
      gsap.to(backgroundRef.current, {
        rotation: 360,
        duration: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: aboutRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1
        }
      })
    }
    
    return () => {
      // 清理ScrollTrigger
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
      
      // 页面离开时的清理工作
      if (renderer) {
        renderer.resetCamera()
      }
    }
  }, [renderer, renderer?.isInitialized])
  
  // 添加引用到sections数组
  const addToSectionsRef = (el) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el)
    }
  }
  
  // 添加引用到titles数组
  const addToTitlesRef = (el) => {
    if (el && !titleRefs.current.includes(el)) {
      titleRefs.current.push(el)
    }
  }
  
  // 添加引用到texts数组
  const addToTextsRef = (el) => {
    if (el && !textRefs.current.includes(el)) {
      textRefs.current.push(el)
    }
  }

  return (
    <div ref={aboutRef} className="page about-page">
      {/* 背景动画元素 */}
      <div ref={backgroundRef} className="about-background"></div>
      
      {/* Hero区域 */}
      <div ref={heroRef} className="about-hero">
        <h1 className="about-hero-title">关于这个体验</h1>
        <p className="about-hero-subtitle">探索WebGL、React和GSAP的强大组合</p>
      </div>
      
      <div className="about-content page-content">
        <section ref={addToSectionsRef} className="about-section about-section-experience">
          <h2 ref={addToTitlesRef} className="about-title">About This Experience</h2>
          <p ref={addToTextsRef} className="about-text">
            This interactive WebGL experience showcases the power of combining React with Three.js and GLSL shaders.
            The wave effect you see in the background is created using vertex and fragment shaders that respond to
            your mouse movements and scroll position. Every interaction creates ripples and waves that flow across
            the digital canvas, creating an immersive and responsive environment.
          </p>
        </section>
        
        <section ref={addToSectionsRef} className="about-section about-section-tech">
          <h2 ref={addToTitlesRef} className="about-title">Technology Stack</h2>
          <p ref={addToTextsRef} className="about-text">
            Built with React 18, Three.js, GSAP for animations, and Lenis for smooth scrolling.
            The wave effect is achieved through custom GLSL shaders that manipulate the vertices
            of a plane geometry based on time and user interaction. Advanced techniques include
            vertex displacement, fragment coloring, and real-time uniform updates for seamless performance.
          </p>
        </section>
        
        <section ref={addToSectionsRef} className="about-section about-section-interaction">
          <h2 ref={addToTitlesRef} className="about-title">Interaction</h2>
          <p ref={addToTextsRef} className="about-text">
            Move your mouse around to influence the wave pattern. Scroll down to see how the
            wave reacts to your scrolling. The page transitions are handled by GSAP and React Router,
            creating a seamless experience between different sections of the site. Each gesture
            and movement is translated into beautiful visual feedback through sophisticated algorithms.
          </p>
        </section>
        
        <section ref={addToSectionsRef} className="about-section about-section-performance">
          <h2 ref={addToTitlesRef} className="about-title">Performance</h2>
          <p ref={addToTextsRef} className="about-text">
            The WebGL renderer is optimized for performance, using techniques like requestAnimationFrame
            for smooth animations and efficient shader calculations. The smooth scrolling is implemented
            using Lenis, which provides a natural feeling scroll experience across different devices.
            Memory management and GPU optimization ensure consistent 60fps performance across platforms.
          </p>
        </section>
      </div>
    </div>
  )
}

export default About