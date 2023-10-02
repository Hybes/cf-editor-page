<template>
  <SeoKit />
  <div>
    <NuxtPage />
  </div>
</template>

<script>
export default {
  setup() {
    return {
      config: useRuntimeConfig(),
    };
  },
  methods: {
    navigateTo(id) {
      const element = document.querySelector(id);
      element.scrollIntoView({ behavior: 'smooth' });
    },
    toggleDrawer() {
      this.drawer = !this.drawer;
    },
    closeDrawer() {
      this.drawer = false;
    },
  },
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  opacity: 1;
  transition: opacity 0.5s cubic-bezier(0.33, 1, 0.68, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
