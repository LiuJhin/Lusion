import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import { Flip } from "gsap/Flip";

gsap.registerPlugin(ScrollTrigger, TextPlugin, Flip);

const Home = ({ renderer }) => {
  const homeRef = useRef(null);
  const heroRef = useRef(null);
  const hero3DRef = useRef(null); // 新增：3D场景容器引用
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const contactRef = useRef(null);
  const scrollIndicatorRef = useRef(null);
  const introRef = useRef(null);
  const featuresRef = useRef(null);
  const portfolioRef = useRef(null);
  const techRef = useRef(null);
  const teamRef = useRef(null);
  const teamRefs = useRef([]);
  const ctaSectionRef = useRef(null);
  const footerRef = useRef(null);

  // 文本动画相关的 refs
  const introTitleRef = useRef(null);
  const introTextRefs = useRef([]);
  const featuresTitleRef = useRef(null);
  const portfolioTitleRef = useRef(null);
  const techTitleRef = useRef(null);
  const teamTitleRef = useRef(null);
  const ctaTitleRef = useRef(null);
  const ctaTextRef = useRef(null);

  // 鼠标位置状态
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // 新增：3D场景相关状态
  const [hero3DScene, setHero3DScene] = useState(null);
  const [isHero3DLoaded, setIsHero3DLoaded] = useState(false);

  // Flip 动画状态
  const [isFlipActive, setIsFlipActive] = useState(false);
  const [currentLayout, setCurrentLayout] = useState("grid");

  // 为 Flip 动画添加 ref 引用
  const featureRefs = useRef([]);
  const portfolioRefs = useRef([]);
  const techRefs = useRef([]);

  // 文本动画辅助函数
  const splitTextIntoChars = (element) => {
    if (!element) return [];
    const text = element.textContent;
    element.innerHTML = "";
    const chars = [];

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const span = document.createElement("span");
      span.textContent = char === " " ? "\u00A0" : char;
      span.style.display = "inline-block";
      span.style.opacity = "0";
      span.style.transform = "translateY(50px)";
      element.appendChild(span);
      chars.push(span);
    }

    return chars;
  };

  const animateTextReveal = (element, delay = 0) => {
    const chars = splitTextIntoChars(element);

    gsap.to(chars, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.03,
      delay: delay,
    });
  };

  const animateTypewriter = (element, delay = 0) => {
    if (!element) return;
    const originalText = element.textContent;
    element.textContent = "";

    gsap.to(element, {
      text: originalText,
      duration: originalText.length * 0.05,
      ease: "none",
      delay: delay,
    });
  };

  const animateTextSlideUp = (element, delay = 0) => {
    if (!element) return;

    gsap.fromTo(
      element,
      {
        opacity: 0,
        y: 30,
        rotationX: 45,
      },
      {
        opacity: 1,
        y: 0,
        rotationX: 0,
        duration: 1,
        ease: "power3.out",
        delay: delay,
      }
    );
  };

  // Flip 动画辅助函数
  const animateLayoutChange = (container, newLayout) => {
    if (!container) return;

    setIsFlipActive(true);

    // 记录当前状态
    const state = Flip.getState(container.children);

    // 改变布局
    setCurrentLayout(newLayout);

    // 应用新的 CSS 类
    container.className =
      container.className.replace(/layout-\w+/g, "") + ` layout-${newLayout}`;

    // 执行 Flip 动画
    Flip.from(state, {
      duration: 0.8,
      ease: "power2.inOut",
      stagger: 0.05,
      onComplete: () => setIsFlipActive(false),
    });
  };

  const animateCardShuffle = (cards) => {
    if (!cards || cards.length === 0) return;

    // 记录当前状态
    const state = Flip.getState(cards);

    // 随机重新排列
    const parent = cards[0].parentNode;
    const shuffled = [...cards].sort(() => Math.random() - 0.5);

    shuffled.forEach((card) => parent.appendChild(card));

    // 执行 Flip 动画
    Flip.from(state, {
      duration: 1,
      ease: "power2.inOut",
      stagger: 0.1,
    });
  };

  const animateCardExpand = (card) => {
    if (!card) return;

    const state = Flip.getState(card);

    // 添加展开状态的类
    card.classList.add("expanded");

    Flip.from(state, {
      duration: 0.6,
      ease: "power2.out",
      scale: true,
      simple: true,
    });
  };

  const animateCardCollapse = (card) => {
    if (!card) return;

    const state = Flip.getState(card);

    // 移除展开状态的类
    card.classList.remove("expanded");

    Flip.from(state, {
      duration: 0.4,
      ease: "power2.in",
      scale: true,
      simple: true,
    });
  };

  // 新增：初始化Hero区域的3D场景
  const initHero3DScene = async () => {
    try {
      const container = hero3DRef.current;
      if (!container) return;

      // 动态导入Three.js
      const THREE = await import('three');
      
      // 创建场景
      const scene = new THREE.Scene();
      
      // 创建相机
      const camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      );
      camera.position.z = 5;
      
      // 创建渲染器
      const renderer = new THREE.WebGLRenderer({ 
        alpha: true, 
        antialias: true 
      });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setClearColor(0x000000, 0); // 透明背景
      container.appendChild(renderer.domElement);
      
      // 创建几何体 - 浮动的粒子群
      const particleCount = 200;
      const particles = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      
      for (let i = 0; i < particleCount * 3; i += 3) {
        // 随机位置
        positions[i] = (Math.random() - 0.5) * 20;
        positions[i + 1] = (Math.random() - 0.5) * 20;
        positions[i + 2] = (Math.random() - 0.5) * 20;
        
        // 渐变颜色
        colors[i] = Math.random() * 0.5 + 0.5; // R
        colors[i + 1] = Math.random() * 0.3 + 0.7; // G
        colors[i + 2] = 1; // B
      }
      
      particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      
      // 粒子材质
      const particleMaterial = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      });
      
      const particleSystem = new THREE.Points(particles, particleMaterial);
      scene.add(particleSystem);
      
      // 创建主要几何体 - 旋转的环形
      const torusGeometry = new THREE.TorusGeometry(2, 0.3, 16, 100);
      const torusMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffaa,
        wireframe: true,
        transparent: true,
        opacity: 0.6
      });
      const torus = new THREE.Mesh(torusGeometry, torusMaterial);
      scene.add(torus);
      
      // 添加环境光
      const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
      scene.add(ambientLight);
      
      // 添加点光源
      const pointLight = new THREE.PointLight(0x00ffaa, 1, 100);
      pointLight.position.set(10, 10, 10);
      scene.add(pointLight);
      
      // 动画循环
      const animate = () => {
        requestAnimationFrame(animate);
        
        // 旋转环形
        torus.rotation.x += 0.01;
        torus.rotation.y += 0.005;
        
        // 粒子动画
        const positions = particleSystem.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 1] += Math.sin(Date.now() * 0.001 + positions[i]) * 0.01;
        }
        particleSystem.geometry.attributes.position.needsUpdate = true;
        
        // 相机轻微摆动
        camera.position.x = Math.sin(Date.now() * 0.0005) * 0.5;
        camera.position.y = Math.cos(Date.now() * 0.0003) * 0.3;
        camera.lookAt(scene.position);
        
        renderer.render(scene, camera);
      };
      
      animate();
      
      // 响应式处理
      const handleResize = () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };
      
      window.addEventListener('resize', handleResize);
      
      // 保存场景引用
      setHero3DScene({
        scene,
        camera,
        renderer,
        torus,
        particleSystem,
        cleanup: () => {
          window.removeEventListener('resize', handleResize);
          container.removeChild(renderer.domElement);
          renderer.dispose();
        }
      });
      
      setIsHero3DLoaded(true);
      
    } catch (error) {
      console.error('Hero 3D场景初始化失败:', error);
    }
  };

  // 手动触发作品部分动画
  const triggerPortfolioAnimation = () => {
    if (portfolioRefs.current && portfolioTitleRef.current) {
      // 触发作品卡片动画
      portfolioRefs.current.forEach((portfolio, index) => {
        if (portfolio) {
          gsap.fromTo(
            portfolio,
            { opacity: 0, y: 50, scale: 0.9 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 1,
              ease: "power2.out",
              delay: index * 0.15,
            }
          );
        }
      });

      // 触发标题动画
      setTimeout(() => {
        animateTextReveal(portfolioTitleRef.current, 0);
      }, 200);

      // 通知渲染器
      if (renderer) {
        renderer.onSectionVisible(3);
      }
    }
  };

  // 处理鼠标移动
  const handleMouseMove = (e) => {
    // 计算归一化的鼠标位置 (-1 到 1 范围)
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    setMousePosition({ x, y });

    // 将鼠标位置传递给渲染器
    if (renderer && renderer.wavePlane) {
      renderer.wavePlane.updateMouse({ x, y });
    }
  };

  useEffect(() => {
    // 初始化3D场景
    initHero3DScene();
    
    // 添加鼠标移动事件监听器
    window.addEventListener("mousemove", handleMouseMove);

    // Knowledge filter functionality
    const filterTabs = document.querySelectorAll('.filter-tab');
    const knowledgeItems = document.querySelectorAll('.knowledge-item');
    
    const handleFilterClick = (e) => {
      const category = e.target.dataset.category;
      
      // Update active tab
      filterTabs.forEach(tab => tab.classList.remove('active'));
      e.target.classList.add('active');
      
      // Filter items with animation
      knowledgeItems.forEach((item, index) => {
        const itemCategory = item.dataset.category;
        const shouldShow = category === 'all' || itemCategory === category;
        
        if (shouldShow) {
          gsap.to(item, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.4,
            delay: index * 0.1,
            ease: "power2.out"
          });
          item.style.display = 'block';
        } else {
          gsap.to(item, {
            opacity: 0,
            y: 20,
            scale: 0.95,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
              item.style.display = 'none';
            }
          });
        }
      });
    };
    
    const handleBookmarkClick = (e) => {
      e.stopPropagation();
      const btn = e.currentTarget;
      btn.classList.toggle('bookmarked');
      
      // Update icon
      const icon = btn.querySelector('i');
      if (btn.classList.contains('bookmarked')) {
        icon.className = 'fas fa-bookmark';
      } else {
        icon.className = 'far fa-bookmark';
      }
    };
    
    filterTabs.forEach(tab => {
      tab.addEventListener('click', handleFilterClick);
    });
    
    const bookmarkBtns = document.querySelectorAll('.bookmark-btn');
    bookmarkBtns.forEach(btn => {
      btn.addEventListener('click', handleBookmarkClick);
    });

    if (renderer && renderer.isInitialized) {
      // 确保WebGL渲染器已经初始化
      renderer.setActivePage("home");

      // Hero 部分元素的入场动画
      const heroTl = gsap.timeline({ delay: 0.1 });

      // 设置标题立即可见，其他元素初始不可见
      gsap.set(titleRef.current, {
        opacity: 1,
        y: 0,
      });
      gsap.set([subtitleRef.current, ctaRef.current, contactRef.current], {
        opacity: 0,
        y: 20,
      });

      heroTl
        .to(
          subtitleRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
          },
          "-=0.5"
        )
        .add(() => {
          // 副标题打字机效果
          animateTypewriter(subtitleRef.current, 0);
        }, "-=0.3")
        .to(
          ctaRef.current,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: "back.out(1.7)",
          },
          "-=0.6"
        )
        .to(
          contactRef.current,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: "back.out(1.7)",
          },
          "-=0.6"
        )
        .to(
          scrollIndicatorRef.current,
          {
            opacity: 0.7,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            onComplete: () => {
              // 动画完成后添加bounce效果
              if (scrollIndicatorRef.current) {
                scrollIndicatorRef.current.style.animation =
                  "bounce 2s infinite";
              }
            },
          },
          "-=0.5"
        );

      // 相机动画
      renderer.animateCamera({
        position: { x: 0, y: 0, z: 2.5 },
        rotation: { x: 0, y: 0, z: 0 },
        duration: 2.5,
      });

      // 设置滚动触发器
      // Introduction 部分动画
      gsap.fromTo(
        introRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: introRef.current,
            start: "top 80%",
            end: "top 50%",
            toggleActions: "play none none reverse",
            onEnter: () => {
              if (renderer) {
                renderer.onSectionVisible(1);
              }
              // 触发文本动画
              setTimeout(() => {
                animateTextReveal(introTitleRef.current, 0);
                introTextRefs.current.forEach((textEl, index) => {
                  if (textEl) {
                    animateTextSlideUp(textEl, index * 0.2);
                  }
                });
              }, 300);
            },
          },
        }
      );

      // Features 部分动画
      featureRefs.current.forEach((feature, index) => {
        gsap.fromTo(
          feature,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            delay: index * 0.2,
            scrollTrigger: {
              trigger: featuresRef.current,
              start: "top 70%",
              end: "top 40%",
              toggleActions: "play none none reverse",
              onEnter: () => {
                if (renderer) {
                  renderer.onSectionVisible(2);
                }
                // 触发标题文本动画
                if (index === 0) {
                  setTimeout(() => {
                    animateTypewriter(featuresTitleRef.current, 0);
                  }, 200);
                }
              },
            },
          }
        );
      });

      // Portfolio 部分动画
      portfolioRefs.current.forEach((portfolio, index) => {
        gsap.fromTo(
          portfolio,
          { opacity: 0, y: 50, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            ease: "power2.out",
            delay: index * 0.15,
            scrollTrigger: {
              trigger: portfolioRef.current,
              start: "top 70%",
              end: "top 30%",
              toggleActions: "play none none reverse",
              onEnter: () => {
                if (renderer) {
                  renderer.onSectionVisible(3);
                }
                // 触发标题文本动画
                if (index === 0) {
                  setTimeout(() => {
                    animateTextReveal(portfolioTitleRef.current, 0);
                  }, 200);
                }
              },
            },
          }
        );
      });

      // Tech 部分动画
      techRefs.current.forEach((tech, index) => {
        gsap.fromTo(
          tech,
          { opacity: 0, y: 20, rotationY: 45 },
          {
            opacity: 1,
            y: 0,
            rotationY: 0,
            duration: 0.8,
            ease: "back.out(1.7)",
            delay: index * 0.1,
            scrollTrigger: {
              trigger: techRef.current,
              start: "top 70%",
              end: "top 30%",
              toggleActions: "play none none reverse",
              onEnter: () => {
                if (renderer) {
                  renderer.onSectionVisible(4);
                }
                // 触发标题文本动画
                if (index === 0) {
                  setTimeout(() => {
                    animateTextSlideUp(techTitleRef.current, 0);
                  }, 200);
                }
              },
            },
          }
        );
      });

      // Team 部分动画
      teamRefs.current.forEach((member, index) => {
        gsap.fromTo(
          member,
          { opacity: 0, y: 30, x: index % 2 === 0 ? -30 : 30 },
          {
            opacity: 1,
            y: 0,
            x: 0,
            duration: 1,
            ease: "power3.out",
            delay: index * 0.2,
            scrollTrigger: {
              trigger: teamRef.current,
              start: "top 70%",
              end: "top 30%",
              toggleActions: "play none none reverse",
              onEnter: () => {
                if (renderer) {
                  renderer.onSectionVisible(5);
                }
                // 触发标题文本动画
                if (index === 0) {
                  setTimeout(() => {
                    animateTypewriter(teamTitleRef.current, 0);
                  }, 200);
                }
              },
            },
          }
        );
      });

      // CTA 部分动画
      gsap.fromTo(
        ctaSectionRef.current,
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ctaSectionRef.current,
            start: "top 70%",
            end: "top 40%",
            toggleActions: "play none none reverse",
            onEnter: () => {
              if (renderer) {
                renderer.onSectionVisible(6);
              }
              // 触发CTA文本动画
              setTimeout(() => {
                animateTextReveal(ctaTitleRef.current, 0);
                animateTextSlideUp(ctaTextRef.current, 0.5);
              }, 300);
            },
          },
        }
      );

      // Footer 动画
      gsap.fromTo(
        footerRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 90%",
            end: "top 70%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }

    return () => {
      if (hero3DScene) {
        hero3DScene.cleanup();
      }
      
      // 清理事件监听器
      window.removeEventListener("mousemove", handleMouseMove);

      // 清理知识库过滤器事件监听器
      filterTabs.forEach(tab => {
        tab.removeEventListener('click', handleFilterClick);
      });
      const bookmarkBtns = document.querySelectorAll('.bookmark-btn');
      bookmarkBtns.forEach(btn => {
        btn.removeEventListener('click', handleBookmarkClick);
      });

      // 清理ScrollTrigger
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

      // 页面离开时的清理工作
      if (renderer) {
        renderer.resetCamera();
      }
    };
  }, [renderer, renderer?.isInitialized]);

  return (
    <div ref={homeRef} className="page home-page">
      {/* 1️⃣ Hero Section */}
      <section ref={heroRef} className="hero-section">
        {/* 3D背景容器 */}
        <div 
          ref={hero3DRef} 
          className="hero-3d-background"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
            pointerEvents: 'none'
          }}
        />
        
        <div className="hero-content" style={{ position: 'relative', zIndex: 2 }}>
          <h1 ref={titleRef} className="hero-title">
            Rendered Just For You
          </h1>
          <p ref={subtitleRef} className="hero-subtitle">
            创造像素里编织的故事
          </p>
          <div className="cta-buttons">
            <button
              ref={ctaRef}
              className="cta-button primary"
              onClick={() => {
                // 滚动到作品部分
                portfolioRef.current.scrollIntoView({ behavior: "smooth" });
                // 延迟触发动画，等待滚动完成
                setTimeout(() => {
                  triggerPortfolioAnimation();
                }, 800);
              }}
            >
              <span className="button-text">探索作品</span>
              <span className="button-icon">→</span>
            </button>
            <button
              ref={contactRef}
              className="cta-button secondary"
              onClick={() => {
                // 显示联系表单或模态框
                alert("联系我们功能即将上线！");
              }}
            >
              <span className="button-text">联系我们</span>
              <span className="button-icon">✉</span>
            </button>
          </div>
        </div>

        {/* 3D交互提示 */}
        {isHero3DLoaded && (
          <div className="hero-3d-hint" style={{
            position: 'absolute',
            bottom: '100px',
            right: '20px',
            color: 'rgba(255,255,255,0.7)',
            fontSize: '12px',
            zIndex: 3
          }}>
            3D场景正在运行
          </div>
        )}

        {/* 3️⃣ Scroll Down 提示 */}
        <div ref={scrollIndicatorRef} className="scroll-indicator" style={{ zIndex: 2 }}>
          <span>向下滚动</span>
          <div className="scroll-arrow">↓</div>
        </div>
      </section>

      {/* 4️⃣ Introduction Section */}
      <section ref={introRef} className="intro-section">
        <div className="section-content">
          <h2 ref={introTitleRef} className="section-title" data-parallax="0.3">
            创意与技术的融合
          </h2>
          <div className="intro-container">
            <div className="intro-text" data-parallax="0.2">
              <p ref={(el) => (introTextRefs.current[0] = el)}>
                我们专注于创造具有未来感的数字体验，将创意设计与前沿技术完美结合，打造令人惊叹的互动网站和数字产品。
              </p>
              <p ref={(el) => (introTextRefs.current[1] = el)}>
                通过WebGL、3D动画和沉浸式交互，我们为品牌构建独特的数字身份和难忘的用户体验。
              </p>
            </div>
            <div className="intro-image" data-parallax="0.4">
              <div className="image-placeholder"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 5️⃣ Feature Section */}
      <section ref={featuresRef} className="features-section">
        <div className="section-content">
          <h2 ref={featuresTitleRef} className="section-title">
            我们的核心能力
          </h2>
          {/* <div className="features-controls">
            <button
              className={`layout-btn ${
                currentLayout === "grid" ? "active" : ""
              }`}
              onClick={() =>
                animateLayoutChange(
                  document.querySelector(".features-container"),
                  "grid"
                )
              }
              disabled={isFlipActive}
            >
              网格布局
            </button>
            <button
              className={`layout-btn ${
                currentLayout === "list" ? "active" : ""
              }`}
              onClick={() =>
                animateLayoutChange(
                  document.querySelector(".features-container"),
                  "list"
                )
              }
              disabled={isFlipActive}
            >
              列表布局
            </button>
            <button
              className="shuffle-btn"
              onClick={() =>
                animateCardShuffle(featureRefs.current.filter(Boolean))
              }
              disabled={isFlipActive}
            >
              重新排列
            </button>
          </div> */}
          <div className={`features-container layout-${currentLayout}`}>
            <div
              ref={(el) => (featureRefs.current[0] = el)}
              className="feature-card"
              onClick={(e) => {
                const card = e.currentTarget;
                if (card.classList.contains("expanded")) {
                  animateCardCollapse(card);
                } else {
                  animateCardExpand(card);
                }
              }}
            >
              <div className="feature-icon">
                <i className="fas fa-vr-cardboard"></i>
              </div>
              <h3>沉浸式体验</h3>
              <p>
                创造引人入胜的互动体验，通过WebGL和3D技术打造视觉震撼的数字世界。
              </p>
              <div className="feature-details">
                <p>
                  我们使用最新的WebGL技术和Three.js框架，创造出令人惊叹的3D视觉效果。从粒子系统到复杂的几何体动画，每一个细节都经过精心设计。
                </p>
                <ul>
                  <li>实时3D渲染</li>
                  <li>粒子效果系统</li>
                  <li>交互式场景</li>
                  <li>VR/AR 支持</li>
                </ul>
              </div>
            </div>

            <div
              ref={(el) => (featureRefs.current[1] = el)}
              className="feature-card"
              onClick={(e) => {
                const card = e.currentTarget;
                if (card.classList.contains("expanded")) {
                  animateCardCollapse(card);
                } else {
                  animateCardExpand(card);
                }
              }}
            >
              <div className="feature-icon">
                <i className="fas fa-paint-brush"></i>
              </div>
              <h3>创意设计</h3>
              <p>
                突破传统界限的设计理念，将艺术与技术融合，创造独特的品牌视觉语言。
              </p>
              <div className="feature-details">
                <p>
                  我们的设计团队拥有丰富的视觉设计经验，擅长将抽象概念转化为具体的视觉表达。每个项目都是独一无二的艺术品。
                </p>
                <ul>
                  <li>品牌视觉设计</li>
                  <li>UI/UX 界面设计</li>
                  <li>动效设计</li>
                  <li>视觉识别系统</li>
                </ul>
              </div>
            </div>

            <div
              ref={(el) => (featureRefs.current[2] = el)}
              className="feature-card"
              onClick={(e) => {
                const card = e.currentTarget;
                if (card.classList.contains("expanded")) {
                  animateCardCollapse(card);
                } else {
                  animateCardExpand(card);
                }
              }}
            >
              <div className="feature-icon">
                <i className="fas fa-rocket"></i>
              </div>
              <h3>性能优化</h3>
              <p>
                保证复杂视觉效果下的流畅体验，通过精细优化确保各种设备上的出色表现。
              </p>
              <div className="feature-details">
                <p>
                  性能优化是我们的核心竞争力之一。我们使用先进的优化技术，确保即使在复杂的3D场景中也能保持60fps的流畅体验。
                </p>
                <ul>
                  <li>代码分割与懒加载</li>
                  <li>GPU 加速渲染</li>
                  <li>内存管理优化</li>
                  <li>跨设备兼容性</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6️⃣ Portfolio Section */}
      <section ref={portfolioRef} className="portfolio-section">
        <div className="section-content">
          <h2 ref={portfolioTitleRef} className="section-title">
            精选作品
          </h2>
          {/* <div className="portfolio-controls">
            <button
              className={`layout-btn ${
                currentLayout === "grid" ? "active" : ""
              }`}
              onClick={() =>
                animateLayoutChange(
                  document.querySelector(".portfolio-container"),
                  "grid"
                )
              }
              disabled={isFlipActive}
            >
              网格视图
            </button>
            <button
              className={`layout-btn ${
                currentLayout === "masonry" ? "active" : ""
              }`}
              onClick={() =>
                animateLayoutChange(
                  document.querySelector(".portfolio-container"),
                  "masonry"
                )
              }
              disabled={isFlipActive}
            >
              瀑布流
            </button>
            <button
              className="shuffle-btn"
              onClick={() =>
                animateCardShuffle(portfolioRefs.current.filter(Boolean))
              }
              disabled={isFlipActive}
            >
              重新排列
            </button>
          </div> */}
          <div className={`portfolio-container layout-${currentLayout}`}>
            <div
              ref={(el) => (portfolioRefs.current[0] = el)}
              className="portfolio-item"
              onClick={(e) => {
                const item = e.currentTarget;
                if (item.classList.contains("expanded")) {
                  animateCardCollapse(item);
                } else {
                  animateCardExpand(item);
                }
              }}
            >
              <div className="portfolio-image">
                <div className="image-overlay"></div>
              </div>
              <div className="portfolio-info">
                <h3>未来科技展示</h3>
                <p>WebGL · Three.js · GSAP</p>
                <span className="portfolio-year">2023</span>
              </div>
              <div className="portfolio-details">
                <div className="project-info">
                  <h5>项目详情</h5>
                  <p>
                    这是一个为国际知名品牌设计的沉浸式3D体验项目。通过WebGL技术实现了流畅的3D场景切换和交互效果。
                  </p>
                  <div className="tech-stack">
                    <span className="tech-tag">Three.js</span>
                    <span className="tech-tag">GSAP</span>
                    <span className="tech-tag">WebGL</span>
                  </div>
                </div>
              </div>
            </div>

            <div
              ref={(el) => (portfolioRefs.current[1] = el)}
              className="portfolio-item"
              onClick={(e) => {
                const item = e.currentTarget;
                if (item.classList.contains("expanded")) {
                  animateCardCollapse(item);
                } else {
                  animateCardExpand(item);
                }
              }}
            >
              <div className="portfolio-image">
                <div className="image-overlay"></div>
              </div>
              <div className="portfolio-info">
                <h3>品牌数字体验</h3>
                <p>React · WebGL · 交互设计</p>
                <span className="portfolio-year">2023</span>
              </div>
              <div className="portfolio-details">
                <div className="project-info">
                  <h5>项目详情</h5>
                  <p>
                    这是一个结合了传感器技术的互动艺术装置项目。观众的动作会实时影响屏幕上的视觉效果，创造独特的互动体验。
                  </p>
                  <div className="tech-stack">
                    <span className="tech-tag">React</span>
                    <span className="tech-tag">WebRTC</span>
                    <span className="tech-tag">Canvas</span>
                  </div>
                </div>
              </div>
            </div>

            <div
              ref={(el) => (portfolioRefs.current[2] = el)}
              className="portfolio-item"
              onClick={(e) => {
                const item = e.currentTarget;
                if (item.classList.contains("expanded")) {
                  animateCardCollapse(item);
                } else {
                  animateCardExpand(item);
                }
              }}
            >
              <div className="portfolio-image">
                <div className="image-overlay"></div>
              </div>
              <div className="portfolio-info">
                <h3>沉浸式艺术装置</h3>
                <p>创意编程 · 数字艺术</p>
                <span className="portfolio-year">2023</span>
              </div>
              <div className="portfolio-details">
                <div className="project-info">
                  <h5>项目详情</h5>
                  <p>
                    为企业客户打造的虚拟展厅解决方案。用户可以在3D空间中自由漫游，查看产品详情，获得沉浸式的展示体验。
                  </p>
                  <div className="tech-stack">
                    <span className="tech-tag">Three.js</span>
                    <span className="tech-tag">Blender</span>
                    <span className="tech-tag">WebXR</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7️⃣ Technology Stack Section */}
      <section ref={techRef} className="tech-section">
        <div className="section-content">
          <h2 ref={techTitleRef} className="section-title">
            技术栈
          </h2>
          <div className="tech-controls">
            <button
              className="shuffle-btn"
              onClick={() =>
                animateCardShuffle(techRefs.current.filter(Boolean))
              }
              disabled={isFlipActive}
            >
              重新排列技术
            </button>
          </div>
          <div className="tech-container">
            <div className="tech-category">
              <h3>前端框架</h3>
              <div className="tech-items">
                <div
                  ref={(el) => (techRefs.current[0] = el)}
                  className="tech-item"
                  onClick={(e) => {
                    const item = e.currentTarget;
                    if (item.classList.contains("expanded")) {
                      animateCardCollapse(item);
                    } else {
                      animateCardExpand(item);
                    }
                  }}
                >
                  <i className="fab fa-react"></i>
                  <span>React</span>
                  <div className="tech-details">
                    <p>现代化的前端框架，提供组件化开发和高效的状态管理。</p>
                    <ul>
                      <li>组件化架构</li>
                      <li>虚拟DOM</li>
                      <li>Hooks API</li>
                    </ul>
                  </div>
                </div>
                <div
                  ref={(el) => (techRefs.current[1] = el)}
                  className="tech-item"
                  onClick={(e) => {
                    const item = e.currentTarget;
                    if (item.classList.contains("expanded")) {
                      animateCardCollapse(item);
                    } else {
                      animateCardExpand(item);
                    }
                  }}
                >
                  <i className="fab fa-vuejs"></i>
                  <span>Vue.js</span>
                  <div className="tech-details">
                    <p>渐进式JavaScript框架，易于学习和集成。</p>
                    <ul>
                      <li>响应式数据</li>
                      <li>模板语法</li>
                      <li>组合式API</li>
                    </ul>
                  </div>
                </div>
                <div
                  ref={(el) => (techRefs.current[2] = el)}
                  className="tech-item"
                  onClick={(e) => {
                    const item = e.currentTarget;
                    if (item.classList.contains("expanded")) {
                      animateCardCollapse(item);
                    } else {
                      animateCardExpand(item);
                    }
                  }}
                >
                  <i className="fab fa-js-square"></i>
                  <span>Three.js</span>
                  <div className="tech-details">
                    <p>强大的3D图形库，简化WebGL开发，创造惊艳的3D体验。</p>
                    <ul>
                      <li>3D场景管理</li>
                      <li>材质与光照</li>
                      <li>动画系统</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="tech-category">
              <h3>动画库</h3>
              <div className="tech-items">
                <div
                  ref={(el) => (techRefs.current[3] = el)}
                  className="tech-item"
                  onClick={(e) => {
                    const item = e.currentTarget;
                    if (item.classList.contains("expanded")) {
                      animateCardCollapse(item);
                    } else {
                      animateCardExpand(item);
                    }
                  }}
                >
                  <i className="fas fa-magic"></i>
                  <span>GSAP</span>
                  <div className="tech-details">
                    <p>专业级动画库，创造流畅自然的动效体验。</p>
                    <ul>
                      <li>时间轴控制</li>
                      <li>缓动函数</li>
                      <li>ScrollTrigger</li>
                    </ul>
                  </div>
                </div>
                <div
                  ref={(el) => (techRefs.current[4] = el)}
                  className="tech-item"
                  onClick={(e) => {
                    const item = e.currentTarget;
                    if (item.classList.contains("expanded")) {
                      animateCardCollapse(item);
                    } else {
                      animateCardExpand(item);
                    }
                  }}
                >
                  <i className="fas fa-arrows-alt"></i>
                  <span>Lenis</span>
                  <div className="tech-details">
                    <p>平滑滚动库，提供丝滑的页面滚动体验。</p>
                    <ul>
                      <li>平滑滚动</li>
                      <li>惯性滚动</li>
                      <li>自定义缓动</li>
                    </ul>
                  </div>
                </div>
                <div
                  ref={(el) => (techRefs.current[5] = el)}
                  className="tech-item"
                  onClick={(e) => {
                    const item = e.currentTarget;
                    if (item.classList.contains("expanded")) {
                      animateCardCollapse(item);
                    } else {
                      animateCardExpand(item);
                    }
                  }}
                >
                  <i className="fas fa-cube"></i>
                  <span>WebGL</span>
                  <div className="tech-details">
                    <p>底层图形API，提供GPU加速的高性能渲染能力。</p>
                    <ul>
                      <li>GPU加速</li>
                      <li>着色器编程</li>
                      <li>实时渲染</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="tech-category">
              <h3>工具链</h3>
              <div className="tech-items">
                <div
                  ref={(el) => (techRefs.current[6] = el)}
                  className="tech-item"
                  onClick={(e) => {
                    const item = e.currentTarget;
                    if (item.classList.contains("expanded")) {
                      animateCardCollapse(item);
                    } else {
                      animateCardExpand(item);
                    }
                  }}
                >
                  <i className="fab fa-node-js"></i>
                  <span>Vite</span>
                  <div className="tech-details">
                    <p>下一代前端构建工具，提供极速的开发体验。</p>
                    <ul>
                      <li>极速热更新</li>
                      <li>ES模块支持</li>
                      <li>插件生态</li>
                    </ul>
                  </div>
                </div>
                <div
                  ref={(el) => (techRefs.current[7] = el)}
                  className="tech-item"
                  onClick={(e) => {
                    const item = e.currentTarget;
                    if (item.classList.contains("expanded")) {
                      animateCardCollapse(item);
                    } else {
                      animateCardExpand(item);
                    }
                  }}
                >
                  <i className="fab fa-git-alt"></i>
                  <span>Git</span>
                  <div className="tech-details">
                    <p>分布式版本控制系统，团队协作的必备工具。</p>
                    <ul>
                      <li>版本控制</li>
                      <li>分支管理</li>
                      <li>协作开发</li>
                    </ul>
                  </div>
                </div>
                <div
                  ref={(el) => (techRefs.current[8] = el)}
                  className="tech-item"
                  onClick={(e) => {
                    const item = e.currentTarget;
                    if (item.classList.contains("expanded")) {
                      animateCardCollapse(item);
                    } else {
                      animateCardExpand(item);
                    }
                  }}
                >
                  <i className="fas fa-code"></i>
                  <span>TypeScript</span>
                  <div className="tech-details">
                    <p>JavaScript的超集，提供静态类型检查和更好的开发体验。</p>
                    <ul>
                      <li>静态类型</li>
                      <li>智能提示</li>
                      <li>编译时检查</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Knowledge Base Section */}
      <section ref={teamRef} className="knowledge-section">
        <div className="section-content">
          <div className="knowledge-header">
            <h2 ref={teamTitleRef} className="section-title">
              知识沉淀
            </h2>
            <p className="knowledge-subtitle">
              记录思考轨迹，沉淀技术心得，分享创作灵感
            </p>
          </div>
          
          <div className="knowledge-filters">
            <div className="filter-tabs">
              <button className="filter-tab active" data-category="all">
                全部
              </button>
              <button className="filter-tab" data-category="frontend">
                前端技术
              </button>
              <button className="filter-tab" data-category="webgl">
                WebGL & 3D
              </button>
              <button className="filter-tab" data-category="design">
                设计思考
              </button>
              <button className="filter-tab" data-category="tools">
                工具分享
              </button>
            </div>
          </div>

          <div className="knowledge-list">
            <article
              ref={(el) => (teamRefs.current[0] = el)}
              className="knowledge-item"
              data-category="webgl"
            >
              <div className="item-header">
                <h3 className="item-title">WebGL 着色器编程实战指南</h3>
                <div className="item-meta">
                  <span className="reading-time">8 分钟阅读</span>
                  <time className="update-time">2024-01-15</time>
                </div>
              </div>
              <p className="item-description">
                深入探讨 WebGL 着色器的编写技巧，从基础语法到高级特效实现，包含多个实际案例和性能优化建议。
              </p>
              <div className="item-tags">
                <span className="tag">WebGL</span>
                <span className="tag">GLSL</span>
                <span className="tag">3D图形</span>
              </div>
              <div className="item-actions">
                <button className="bookmark-btn">
                  <i className="far fa-bookmark"></i>
                </button>
              </div>
            </article>

            <article
              ref={(el) => (teamRefs.current[1] = el)}
              className="knowledge-item"
              data-category="frontend"
            >
              <div className="item-header">
                <h3 className="item-title">React 性能优化的十个最佳实践</h3>
                <div className="item-meta">
                  <span className="reading-time">12 分钟阅读</span>
                  <time className="update-time">2024-01-10</time>
                </div>
              </div>
              <p className="item-description">
                总结在大型 React 项目中的性能优化经验，涵盖组件优化、状态管理、代码分割等关键技术点。
              </p>
              <div className="item-tags">
                <span className="tag">React</span>
                <span className="tag">性能优化</span>
                <span className="tag">最佳实践</span>
              </div>
              <div className="item-actions">
                <button className="bookmark-btn bookmarked">
                  <i className="fas fa-bookmark"></i>
                </button>
              </div>
            </article>

            <article
              ref={(el) => (teamRefs.current[2] = el)}
              className="knowledge-item"
              data-category="design"
            >
              <div className="item-header">
                <h3 className="item-title">交互设计中的微动效应用</h3>
                <div className="item-meta">
                  <span className="reading-time">6 分钟阅读</span>
                  <time className="update-time">2024-01-05</time>
                </div>
              </div>
              <p className="item-description">
                探讨如何通过精心设计的微动效提升用户体验，分析成功案例并提供实现思路。
              </p>
              <div className="item-tags">
                <span className="tag">交互设计</span>
                <span className="tag">动效</span>
                <span className="tag">用户体验</span>
              </div>
              <div className="item-actions">
                <button className="bookmark-btn">
                  <i className="far fa-bookmark"></i>
                </button>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* 6️⃣ Call To Action Section */}
      <section ref={ctaSectionRef} className="cta-section">
        <div className="section-content">
          <h2 ref={ctaTitleRef} className="cta-title">
            准备好开始您的项目了吗？
          </h2>
          <p ref={ctaTextRef} className="cta-text">
            让我们一起创造令人惊叹的数字体验
          </p>
          <button className="cta-button cta-button-large">开始项目</button>
        </div>
      </section>

      {/* 7️⃣ Footer */}
      <footer ref={footerRef} className="footer">
        <div className="footer-content">
          <div className="copyright">
            © 2025 Pixel Poem. All Rights Reserved.
          </div>
          <div className="social-links">
            <a href="#" className="social-link">
              Twitter
            </a>
            <a href="#" className="social-link">
              Instagram
            </a>
            <a href="#" className="social-link">
              Dribbble
            </a>
            <a href="#" className="social-link">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
