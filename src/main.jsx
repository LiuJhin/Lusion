import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import './index.css'

// 创建路由器并启用v7_relativeSplatPath future flag
const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <App />
    },
    {
      path: '/about',
      element: <App />
    }
  ],
  {
    future: {
      v7_relativeSplatPath: true, // 启用v7相对路径解析
      v7_startTransition: true    // 启用v7 React.startTransition包装状态更新
    }
  }
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)