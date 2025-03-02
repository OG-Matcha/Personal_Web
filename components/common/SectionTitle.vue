<!-- SectionTitle.vue -->
<template>
  <div class="section-title-container mb-6 sm:mb-7 md:mb-8 lg:mb-10">
    <h2
      class="relative inline-block max-w-full overflow-visible pr-0 text-xl font-bold sm:text-2xl md:text-3xl lg:text-4xl"
    >
      <slot></slot>
    </h2>
  </div>
</template>

<style scoped>
/* 基本標題樣式 */
h2 {
  color: #fff;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  overflow: visible;
  max-width: 100%;
  position: relative;
}

/* 黃色下劃線效果 */
h2::after {
  content: '';
  position: absolute;
  height: 3px;
  left: 0;
  right: 6px; /* 修復右側溢出 */
  bottom: -8px;
  width: 100%;
  background: linear-gradient(90deg, #facc15 40%, rgba(250, 204, 21, 0.5) 100%);
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(250, 204, 21, 0.6);
  overflow: visible;
}

/* 確保容器不會造成滾動 */
.section-title-container {
  position: relative;
  overflow: visible;
  width: 100%;
}

/* 響應式調整 */
@media (max-width: 520px) {
  h2 {
    font-size: 1.25rem;
  }

  h2::after {
    height: 2.5px;
    bottom: -6px;
    right: 0; /* 確保不溢出 */
    max-width: calc(100% - 4px);
  }
}

@media (max-width: 375px) {
  h2 {
    font-size: 1.125rem;
  }

  h2::after {
    height: 2px;
    bottom: -5px;
  }
}
</style>
