<template>
  <!--
    A screenshot in a fixed frame. Screens come in every shape (a 2.95:1
    banner, a 1.41:1 scan), so by default the frame never crops: the picture
    sits whole on a plain mat, like a print mounted in a frame. Covers made
    for the frame's own shape pass fit="cover" and fill it edge to edge.
  -->
  <span class="shot" :class="`shot--${fit}`" :style="focus ? { '--shot-focus': focus } : null">
    <img class="shot-img" :src="asset(src)" :srcset="srcset(src)" :sizes="sizes" :alt="alt" :width="width" :height="height" :loading="eager ? 'eager' : 'lazy'" :fetchpriority="eager ? 'high' : undefined" decoding="async" />
  </span>
</template>

<script setup>
defineProps({
  src: { type: String, required: true },
  alt: { type: String, default: '' },
  width: { type: [Number, String], default: undefined },
  height: { type: [Number, String], default: undefined },
  sizes: { type: String, default: '(min-width: 1024px) 40vw, 100vw' },
  fit: { type: String, default: 'contain', validator: (v) => ['contain', 'cover'].includes(v) },
  // Where a cover keeps its subject when cropped (object-position); default left top.
  focus: { type: String, default: '' },
  // The first picture on a page, inside the first screen: load it at once.
  eager: { type: Boolean, default: false },
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

.shot-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* The mat: a little air on every side, so a picture that does not match
   the frame reads as placed, not as letterboxed. */
.shot--contain .shot-img {
  padding: 7%;
  filter: drop-shadow(0 6px 14px rgb(0 0 0 / 0.14));
}

.shot--cover .shot-img {
  object-fit: cover;
  /* Covers put their name and type at the top left; crop from the right. */
  object-position: var(--shot-focus, left top);
}
</style>
