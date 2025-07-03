import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Home = ({ renderer }) => {
  const homeRef = useRef(null);
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const scrollIndicatorRef = useRef(null);
  const introRef = useRef(null);
  const featuresRef = useRef(null);
  const featureRefs = useRef([]);
  const portfolioRef = useRef(null);
  const portfolioRefs = useRef([]);
  const techRef = useRef(null);
  const techRefs = useRef([]);
  const teamRef = useRef(null);
  const teamRefs = useRef([]);
  const ctaSectionRef = useRef(null);
  const footerRef = useRef(null);

  // 鼠标位置状态
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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
    // 添加鼠标移动事件监听器
    window.addEventListener("mousemove", handleMouseMove);

    if (renderer && renderer.isInitialized) {
      // 确保WebGL渲染器已经初始化
      renderer.setActivePage("home");

      // Hero 部分元素的入场动画
      const heroTl = gsap.timeline({ delay: 0.5 });

      heroTl
        .to(titleRef.current, {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
        })
        .to(
          subtitleRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power3.out",
          },
          "-=0.8"
        )
        .to(
          ctaRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
          },
          "-=0.8"
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
      // 清理事件监听器
      window.removeEventListener("mousemove", handleMouseMove);

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
        <div className="hero-content">
          <h1 ref={titleRef} className="hero-title">
            REACT LUSION
          </h1>
          <p ref={subtitleRef} className="hero-subtitle">
            创造未来感的沉浸式体验
          </p>
          <button ref={ctaRef} className="cta-button">
            探索作品
          </button>
        </div>

        {/* 3️⃣ Scroll Down 提示 */}
        <div ref={scrollIndicatorRef} className="scroll-indicator">
          <span>向下滚动</span>
          <div className="scroll-arrow">↓</div>
        </div>
      </section>

      {/* 4️⃣ Introduction Section */}
      <section ref={introRef} className="intro-section">
        <div className="section-content">
          <h2 className="section-title" data-parallax="0.3">
            创意与技术的融合
          </h2>
          <div className="intro-container">
            <div className="intro-text" data-parallax="0.2">
              <p>
                我们专注于创造具有未来感的数字体验，将创意设计与前沿技术完美结合，打造令人惊叹的互动网站和数字产品。
              </p>
              <p>
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
          <h2 className="section-title">我们的核心能力</h2>
          <div className="features-container">
            <div
              ref={(el) => (featureRefs.current[0] = el)}
              className="feature-card"
              onMouseEnter={() => renderer?.highlightFeature(0)}
              onMouseLeave={() => renderer?.resetFeature()}
            >
              <div className="feature-icon">
                <i className="fas fa-vr-cardboard"></i>
              </div>
              <h3>沉浸式体验</h3>
              <p>
                创造引人入胜的互动体验，通过WebGL和3D技术打造视觉震撼的数字世界。
              </p>
            </div>

            <div
              ref={(el) => (featureRefs.current[1] = el)}
              className="feature-card"
              onMouseEnter={() => renderer?.highlightFeature(1)}
              onMouseLeave={() => renderer?.resetFeature()}
            >
              <div className="feature-icon">
                <i className="fas fa-paint-brush"></i>
              </div>
              <h3>创意设计</h3>
              <p>
                突破传统界限的设计理念，将艺术与技术融合，创造独特的品牌视觉语言。
              </p>
            </div>

            <div
              ref={(el) => (featureRefs.current[2] = el)}
              className="feature-card"
              onMouseEnter={() => renderer?.highlightFeature(2)}
              onMouseLeave={() => renderer?.resetFeature()}
            >
              <div className="feature-icon">
                <i className="fas fa-rocket"></i>
              </div>
              <h3>性能优化</h3>
              <p>
                保证复杂视觉效果下的流畅体验，通过精细优化确保各种设备上的出色表现。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 🎨 Portfolio Section */}
      <section ref={portfolioRef} className="portfolio-section">
        <div className="section-content">
          <h2 className="section-title">精选作品</h2>
          <div className="portfolio-container">
            <div
              ref={(el) => (portfolioRefs.current[0] = el)}
              className="portfolio-item"
              onMouseEnter={() => renderer?.highlightPortfolio(0)}
              onMouseLeave={() => renderer?.resetPortfolio()}
            >
              <div className="portfolio-image">
                <div className="image-overlay"></div>
              </div>
              <div className="portfolio-info">
                <h3>未来科技展示</h3>
                <p>WebGL · Three.js · GSAP</p>
                <span className="portfolio-year">2023</span>
              </div>
            </div>

            <div
              ref={(el) => (portfolioRefs.current[1] = el)}
              className="portfolio-item"
              onMouseEnter={() => renderer?.highlightPortfolio(1)}
              onMouseLeave={() => renderer?.resetPortfolio()}
            >
              <div className="portfolio-image">
                <div className="image-overlay"></div>
              </div>
              <div className="portfolio-info">
                <h3>品牌数字体验</h3>
                <p>React · WebGL · 交互设计</p>
                <span className="portfolio-year">2023</span>
              </div>
            </div>

            <div
              ref={(el) => (portfolioRefs.current[2] = el)}
              className="portfolio-item"
              onMouseEnter={() => renderer?.highlightPortfolio(2)}
              onMouseLeave={() => renderer?.resetPortfolio()}
            >
              <div className="portfolio-image">
                <div className="image-overlay"></div>
              </div>
              <div className="portfolio-info">
                <h3>沉浸式艺术装置</h3>
                <p>创意编程 · 数字艺术</p>
                <span className="portfolio-year">2023</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🛠️ Technology Stack Section */}
      <section ref={techRef} className="tech-section">
        <div className="section-content">
          <h2 className="section-title">技术栈</h2>
          <div className="tech-container">
            <div className="tech-category">
              <h3>前端框架</h3>
              <div className="tech-items">
                <div
                  ref={(el) => (techRefs.current[0] = el)}
                  className="tech-item"
                >
                  <i className="fab fa-react"></i>
                  <span>React</span>
                </div>
                <div
                  ref={(el) => (techRefs.current[1] = el)}
                  className="tech-item"
                >
                  <i className="fab fa-vuejs"></i>
                  <span>Vue.js</span>
                </div>
                <div
                  ref={(el) => (techRefs.current[2] = el)}
                  className="tech-item"
                >
                  <i className="fab fa-js-square"></i>
                  <span>Three.js</span>
                </div>
              </div>
            </div>

            <div className="tech-category">
              <h3>动画库</h3>
              <div className="tech-items">
                <div
                  ref={(el) => (techRefs.current[3] = el)}
                  className="tech-item"
                >
                  <i className="fas fa-magic"></i>
                  <span>GSAP</span>
                </div>
                <div
                  ref={(el) => (techRefs.current[4] = el)}
                  className="tech-item"
                >
                  <i className="fas fa-arrows-alt"></i>
                  <span>Lenis</span>
                </div>
                <div
                  ref={(el) => (techRefs.current[5] = el)}
                  className="tech-item"
                >
                  <i className="fas fa-cube"></i>
                  <span>WebGL</span>
                </div>
              </div>
            </div>

            <div className="tech-category">
              <h3>工具链</h3>
              <div className="tech-items">
                <div
                  ref={(el) => (techRefs.current[6] = el)}
                  className="tech-item"
                >
                  <i className="fab fa-node-js"></i>
                  <span>Vite</span>
                </div>
                <div
                  ref={(el) => (techRefs.current[7] = el)}
                  className="tech-item"
                >
                  <i className="fab fa-git-alt"></i>
                  <span>Git</span>
                </div>
                <div
                  ref={(el) => (techRefs.current[8] = el)}
                  className="tech-item"
                >
                  <i className="fas fa-code"></i>
                  <span>TypeScript</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*  Team Section */}
      <section ref={teamRef} className="team-section">
        <div className="section-content">
          <h2 className="section-title">创意团队</h2>
          <div className="team-container">
            <div
              ref={(el) => (teamRefs.current[0] = el)}
              className="team-member"
            >
              <div className="member-avatar">
                <div className="avatar-placeholder"></div>
              </div>
              <h3>Alex Chen</h3>
              <p className="member-role">创意总监</p>
              <p className="member-desc">专注于数字艺术与交互设计的融合创新</p>
            </div>

            <div
              ref={(el) => (teamRefs.current[1] = el)}
              className="team-member"
            >
              <div className="member-avatar">
                <div className="avatar-placeholder"></div>
              </div>
              <h3>Sarah Kim</h3>
              <p className="member-role">技术架构师</p>
              <p className="member-desc">WebGL与3D技术的深度实践者</p>
            </div>

            <div
              ref={(el) => (teamRefs.current[2] = el)}
              className="team-member"
            >
              <div className="member-avatar">
                <div className="avatar-placeholder"></div>
              </div>
              <h3>David Liu</h3>
              <p className="member-role">前端工程师</p>
              <p className="member-desc">追求极致性能与用户体验的完美平衡</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6️⃣ Call To Action Section */}
      <section ref={ctaSectionRef} className="cta-section">
        <div className="section-content">
          <h2 className="cta-title">准备好开始您的项目了吗？</h2>
          <p className="cta-text">让我们一起创造令人惊叹的数字体验</p>
          <button className="cta-button cta-button-large">开始项目</button>
        </div>
      </section>

      {/* 7️⃣ Footer */}
      <footer ref={footerRef} className="footer">
        <div className="footer-content">
          <div className="copyright">
            © 2023 React Lusion. All Rights Reserved.
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
