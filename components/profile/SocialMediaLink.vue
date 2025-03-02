<!-- SocialMediaLink.vue -->
<template>
  <a
    :href="href"
    class="group relative flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 hover:scale-110 sm:h-9 sm:w-9 md:h-10 md:w-10 lg:h-11 lg:w-11"
  >
    <!-- 背景漸變 -->
    <div
      class="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400/20 to-yellow-400/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
    ></div>
    <!-- 深色背景 -->
    <div class="absolute inset-0 rounded-full bg-[#1A1A1A] opacity-50"></div>
    <!-- 圖標 -->
    <i
      :class="[
        iconType,
        icon,
        'relative',
        'text-sm sm:text-base md:text-lg',
        'text-gray-400',
        'transition-all',
        'duration-300',
        'group-hover:scale-110',
        'group-hover:text-yellow-400',
      ]"
    ></i>
  </a>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    required: true,
  },
  href: {
    type: String,
    required: true,
  },
  iconType: {
    type: String,
    default: 'fa-brands',
  },
})
</script>
