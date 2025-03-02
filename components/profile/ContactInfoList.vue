<!-- ContactInfoList.vue -->
<template>
  <div class="xs:space-y-2.5 w-full space-y-2 sm:space-y-3 md:space-y-3.5 lg:space-y-4">
    <contact-info-item
      v-for="item in contactItems"
      :key="item.icon"
      :icon="item.icon"
      :text="item.text"
      :href="item.href"
    />
  </div>
</template>

<script setup>
import ContactInfoItem from './ContactInfoItem.vue'

const contactItems = [
  {
    icon: 'fa-map-marker-alt',
    text: '桃園，台灣',
  },
  {
    icon: 'fa-envelope',
    text: 'jushenhuang.jason@gmail.com',
    href: 'mailto:jushenhuang.jason@gmail.com',
  },
  {
    icon: 'fa-github',
    text: 'OG-Matcha',
    href: 'https://github.com/OG-Matcha',
  },
  {
    icon: 'fa-linkedin',
    text: 'Ju-Shen Huang',
    href: 'https://www.linkedin.com/in/ogmatcha',
  },
]
</script>

<style scoped>
/* 為極小螢幕添加自定義斷點 */
@media (min-width: 400px) {
  .xs\:space-y-2\.5 {
    --tw-space-y-reverse: 0;
    margin-top: calc(0.625rem * calc(1 - var(--tw-space-y-reverse)));
    margin-bottom: calc(0.625rem * var(--tw-space-y-reverse));
  }
}
</style>
