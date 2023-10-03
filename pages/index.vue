<template>
  <div class="w-screen h-screen flex flex-col gap-2 justify-center items-center">

    <Head>
      <Title>Zones</Title>
    </Head>
    <UButton @click="resetConfig()" color="red" class="absolute top-4 right-8">Logout</UButton>
    <div class="flex gap-4 justify-center items-center my-2">
      <h1 class="text-xl font-semibold">Zones</h1>
      <UInput icon="i-heroicons-magnifying-glass-20-solid" v-model="searchQuery" type="text" placeholder="Search" ref="searchInput" size="md" color="white" class="w-full sm:w-auto" />
    </div>
    <div v-if="!loading" class="grid sm:grid-cols-2 lg:grid-cols-3 full:grid-cols-4 gap-4 flex-wrap justify-center items-center w-11/12 md:w-3/4 full:w-1/2">
      <div v-if="zones.length > 0" @click="setZone(zone)" class="bg-stone-100 rounded-md px-8 py-2 hover:bg-stone-200 dark:bg-stone-700 dark:hover:bg-stone-800 cursor-pointer"
        v-for="zone in filteredZones">
        <p>{{ zone.name }}</p>
      </div>
      <div v-else>
        <p>No zones found</p>
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
      loading: true,
      searchQuery: '',
    }
  },
  computed: {
        filteredZones() {
            return this.zones.filter((record) => {
                return record.name.toLowerCase().includes(this.searchQuery.toLowerCase())
            })
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
      localStorage.removeItem('cf-dns-id');
      localStorage.removeItem('cf-dns-name');
      this.$router.push('/login')
    },
    sort(field) {
            this.dnsRecords.sort((a, b) => a[field].localeCompare(b[field]));
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