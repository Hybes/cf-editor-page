<template>
  <div class="relative">
    <div v-if="loading">
      <div class="flex h-screen w-screen flex-col fixed bg-neutral-100 dark:bg-neutral-900 z-10 top-0 left-0 items-center justify-center gap-4">
        <div>
          <svg
            class="h-12 w-12 animate-spin"
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
        </div>
      </div>
    </div>
      <NuxtPage />
      <UNotifications />
      <div class="mb-14 mt-8 text-center">
        <div class="flex flex-col items-center justify-center gap-4">
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
          <UButton class="my-2" color="red" variant="outline" @click="resetConfig()"
            >Logout</UButton
          >
        </div>
        <p class="my-2 text-sm opacity-60 hover:opacity-80">
          <a href="https://connectdorset.com" target="_blank">Built by Connect</a>
        </p>
      </div>
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
  apiKey.value = localStorage.getItem('cf-api-key');
  if (apiKey.value) {
    loading.value = false;
  } else {
    useRouter().push('/login');
    loading.value = false;
  }
});

const resetConfig = () => {
  localStorage.removeItem('cf-api-key');
  localStorage.removeItem('cf-zone-id');
  localStorage.removeItem('cf-zone-name');
  localStorage.removeItem('cf-dns-id');
  localStorage.removeItem('cf-dns-name');
  useRouter().push('/login');
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
