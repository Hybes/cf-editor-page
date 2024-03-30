<template>
  <div>
    <div class="flex w-full justify-end p-4 gap-2">
      <ClientOnly>
        <UButton
          :icon="isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'"
          color="white"
          variant="outline"
          aria-label="Theme"
          @click="isDark = !isDark"
        />
        <template #fallback>
          <div class="w-8 h-8" />
        </template>
      </ClientOnly>
      <UButton @click="resetConfig()" variant="outline" color="red" class="">Logout</UButton>
    </div>
    <div class="flex min-h-[70vh] w-screen flex-col items-center justify-center gap-2">
      <Head>
        <Title>Zones</Title>
      </Head>

      <div class="flex w-full flex-col items-center justify-center gap-4 px-4 md:px-8 sm:w-1/2">
        <h1 class="text-xl font-semibold">Zones</h1>
        <UInput
          icon="i-heroicons-magnifying-glass-20-solid"
          v-model="searchQuery"
          type="text"
          placeholder="Search"
          autofocus
          ref="searchInput"
          color="white"
          class="w-full"
        />
      </div>
      <div class="w-full">
        <UTable
          :rows="filteredZones"
          :columns="columns"
          :loading="loading"
          :ui="{
            tr: {
              base: 'even:bg-stone-100 even:dark:bg-stone-950/50',
            },

            td: {
              color: 'text-stone-700 dark:text-stone-200',
            },
          }"
          class="border mx-4 md:mx-8 rounded-lg border-stone-300 dark:border-stone-700"
          @select="setZone"
        >
          <template #name-data="{ row }">
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
              <p class="whitespace nowrap text-sm text-stone-600 dark:text-stone-200">
              {{ row.name }}
            </p>
            </div>
          </template>
          <template #created_on-data="{ row }">
            <p class="whitespace nowrap text-xs text-stone-600 dark:text-stone-200">
              {{ moment(row.created_on).format('MMM DD, YYYY') }}
            </p>
          </template>
          <template #original_registrar-data="{ row }">
            <p class="whitespace nowrap text-xs text-stone-600 dark:text-stone-200">
              {{ row.original_registrar ? row.original_registrar.replace(/\(.*?\)/g, '') : '' }}
            </p>
          </template>
        </UTable>
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

const columns = ref([
  {
    key: 'name',
    label: 'Name',
    sortable: true,
  },
  {
    key: 'created_on',
    label: 'Created',
    sortable: true,
  },
  {
    key: 'original_registrar',
    label: 'Previous',
    sortable: true,
  }
]);

const colorMode = useColorMode()
const isDark = computed({
  get () {
    return colorMode.value === 'dark'
  },
  set () {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  }
})

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
    console.log(data.result);
    loading.value = false;
  } else {
    console.error('HTTP-Error: ' + response.status);
    loading.value = false;
  }
};
</script>
