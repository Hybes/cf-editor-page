<template>
  <div class="w-screen h-screen flex flex-col gap-2 justify-center items-center">

    <Head>
      <Title>Dashboard</Title>
    </Head>
    <UButton @click="resetConfig()" class="absolute top-4 right-8">Reset</UButton>
    <h1 class="text-xl font-semibold">Zones</h1>
    <div v-if="!loading">
      <div v-if="zones.length > 0" @click="setZone(zone)" class="bg-gray-200 rounded-md px-8 py-2 group hover:bg-gray-300 cursor-pointer"
        v-for="zone in zones">
        <p class="text-black">{{ zone.name }}</p>
      </div>
      <div v-else>
        <p class="text-black">No zones found</p>
      </div>
    </div>
    <div v-else>
      <div>
          <svg class="animate-spin w-12 h-12" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3a9 9 0 1 0 9 9"/></svg>
        </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      apiKey: '',
      zones: [],
      loading: true
    }
  },
  mounted() {
    this.apiKey = localStorage.getItem('cf-api-key')
    if (!this.apiKey) {
      this.$router.push('/login')
    }
    else {
      this.getZones()
    }

  },
  methods: {
    saveApiKey() {
      localStorage.setItem('cf-api-key', this.apiKey);
      this.$router.reload()
    },
    setZone(zone) {
      localStorage.setItem('cf-zone-id', zone.id);
      localStorage.setItem('cf-zone-name', zone.name);
      this.$router.push('/records')
    },
    resetConfig() {
      localStorage.removeItem('cf-api-key');
      localStorage.removeItem('cf-zone-id');
      localStorage.removeItem('cf-zone-name');
      this.$router.push('/login')
    },
    async getZones() {
      const response = await fetch('/api/zones', {
        method: 'POST',
        body: JSON.stringify({
          apiKey: this.apiKey
        }),
      })
      if (response.ok) {
        const data = await response.json();
        this.zones = data.result;
        this.loading = false;
      } else {
        console.error('HTTP-Error: ' + response.status);
        this.loading = false;
      }
    }
  }
}
</script>