<template>
  <div>
    <div class="flex w-full justify-end p-4">
      <UButton @click="resetConfig()" variant="outline" color="red" class="">Logout</UButton>
    </div>
    <div class="flex min-h-[70vh] w-screen flex-col items-center justify-center gap-2">
      <Head>
        <Title>Zones</Title>
      </Head>

      <div class="my-2 flex w-full flex-col items-center justify-center gap-4 sm:w-1/2">
        <h1 class="text-xl font-semibold">Zones</h1>
        <UInput
          icon="i-heroicons-magnifying-glass-20-solid"
          v-model="searchQuery"
          type="text"
          placeholder="Search"
          autofocus
          ref="searchInput"
          size="md"
          color="white"
          class="w-full"
        />
      </div>
      <div v-if="!loading" class="w-full">
        <UTable
          :rows="filteredZones"
          :columns="[
            {
              key: 'status',
            },
            {
              key: 'name',
              label: 'Name',
              sortable: true,
            },
            {
              key: 'created_on',
              label: 'Created On',
              sortable: true,
            },
            {
              key: 'id',
              label: 'ID',
            },
          ]"
          :ui="{
            tr: {
              base: 'even:bg-stone-950/50 odd:bg-stone-900/50',
            },

            td: {
              color: 'text-stone-300 dark:text-stone-200',
            },
          }"
          class="px-8"
          @select="setZone"
        >
          <template #status-data="{ row }">
            <div class="flex items-center gap-2">
              <UTooltip v-if="row.status === 'active' && row.paused !== true" text="Active">
                <UIcon name="i-clarity-circle-solid" class="text-green-400" />
              </UTooltip>
              <UTooltip v-if="row.status !== 'active' && row.paused !== true" text="Inactive">
                <UIcon name="i-clarity-circle-solid" class="animate-pulse text-red-500" />
              </UTooltip>
              <UTooltip v-if="row.paused === true" text="Domain is paused">
                <UIcon name="i-clarity-pause-solid" class="text-orange-400" />
              </UTooltip>
            </div>
          </template>
          <template #created_on-data="{ row }">
            <p class="whitespace nowrap text-xs text-gray-300">
              {{ moment(row.created_on).format('MMM DD, YYYY') }}
            </p>
          </template>
        </UTable>
      </div>
      <div v-else>
        <Loader />
      </div>
    </div>
  </div>
</template>

<script setup>
import moment from 'moment';
const apiKey = ref('');
const zones = ref([]);
const loading = ref(true);
const searchQuery = ref('');

const filteredZones = computed(() => {
  return zones.value.filter((record) => {
    return record.name.toLowerCase().includes(searchQuery.value.toLowerCase());
  });
});

onMounted(async () => {
  apiKey.value = localStorage.getItem('cf-api-key');
  if (!apiKey.value) {
    useRouter().push('/login');
  } else {
    await getZones();
  }
});

const setZone = (zone) => {
  localStorage.setItem('cf-zone-id', zone.id);
  localStorage.setItem('cf-zone-name', zone.name);
  useRouter().push('/records');
};

const resetConfig = () => {
  localStorage.removeItem('cf-api-key');
  localStorage.removeItem('cf-zone-id');
  localStorage.removeItem('cf-zone-name');
  localStorage.removeItem('cf-dns-id');
  localStorage.removeItem('cf-dns-name');
  useRouter().push('/login');
};

const getZones = async () => {
  const response = await fetch('/api/zones', {
    method: 'POST',
    body: JSON.stringify({
      apiKey: apiKey.value,
    }),
  });
  if (response.ok) {
    const data = await response.json();
    zones.value = data.result;
    loading.value = false;
  } else {
    console.error('HTTP-Error: ' + response.status);
    loading.value = false;
  }
};
</script>
