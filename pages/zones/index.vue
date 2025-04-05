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
      <div v-else class="flex w-full max-w-4xl flex-col items-center justify-center gap-6 pt-6">
        <h1 class="text-center text-2xl font-semibold">Cloudflare DNS Editor</h1>
        <div class="flex w-full flex-col rounded-lg border p-4 dark:border-gray-700">
          <div class="mb-4 flex flex-col gap-2">
            <h2 class="text-lg font-medium">Your Zones</h2>
            <div class="text-sm text-gray-500">Select a zone to manage its DNS records</div>
          </div>
          <div class="relative mb-4 w-full">
            <UTooltip text="Press '/' to search">
              <UInput
                icon="i-heroicons-magnifying-glass-20-solid"
                v-model="searchQuery"
                type="text"
                placeholder="Search zones..."
                ref="searchInput"
                color="white"
                class="w-full transition-all focus-within:shadow-md"
                size="lg"
                @focus="focusSearchInput"
              />
            </UTooltip>
            <span v-if="searchQuery" class="absolute right-2 top-2 cursor-pointer text-gray-500 hover:text-gray-700" @click="searchQuery = ''">
              <UIcon name="i-heroicons-x-mark-20-solid" class="h-5 w-5" />
            </span>
          </div>
          <div class="w-full rounded">
            <UTable
              :rows="filteredZones"
              :columns="[
                { key: 'name', label: 'Domain' },
                { key: 'status', label: 'Status' },
                { key: 'actions', label: 'Actions' },
              ]"
              :loading="loading"
              :ui="{
                tr: {
                  base: 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              }"
              @row-click="(row) => navigateToZone(row.id)"
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
                    @click.stop="navigateToZone(row.id)" 
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
const searchInput = ref(null);
const searchQuery = ref('');

// Function to focus and select text in search input
const focusSearchInput = () => {
  setTimeout(() => {
    const input = searchInput.value?.$el.querySelector('input');
    if (input) {
      input.select();
    }
  }, 100);
};

// Filtered zones based on search query
const filteredZones = computed(() => {
  if (!searchQuery.value) return zones.value;
  
  const query = searchQuery.value.toLowerCase();
  return zones.value.filter(zone => 
    zone.name.toLowerCase().includes(query) || 
    zone.status.toLowerCase().includes(query)
  );
});

onMounted(async () => {
  apiKey.value = localStorage.getItem('cf-api-key');
  if (!apiKey.value) {
    router.push('/login');
    return;
  }
  
  // Add keyboard shortcut for search
  window.addEventListener('keydown', handleKeyDown);
  
  await getZones();
});

onUnmounted(() => {
  // Remove event listener when component is unmounted
  window.removeEventListener('keydown', handleKeyDown);
});

// Keyboard shortcut handler
const handleKeyDown = (e) => {
  // Focus search box when '/' is pressed and not in an input field
  if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
    e.preventDefault();
    searchInput.value?.$el.querySelector('input')?.focus();
  }
};

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