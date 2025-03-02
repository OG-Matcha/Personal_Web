// plugins/viewport-reset.client.js
export default defineNuxtPlugin({
  name: 'viewport-reset',
  enforce: 'pre', // 在路由變更前執行
  setup(nuxtApp) {
    // 只在客戶端執行
    if (process.client) {
      // 在每次路由變更時執行
      nuxtApp.hook('page:start', () => {
        // 重置視口縮放
        document.documentElement.style.overflow = 'auto'
        document.documentElement.style.height = 'auto'
        document.body.style.overflow = 'auto'
        document.body.style.width = '100%'
        document.body.style.maxWidth = '100%'
        document.body.style.overflowX = 'hidden'
        
        // 確保視口縮放正確
        const viewport = document.querySelector('meta[name=viewport]')
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover')
        } else {
          // 如果找不到 viewport meta 標籤，則創建一個
          const meta = document.createElement('meta')
          meta.name = 'viewport'
          meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
          document.head.appendChild(meta)
        }
        
        // 使用 setTimeout 確保在頁面渲染後應用這些更改
        setTimeout(() => {
          window.scrollTo(0, 0)
          
          // 特別處理 Portfolio 頁面
          const isPortfolioPage = window.location.pathname.includes('/portfolio')
          if (isPortfolioPage) {
            // 添加全局樣式確保 Portfolio 頁面寬度正確，但排除導航元素
            const style = document.createElement('style')
            style.textContent = `
              /* 內容容器控制，排除導航元素 */
              body > div, #__nuxt > div, #__layout > div, .content-container, main {
                max-width: 100vw !important;
                overflow-x: hidden !important;
              }
              
              /* 確保導航元素可以正常顯示 */
              nav, .nav-links-wrapper, .nav-links-container, .nav-links-scroll, nav a {
                overflow-x: visible !important;
                max-width: none !important;
                z-index: 50 !important;
              }
              
              /* 確保內容元素不會溢出 */
              .p-8 {
                width: 100% !important;
                max-width: 100% !important;
                box-sizing: border-box !important;
                overflow-x: hidden !important;
              }
              
              h2, p {
                max-width: 100%;
                box-sizing: border-box;
                word-break: break-word;
              }
              
              .section-title:after {
                max-width: 4rem;
              }
              
              @media (max-width: 520px) {
                .grid {
                  padding-left: 0 !important;
                  padding-right: 0 !important;
                  width: 100% !important;
                  max-width: 100% !important;
                }
                
                .group, .rounded-xl, .overflow-hidden {
                  width: 100% !important;
                  max-width: 100% !important;
                }
              }
            `
            document.head.appendChild(style)
            
            // 確保 NavBar 在 portfolio 頁面上與其他頁面一致
            const navBar = document.querySelector('nav')
            if (navBar) {
              navBar.style.width = '100%'
              navBar.style.maxWidth = '100%'
              navBar.style.boxSizing = 'border-box'
              // 移除 overflowX: 'hidden'，允許導航欄水平滾動
              navBar.style.overflowX = 'visible'
              navBar.style.zIndex = '50'
              
              // 確保導航項目容器可滾動
              const navLinksWrapper = navBar.querySelector('.nav-links-wrapper')
              if (navLinksWrapper) {
                navLinksWrapper.style.overflowX = 'auto'
                navLinksWrapper.style.scrollbarWidth = 'none'
                navLinksWrapper.style.zIndex = '50'
                if (window.innerWidth <= 530) {
                  navLinksWrapper.style.maxWidth = 'calc(100% - 45px)'
                }
              }
              
              // 確保導航項目容器可以容納所有項目
              const navLinksContainer = navBar.querySelector('.nav-links-container')
              if (navLinksContainer) {
                navLinksContainer.style.width = 'max-content'
                // 移除 flexShrink 設定
                navLinksContainer.style.zIndex = '50'
              }
              
              // 只在小螢幕上調整導航鏈接字體大小
              if (window.innerWidth <= 520) {
                const navLinks = navBar.querySelectorAll('a')
                navLinks.forEach(link => {
                  link.style.fontSize = '0.75rem'
                  link.style.padding = '0.1rem 0.2rem'
                  // 移除 flexShrink 設定
                })
              }
            }
            
            // 確保 StickyNav 正確顯示和滾動
            const stickyNav = document.querySelector('.fixed.left-0.right-0.top-0')
            if (stickyNav) {
              stickyNav.style.zIndex = '50' // 確保層級較高
              stickyNav.style.overflowX = 'visible' // 允許水平滾動
              
              // 確保導航項目容器可滾動
              const navLinksScroll = stickyNav.querySelector('.nav-links-scroll, .flex.flex-1.justify-end.gap-3')
              if (navLinksScroll) {
                navLinksScroll.style.overflowX = 'auto'
                navLinksScroll.style.scrollbarWidth = 'none'
                navLinksScroll.style.width = 'max-content'
                navLinksScroll.style.zIndex = '50'
                if (window.innerWidth <= 530) {
                  navLinksScroll.style.maxWidth = 'calc(100% - 50px)'
                }
              }
              
              // 只在小螢幕上調整導航鏈接字體大小
              if (window.innerWidth <= 520) {
                const stickyNavLinks = stickyNav.querySelectorAll('a')
                stickyNavLinks.forEach(link => {
                  link.style.fontSize = '0.75rem'
                  link.style.padding = '0.1rem 0.2rem'
                  // 移除 flexShrink 設定
                })
              }
            }
            
            // 確保 SectionTitle 不會產生滾動條，但其底線可見
            const sectionTitle = document.querySelector('h2[class*="after:absolute"]')
            if (sectionTitle) {
              sectionTitle.style.width = '100%'
              sectionTitle.style.maxWidth = '100%'
              sectionTitle.style.boxSizing = 'border-box'
              sectionTitle.style.wordBreak = 'break-word'
              
              // 確保底線可見
              sectionTitle.style.overflow = 'visible'
              
              // 只在小螢幕上限制溢出
              if (window.innerWidth <= 520) {
                sectionTitle.style.overflowX = 'hidden'
              }
            }
            
            // 處理主要內容容器
            const mainContentContainer = document.querySelector('#mainContent')
            if (mainContentContainer) {
              mainContentContainer.style.width = '100%'
              mainContentContainer.style.maxWidth = '100%'
              mainContentContainer.style.overflowX = 'hidden'
              mainContentContainer.style.boxSizing = 'border-box'
            }
            
            // 處理Portfolio頁面的最外層容器
            const portfolioContainer = document.querySelector('.p-8')
            if (portfolioContainer) {
              portfolioContainer.style.width = '100%'
              portfolioContainer.style.maxWidth = '100%'
              portfolioContainer.style.boxSizing = 'border-box'
              portfolioContainer.style.overflowX = 'hidden'
            }
            
            // 處理網格容器在小螢幕下的顯示
            if (window.innerWidth <= 520) {
              const grid = document.querySelector('.grid')
              if (grid) {
                grid.style.width = '100%'
                grid.style.maxWidth = '100%'
                grid.style.paddingLeft = '0'
                grid.style.paddingRight = '0'
                grid.style.boxSizing = 'border-box'
                grid.style.gap = '0.5rem'
              }
              
              // 處理卡片容器
              const cards = document.querySelectorAll('.grid > *')
              cards.forEach(card => {
                card.style.width = '100%'
                card.style.maxWidth = '100%'
                card.style.boxSizing = 'border-box'
              })
            }
          }
        }, 0)
      })
    }
  }
}) 