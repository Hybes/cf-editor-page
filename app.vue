<template>
  <div class="relative min-h-screen">
    <div v-if="loading">
      <div class="flex h-screen w-screen flex-col fixed bg-neutral-100 dark:bg-neutral-900 z-10 top-0 left-0 items-center justify-center gap-4">
        <div class="flex flex-col items-center gap-4">
          <svg
            class="h-16 w-16 animate-spin text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
          >
            <path
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 3a9 9 0 1 0 9 9"
            />
          </svg>
          <p class="text-lg font-medium">Loading Cloudflare DNS Editor...</p>
        </div>
      </div>
    </div>

    <NuxtPage />
    <UNotifications />
    
    <footer class="mt-8 pb-8 px-4 text-center">
      <div class="flex flex-col items-center justify-center gap-4">
        <div class="flex flex-wrap gap-3 justify-center">
          <ClientOnly>
            <UButton
              :icon="isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'"
              color="white"
              variant="outline"
              aria-label="Theme"
              @click="isDark = !isDark"
              >{{ isDark ? 'Light Mode' : 'Dark Mode' }}</UButton
            >
            <template #fallback>
              <div class="h-8 w-8" />
            </template>
          </ClientOnly>
          <UButton color="red" variant="outline" icon="i-heroicons-arrow-right-on-rectangle" @click="resetConfig()"
            >Logout</UButton
          >
        </div>
        <p class="mt-4 text-sm opacity-60 hover:opacity-80">
          <a href="https://connectdorset.com" target="_blank" class="flex items-center justify-center gap-2">
            <span>Built by Connect</span>
            <UIcon name="i-heroicons-arrow-top-right-on-square" class="h-4 w-4" />
          </a>
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
const loading = ref(true);
const apiKey = ref('');
const colorMode = useColorMode();
const isDark = computed({
  get() {
    return colorMode.value === 'dark';
  },
  set() {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
  },
});

onMounted(() => {
  // Simulate a minimum loading time for better UX
  setTimeout(() => {
    apiKey.value = localStorage.getItem('cf-api-key');
    if (apiKey.value) {
      loading.value = false;
    } else {
      useRouter().push('/login');
      loading.value = false;
    }
  }, 800);
});

const resetConfig = () => {
  localStorage.removeItem('cf-api-key');
  localStorage.removeItem('cf-zone-id');
  localStorage.removeItem('cf-zone-name');
  localStorage.removeItem('cf-dns-id');
  localStorage.removeItem('cf-dns-name');
  
  const router = useRouter();
  router.push('/login');
};
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  opacity: 1;
  transition: opacity 0.2s cubic-bezier(0.33, 1, 0.68, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
