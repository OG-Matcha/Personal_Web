// animations.client.js
import { ref } from 'vue'

export default defineNuxtPlugin((nuxtApp) => {
  // 頁面是否已經初始加載的狀態
  const pageInitialLoaded = ref(false)
  
  // 在頁面加載時觸發
  if (process.client) {
    nuxtApp.hook('app:mounted', () => {
      // 使用 localStorage 來檢查是否是首次訪問
      const hasVisited = localStorage.getItem('hasVisitedBefore')
      
      if (!hasVisited) {
        // 第一次訪問，展示完整加載動畫
        // 標記為已訪問，以便後續訪問不再顯示完整加載動畫
        localStorage.setItem('hasVisitedBefore', 'true')
      } else {
        // 不是首次訪問，但仍需要頁面動畫
        pageInitialLoaded.value = true
        
        // 設置一個短暫延遲，確保 DOM 已經完全渲染
        setTimeout(() => {
          applyPageElementAnimations()
        }, 100)
      }
    })
    
    // 監聽路由變化
    nuxtApp.hook('page:finish', () => {
      // 頁面加載完成後，添加頁面元素動畫
      applyPageElementAnimations()
    })
  }
  
  // 為頁面元素應用動畫
  function applyPageElementAnimations() {
    // 設置延遲，確保 DOM 完全渲染
    setTimeout(() => {
      // 查找所有帶有指定類的元素
      const animatableElements = document.querySelectorAll('.animate-on-view:not(.animated)')
      
      // 創建觀察器
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('animated')
              observer.unobserve(entry.target)
            }
          })
        },
        {
          threshold: 0.2
        }
      )
      
      // 觀察每個元素
      animatableElements.forEach(element => {
        observer.observe(element)
      })
    }, 300)
  }
  
  return {
    provide: {
      pageInitialLoaded,
      applyPageElementAnimations
    }
  }
}) 