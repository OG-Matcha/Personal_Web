<template>
  <!--
    A screenshot shown whole. Screens come in every shape (a 2.95:1 banner, a
    1.41:1 scan), so the frame never crops: the picture is contained, and the
    space around it is filled by a blurred copy of the same picture. Both are
    the same URL, so the browser fetches it once, and both stay lazy.
  -->
  <span class="shot">
    <img class="shot-bg" :src="src" alt="" aria-hidden="true" loading="lazy" decoding="async" />
    <img class="shot-img" :src="src" :alt="alt" :width="width" :height="height" loading="lazy" decoding="async" />
  </span>
</template>

<script setup>
defineProps({
  src: { type: String, required: true },
  alt: { type: String, default: '' },
  width: { type: [Number, String], default: undefined },
  height: { type: [Number, String], default: undefined },
})
</script>

<style scoped>
.shot {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--surface-2);
}

.shot-bg {
  position: absolute;
  inset: -12%;
  width: 124%;
  height: 124%;
  object-fit: cover;
  filter: blur(22px) saturate(1.15);
  opacity: 0.6;
}

.shot-img {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
