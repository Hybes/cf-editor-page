<template>
  <div>
    <Head>
      <Title>Zones</Title>
    </Head>
    <div class="flex h-full w-full flex-col items-center justify-center px-4">
      <div class="flex h-screen w-screen flex-col items-center justify-center" v-if="loading">
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
      <div v-else class="flex w-full max-w-4xl flex-col items-center justify-center gap-6">
        <h1 class="text-center text-2xl font-semibold">Cloudflare DNS Editor</h1>
        <div class="flex w-full flex-col rounded-lg border p-4 dark:border-gray-700">
          <div class="mb-4 flex flex-col gap-2">
            <h2 class="text-lg font-medium">Your Zones</h2>
            <div class="text-sm text-gray-500">Select a zone to manage its DNS records</div>
          </div>
          <div class="w-full rounded">
            <UTable
              :rows="zones"
              :columns="[
                { key: 'name', label: 'Domain' },
                { key: 'status', label: 'Status' },
                { key: 'actions', label: 'Actions' },
              ]"
              :loading="loading"
            >
              <template #name-data="{ row }">
                <div class="flex items-center gap-3">
                  <UIcon name="i-heroicons-globe-alt" class="text-blue-500" />
                  <div class="font-medium">{{ row.name }}</div>
                </div>
              </template>
              <template #status-data="{ row }">
                <UBadge
                  :color="row.status === 'active' ? 'green' : 'yellow'"
                  variant="subtle"
                  class="uppercase"
                >
                  {{ row.status }}
                </UBadge>
              </template>
              <template #actions-data="{ row }">
                <div class="flex gap-2">
                  <UButton 
                    @click="navigateToZone(row.id)" 
                    color="blue" 
                    variant="soft" 
                    size="sm"
                    icon="i-heroicons-pencil-square"
                  >
                    Manage Records
                  </UButton>
                </div>
              </template>
            </UTable>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const apiKey = ref('');
const zones = ref([]);
const loading = ref(true);
const router = useRouter();

onMounted(async () => {
  apiKey.value = localStorage.getItem('cf-api-key');
  if (!apiKey.value) {
    router.push('/login');
    return;
  }
  await getZones();
});

const getZones = async () => {
  try {
    const response = await fetch('/api/zones', {
      method: 'POST',
      body: JSON.stringify({ apiKey: apiKey.value }),
    });
    
    if (response.ok) {
      const data = await response.json();
      zones.value = data.result || [];
    } else {
      console.error('HTTP-Error: ' + response.status);
      const toast = useToast();
      toast.add({
        id: 'get-zones-error' + Date.now(),
        title: 'Error',
        description: 'Failed to fetch zones',
        icon: 'i-clarity-warning-solid',
        timeout: 3000,
        color: 'red',
      });
    }
  } catch (error) {
    console.error('Error fetching zones:', error);
  } finally {
    loading.value = false;
  }
};

const navigateToZone = (zoneId) => {
  // Also store in localStorage for compatibility with older pages
  localStorage.setItem('cf-zone-id', zoneId);
  
  // Look up zone name to store it too
  const zone = zones.value.find(z => z.id === zoneId);
  if (zone) {
    localStorage.setItem('cf-zone-name', zone.name);
  }
  
  router.push(`/zones/${zoneId}/records`);
};
</script> 