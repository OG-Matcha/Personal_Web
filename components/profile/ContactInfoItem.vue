<!-- ContactInfoItem.vue -->
<template>
  <a
    v-if="href"
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    class="group grid grid-cols-[auto,1fr] items-center gap-2 overflow-hidden transition-colors duration-200 hover:text-yellow-400 sm:gap-2.5 md:gap-3"
  >
    <div
      class="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 sm:h-8 sm:w-8 md:h-9 md:w-9 lg:h-10 lg:w-10"
    >
      <!-- 背景漸變 -->
      <div
        class="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400/20 to-yellow-400/5"
      ></div>
      <!-- 深色覆蓋 -->
      <div class="absolute inset-0 rounded-full bg-[#1A1A1A] opacity-75"></div>
      <!-- 圖標 -->
      <svg
        v-if="icon === 'fa-map-marker-alt'"
        xmlns="http://www.w3.org/2000/svg"
        class="md:h-4.5 md:w-4.5 relative h-3.5 w-3.5 text-yellow-400 transition-all duration-300 group-hover:scale-110 group-hover:text-yellow-300 sm:h-4 sm:w-4 lg:h-5 lg:w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
      <svg
        v-else-if="icon === 'fa-envelope'"
        xmlns="http://www.w3.org/2000/svg"
        class="md:h-4.5 md:w-4.5 relative h-3.5 w-3.5 text-yellow-400 transition-all duration-300 group-hover:scale-110 group-hover:text-yellow-300 sm:h-4 sm:w-4 lg:h-5 lg:w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
      <svg
        v-else-if="icon === 'fa-github'"
        xmlns="http://www.w3.org/2000/svg"
        class="md:h-4.5 md:w-4.5 relative h-3.5 w-3.5 text-yellow-400 transition-all duration-300 group-hover:scale-110 group-hover:text-yellow-300 sm:h-4 sm:w-4 lg:h-5 lg:w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
        />
      </svg>
      <svg
        v-else-if="icon === 'fa-linkedin'"
        xmlns="http://www.w3.org/2000/svg"
        class="md:h-4.5 md:w-4.5 relative h-3.5 w-3.5 text-yellow-400 transition-all duration-300 group-hover:scale-110 group-hover:text-yellow-300 sm:h-4 sm:w-4 lg:h-5 lg:w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M4 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"
        />
      </svg>
    </div>
    <span
      class="truncate text-xs text-gray-300 transition-colors duration-200 group-hover:text-white sm:text-sm lg:text-base"
      :title="text"
    >
      {{ text }}
    </span>
  </a>
  <div
    v-else
    class="group grid grid-cols-[auto,1fr] items-center gap-2 overflow-hidden transition-colors duration-200 hover:text-yellow-400 sm:gap-2.5 md:gap-3"
  >
    <div
      class="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 sm:h-8 sm:w-8 md:h-9 md:w-9 lg:h-10 lg:w-10"
    >
      <!-- 背景漸變 -->
      <div
        class="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400/20 to-yellow-400/5"
      ></div>
      <!-- 深色覆蓋 -->
      <div class="absolute inset-0 rounded-full bg-[#1A1A1A] opacity-75"></div>
      <!-- 圖標 -->
      <svg
        v-if="icon === 'fa-map-marker-alt'"
        xmlns="http://www.w3.org/2000/svg"
        class="md:h-4.5 md:w-4.5 relative h-3.5 w-3.5 text-yellow-400 transition-all duration-300 group-hover:scale-110 group-hover:text-yellow-300 sm:h-4 sm:w-4 lg:h-5 lg:w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    </div>
    <span
      class="truncate text-xs text-gray-300 transition-colors duration-200 group-hover:text-white sm:text-sm lg:text-base"
      :title="text"
    >
      {{ text }}
    </span>
  </div>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  href: {
    type: String,
    default: '',
  },
})
</script>
