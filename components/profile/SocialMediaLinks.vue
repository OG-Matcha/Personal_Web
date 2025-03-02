<!-- SocialMediaLinks.vue -->
<template>
  <div class="xs:gap-3 mt-2 flex justify-center gap-2 sm:mt-3 sm:gap-4 md:mt-4 md:gap-5 lg:gap-6">
    <social-media-link
      v-for="item in socialLinks"
      :key="item.icon"
      :icon="item.icon"
      :href="item.href"
      :icon-type="item.iconType"
    />
  </div>
</template>

<script setup>
import SocialMediaLink from './SocialMediaLink.vue'

const socialLinks = [
  {
    icon: 'fa-facebook-f',
    href: 'https://www.facebook.com/littlejasonhuang/',
    iconType: 'fa-brands',
  },
  {
    icon: 'fa-instagram',
    href: 'https://www.instagram.com/og_matcha/',
    iconType: 'fa-brands',
  },
  {
    icon: 'fa-code',
    href: 'https://leetcode.com/u/OG_Matcha/',
    iconType: 'fa-solid',
  },
]
</script>

<style scoped>
/* 為極小螢幕添加自定義斷點 */
@media (min-width: 400px) {
  .xs\:gap-3 {
    gap: 0.75rem;
  }
}
</style>
