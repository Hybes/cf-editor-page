<template>
  <SeoKit />
  <div>
    <div v-if="loading">
      <div class="w-screen h-screen flex flex-col gap-2 justify-center items-center">
        <div>
          <svg class="animate-spin w-12 h-12" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3a9 9 0 1 0 9 9"/></svg>
        </div>
      </div>
    </div>
    <div v-else>
      <NuxtPage />
      <UNotifications />
      <div class="text-center mt-8 mb-14">
        <UButton class="my-2" color="red" variant="outline" @click="resetConfig()">Logout</UButton>
        <p class="text-sm my-2 opacity-60 hover:opacity-80"><a href="https://connectdorset.com" target="_blank">Built by Connect</a></p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  setup() {
    return {
      config: useRuntimeConfig(),
    };
  },
  data() {
    return {
      loading: true,
      apiKey: '',
    };
  },
  mounted() {
    this.apiKey = localStorage.getItem('cf-api-key')
    if (this.apiKey) {
        this.loading = false;
      } else {
        this.$router.push('/login')
        this.loading = false;
      }
  },
  methods: {
    navigateTo(id) {
      const element = document.querySelector(id);
      element.scrollIntoView({ behavior: 'smooth' });
    },
    resetConfig() {
      localStorage.removeItem('cf-api-key');
      localStorage.removeItem('cf-zone-id');
      localStorage.removeItem('cf-zone-name');
      localStorage.removeItem('cf-dns-id');
      localStorage.removeItem('cf-dns-name');
      this.$router.push('/login')
    }
  },
}
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
