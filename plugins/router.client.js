// plugins/router.client.js
export default defineNuxtPlugin((nuxtApp) => {
  // 只有在客戶端運行時才修改路由行為
  if (process.client) {
    // 檢測是否是小螢幕裝置
    const isSmallScreen = () => window.innerWidth < 1024;

    // 檢測滾動目標位置
    const getScrollTarget = () => {
      // 在小螢幕裝置上，我們需要考慮內容區域的位置
      if (isSmallScreen()) {
        // 獲取主內容區域元素
        return document.querySelector('#mainContent') || 
               document.querySelector('.content-container') || 
               null;
      }
      return null; // 在大螢幕裝置上，我們不需要特殊處理
    };

    // 通過修改 Vue Router 的 scrollBehavior 來優化自動滾動
    const router = useRouter();
    
    // 保存原始的 scrollBehavior
    const originalScrollBehavior = router.options.scrollBehavior;
    
    // 重寫 scrollBehavior
    router.options.scrollBehavior = async (to, from, savedPosition) => {
      // 如果有錨點，則滾動到相應位置
      if (to.hash) {
        return {
          el: to.hash,
          behavior: 'smooth',
          top: 20  // 添加一些偏移
        };
      }

      // 如果是通過導航按鈕切換頁面
      if (
        to.path !== from.path && 
        (to.path === '/' || to.path === '/about' || to.path === '/resume' || to.path === '/portfolio' || to.path === '/contact')
      ) {
        // 在小螢幕上，滾動到頁面頂部
        // 這是因為我們現在使用漢堡選單，頁面結構已經改變
        if (isSmallScreen()) {
          // 在視圖更新後，將頁面滾動到主內容區域頂部
          setTimeout(() => {
            try {
              window.scrollTo({
                top: 0,
                behavior: 'auto'
              });
            } catch (error) {
              console.error('Scroll failed:', error);
            }
          }, 10);
          
          return false; // 不執行內置的滾動行為
        }
        
        // 在大螢幕上保持當前滾動位置
        return false;
      }
      
      // 如果用戶點擊了瀏覽器的後退按鈕，並且有保存的位置
      if (savedPosition) {
        return savedPosition;
      }
      
      // 對於其他情況，使用原始的 scrollBehavior
      if (originalScrollBehavior) {
        return originalScrollBehavior(to, from, savedPosition);
      }
    };
    
    // 添加視窗尺寸變化監聽器
    window.addEventListener('resize', () => {
      // 當視窗尺寸變化時，可以執行一些操作來適應新的尺寸
      // 這裡不需要具體操作，因為 isSmallScreen 函數會在每次調用時重新計算
    });
  }
}); 