<template>
  <div>
    <div class="flex w-full justify-end p-4">
      <UButton @click="resetConfig()" variant="outline" color="red" class="">Logout</UButton>
    </div>
    <div class="flex min-h-[80vh] w-screen flex-col items-center justify-center gap-2">
      <Head>
        <Title>Zones</Title>
      </Head>

      <div class="my-2 flex flex-col items-center justify-center gap-4">
        <h1 class="text-xl font-semibold">Zones</h1>
        <UInput
          icon="i-heroicons-magnifying-glass-20-solid"
          v-model="searchQuery"
          type="text"
          placeholder="Search"
          ref="searchInput"
          size="md"
          color="white"
          class="w-full sm:w-auto"
        />
      </div>
      <div
        v-if="!loading"
        :class="{
          'sm:grid-cols-1 lg:grid-cols-1 full:grid-cols-1': zones.length < 2,
          'sm:grid-cols-2 lg:grid-cols-3 full:grid-cols-4': zones.length > 1,
        }"
        class="grid w-11/12 items-center justify-center gap-4 md:w-10/12 full:w-1/2"
      >
        <div
          v-if="zones.length > 0"
          @click="setZone(zone)"
          class="group flex cursor-pointer flex-col items-center justify-between gap-2 rounded-md bg-stone-100 px-4 py-2 hover:bg-stone-200 dark:bg-stone-700 dark:hover:bg-stone-800"
          v-for="zone in filteredZones"
        >
          <div class="flex w-full items-center justify-between gap-2">
            <div class="flex items-center gap-4">
              <UTooltip v-if="zone.status === 'active' && zone.paused !== true" text="Active">
                <UIcon name="i-clarity-circle-solid" class="text-green-400" />
              </UTooltip>
              <UTooltip v-if="zone.status !== 'active' && zone.paused !== true" text="Inactive">
                <UIcon name="i-clarity-circle-solid" class="animate-pulse text-red-500" />
              </UTooltip>
              <UTooltip v-if="zone.paused === true" text="Domain is paused">
                <UIcon name="i-clarity-pause-solid" class="text-orange-400" />
              </UTooltip>
              <p>{{ zone.name }}</p>
            </div>
            <UIcon
              name="i-clarity-arrow-line"
              class="rotate-90 opacity-0 group-hover:opacity-100"
            />
          </div>
          <div class="flex w-full items-center justify-between gap-2">
            <p class="whitespace-nowrap text-xs text-gray-300">
              {{ moment(zone.created_on).format('MMM DD, YYYY') }}
            </p>
            <p class="truncate text-xs text-gray-500">
              {{ zone.id }}
            </p>
          </div>
        </div>
        <div v-else>
          <p>No zones found</p>
        </div>
      </div>
      <div v-else>
        <Loader />
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
export default {
  data() {
    return {
      apiKey: '',
      zones: [],
      loading: true,
      searchQuery: '',
      moment,
    };
  },
  computed: {
    filteredZones() {
      return this.zones.filter((record) => {
        return record.name.toLowerCase().includes(this.searchQuery.toLowerCase());
      });
    },
  },
  mounted() {
    this.apiKey = localStorage.getItem('cf-api-key');
    if (!this.apiKey) {
      this.$router.push('/login');
    } else {
      this.getZones();
    }
  },
  methods: {
    saveApiKey() {
      localStorage.setItem('cf-api-key', this.apiKey);
      this.$router.reload();
    },
    setZone(zone) {
      localStorage.setItem('cf-zone-id', zone.id);
      localStorage.setItem('cf-zone-name', zone.name);
      this.$router.push('/records');
    },
    resetConfig() {
      localStorage.removeItem('cf-api-key');
      localStorage.removeItem('cf-zone-id');
      localStorage.removeItem('cf-zone-name');
      localStorage.removeItem('cf-dns-id');
      localStorage.removeItem('cf-dns-name');
      this.$router.push('/login');
    },
    sort(field) {
      this.dnsRecords.sort((a, b) => a[field].localeCompare(b[field]));
    },
    async getZones() {
      const response = await fetch('/api/zones', {
        method: 'POST',
        body: JSON.stringify({
          apiKey: this.apiKey,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        this.zones = data.result;
        this.loading = false;
      } else {
        console.error('HTTP-Error: ' + response.status);
        this.loading = false;
      }
    },
  },
};
</script>
