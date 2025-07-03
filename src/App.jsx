import React, { useEffect, useRef, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { gsap } from 'gsap'
import Home from './pages/Home'
import About from './pages/About'
import Renderer from './webgl/renderer'
import { setupScrollAnimation } from './animations/scroll'
import { pageTransition } from './animations/transition'

function App() {
  const location = useLocation()
  const appRef = useRef(null)
  const transitionRef = useRef(null)
  const rendererRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)

  // 初始化WebGL渲染器
  useEffect(() => {
    let loadingTimer = null;
    let maxLoadingTime = null;
    
    // WebGL加载完成事件处理函数
    const handleWebGLLoadingComplete = (event) => {
      console.log('收到WebGL加载完成事件:', event.detail);
      
      // 清除加载计时器
      clearTimeout(loadingTimer);
      clearTimeout(maxLoadingTime);
      
      // 设置加载完成
      setIsLoading(false);
      
      // 如果加载成功，初始化滚动动画
      if (event.detail.success !== false && rendererRef.current) {
        // 初始动画
        const tl = gsap.timeline();
        tl.to('.loader', {
          opacity: 0,
          duration: 1,
          onComplete: () => {
            const loader = document.querySelector('.loader');
            if (loader && loader.parentNode) {
              loader.parentNode.removeChild(loader);
            }
          }
        });
        
        // 初始化滚动动画
        const scrollInstance = setupScrollAnimation(rendererRef.current);
        
        // 保存清理函数
        window.scrollCleanup = scrollInstance.destroy;
      }
    };
    
    const initRenderer = async () => {
      try {
        console.log('初始化渲染器...');
        
        // 添加WebGL加载完成事件监听器
        window.addEventListener('webglLoadingComplete', handleWebGLLoadingComplete);
        
        // 创建渲染器实例
        if (!rendererRef.current) {
          console.log('创建新的渲染器实例');
          rendererRef.current = new Renderer();
        }
        
        // 设置备用加载计时器（如果事件没有触发）
        loadingTimer = setTimeout(() => {
          console.log('备用加载计时器触发');
          if (isLoading && rendererRef.current) {
            // 手动触发加载完成事件
            const event = new CustomEvent('webglLoadingComplete', { 
              detail: { success: true } 
            });
            window.dispatchEvent(event);
          }
        }, 2000);
      } catch (error) {
        console.error('渲染器初始化错误:', error);
        // 即使出错也设置加载完成，以便用户可以看到界面
        setIsLoading(false);
      }
    };
    
    // 设置最大加载时间（5秒），防止无限加载
    maxLoadingTime = setTimeout(() => {
      console.log('加载超时，强制完成加载');
      if (isLoading) {
        // 触发加载完成事件，但标记为失败
        const event = new CustomEvent('webglLoadingComplete', { 
          detail: { success: false, error: new Error('加载超时') } 
        });
        window.dispatchEvent(event);
      }
    }, 5000);
    
    // 只有在加载状态且渲染器不存在时才初始化
    if (isLoading) {
      initRenderer();
    }
    
    return () => {
      // 清理事件监听器和计时器
      window.removeEventListener('webglLoadingComplete', handleWebGLLoadingComplete);
      clearTimeout(loadingTimer);
      clearTimeout(maxLoadingTime);
    };
  }, [isLoading]);
  
  // 清理渲染器资源
  useEffect(() => {
    return () => {
      if (rendererRef.current) {
        console.log('清理渲染器资源');
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
      
      // 清理滚动动画
      if (window.scrollCleanup) {
        window.scrollCleanup();
        delete window.scrollCleanup;
      }
    };
  }, []);

  // 页面切换动画
  useEffect(() => {
    if (!isLoading && transitionRef.current) {
      pageTransition(transitionRef.current, location.pathname, rendererRef.current)
    }
  }, [location.pathname, isLoading])

  if (isLoading) {
    return (
      <div className="loader">
        <div>REACT LUSION</div>
        <div style={{ fontSize: '1rem', opacity: 0.7, marginTop: '10px' }}>Loading Experience...</div>
      </div>
    )
  }
  
  // 根据当前路径确定要渲染的页面组件
  const renderPage = () => {
    if (location.pathname === '/about') {
      return <About renderer={rendererRef.current} />
    }
    return <Home renderer={rendererRef.current} />
  }

  return (
    <div ref={appRef} className="app">
      <div className="page-transition" ref={transitionRef}></div>
      
      <nav className="nav">
        <div className="logo">React Lusion</div>
        <div className="nav-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
          <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>About</Link>
        </div>
      </nav>
      
      {renderPage()}
    </div>
  )
}

export default App