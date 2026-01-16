<template>
  <div>
    <div class="w-full">
      <div class="flex flex-row flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-8">
        <div class="flex flex-row flex-wrap justify-center gap-4">
          <UButton variant="outline" icon="i-clarity-undo-line" to="/zones">
            Back to Zones
          </UButton>
          <UButton @click="navigateToCreate" variant="outline" color="green" icon="i-clarity-plus-circle-solid">
            Create Record
          </UButton>
          <UBadge v-if="searchQuery || selectedStatus.length > 0" color="blue" class="flex items-center gap-2">
            <span v-if="searchQuery">Search: {{ searchQuery }}</span>
            <span v-if="selectedStatus.length > 0">Types: {{ selectedStatus.join(', ') }}</span>
            <UIcon @click="clearFilters" name="i-heroicons-x-mark" class="h-4 w-4 cursor-pointer" />
          </UBadge>
        </div>
      </div>
      <div class="flex flex-col items-center justify-center gap-4 px-4 md:px-8">
        <div class="flex w-full max-w-7xl flex-col justify-center gap-4 mt-6">
          <div class="flex items-center justify-center gap-2">
            <NuxtLink
              :to="'http://' + zoneName"
              external
              target="_blank"
              class="text-center text-2xl font-semibold text-stone-900 hover:underline dark:text-stone-100"
              >{{ zoneName }}</NuxtLink
            >
            <div class="relative">
              <div @click="showDropdown = !showDropdown" class="cursor-pointer">
                <UIcon
                  name="i-clarity-lock-solid"
                  v-if="zone.ssl?.value === 'strict'"
                  class="h-6 w-6"
                />
                <UIcon
                  name="i-clarity-lock-line"
                  v-if="zone.ssl?.value === 'full'"
                  class="h-6 w-6"
                />
                <UIcon
                  name="i-clarity-curve-chart-solid"
                  v-if="zone.ssl?.value === 'flexible'"
                  class="h-6 w-6"
                />
                <UIcon
                  name="i-clarity-no-access-solid"
                  v-if="zone.ssl?.value === 'off'"
                  class="h-6 w-6"
                />
              </div>
              <div
                v-if="showDropdown"
                class="absolute right-0 z-10 mt-2 w-48 rounded border border-stone-600 bg-stone-300 shadow-lg dark:border-stone-400 dark:bg-stone-700"
              >
                <div
                  @click="updateSslSetting('strict')"
                  class="flex cursor-pointer items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-stone-800"
                  :class="{ 'bg-gray-200 dark:bg-gray-800': zone.ssl?.value === 'strict' }"
                >
                  <UIcon name="i-clarity-lock-solid" class="h-4 w-4" />
                  Strict
                </div>
                <div class="border-t border-stone-400 dark:border-stone-600"></div>
                <div
                  @click="updateSslSetting('full')"
                  class="flex cursor-pointer items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-stone-800"
                  :class="{ 'bg-gray-200 dark:bg-gray-800': zone.ssl?.value === 'full' }"
                >
                  <UIcon name="i-clarity-lock-line" class="h-4 w-4" />
                  Full
                </div>
                <div class="border-t border-stone-400 dark:border-stone-600"></div>
                <div
                  @click="updateSslSetting('flexible')"
                  class="flex cursor-pointer items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-stone-800"
                  :class="{ 'bg-gray-200 dark:bg-gray-800': zone.ssl?.value === 'flexible' }"
                >
                  <UIcon name="i-clarity-curve-chart-solid" class="h-4 w-4" />
                  Flexible
                </div>
                <div class="border-t border-stone-400 dark:border-stone-600"></div>
                <div
                  @click="updateSslSetting('off')"
                  class="flex cursor-pointer items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-stone-800"
                  :class="{ 'bg-gray-200 dark:bg-gray-800': zone.ssl?.value === 'off' }"
                >
                  <UIcon name="i-clarity-no-access-solid" class="h-4 w-4" />
                  Off
                </div>
              </div>
            </div>
          </div>
          <div class="flex translate-x-[12px] flex-wrap items-center justify-center gap-4">
            <div
              class="group flex cursor-pointer items-center gap-4"
              v-for="ns in zone.name_servers || []"
              @click="copyToClipboard(ns)"
            >
              <p class="font-bold italic text-stone-600 dark:text-stone-400">{{ ns }}</p>
              <UIcon name="i-clarity-clipboard-line" class="opacity-0 group-hover:opacity-100" />
            </div>
          </div>
        </div>
        <div class="flex w-full max-w-7xl flex-col items-center justify-center gap-4">
          <div class="flex w-full flex-wrap items-center justify-between gap-4">
            <div class="flex w-full gap-4 md:w-[calc(50%-0.5rem)]">
              <USelectMenu
                v-model="selectedStatus"
                :options="dnsTypes"
                multiple
                placeholder="Type"
                class="min-w-[6rem]"
              />
              <div class="relative flex-grow">
                <UTooltip text="Press '/' to search">
                  <UInput
                    icon="i-heroicons-magnifying-glass-20-solid"
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search records..."
                    ref="searchInput"
                    color="white"
                    class="min-w-[12rem] w-full transition-all focus-within:shadow-md"
                    size="lg"
                    @focus="() => { setTimeout(() => searchInput.value?.$el.querySelector('input')?.select(), 100) }"
                  />
                </UTooltip>
                <span v-if="searchQuery" class="absolute right-2 top-2 cursor-pointer text-gray-500 hover:text-gray-700" @click="searchQuery = ''">
                  <UIcon name="i-heroicons-x-mark-20-solid" class="h-5 w-5" />
                </span>
              </div>
            </div>
            <div class="flex w-full gap-4 md:w-[calc(50%-0.5rem)]">
              <USelectMenu
                class="flex-grow"
                v-model="selectedColumns"
                :options="columns"
                multiple
                placeholder="Columns"
              />
              <UPagination v-model="page" :page-count="pageCount" :total="filteredRecords.length" />
            </div>
          </div>
          <UTable
            :rows="rows"
            :columns="selectedColumns"
            :loading="loading"
            class="w-full rounded-lg border border-stone-300 dark:border-stone-700"
            :ui="{
              tr: {
                base: 'even:bg-stone-100 even:dark:bg-stone-950/50 hover:bg-stone-200 dark:hover:bg-stone-800',
              },
              td: {
                color: 'text-stone-700 dark:text-stone-200',
              },
            }"
          >
            <template #type-data="{ row, column }">
              <div class="flex items-center gap-2">
                <UBadge :color="getRecordTypeColor(row[column.key])" class="uppercase">
                  {{ row[column.key] }}
                </UBadge>
                <UTooltip v-if="row[column.key] === 'SRV'" text="Service Record - Maps services to hostnames and ports">
                  <UIcon name="i-heroicons-question-mark-circle" class="h-4 w-4 text-gray-500" />
                </UTooltip>
              </div>
            </template>
            <template #name-data="{ row, column }">
              <div
                @click="navigateToRecord(row.id)"
                class="group flex max-w-[120px] cursor-pointer items-center gap-2 overflow-hidden sm:max-w-[200px]"
              >
                <UIcon :name="getRecordTypeIcon(row.type)" class="h-4 w-4 text-gray-500" />
                <p class="truncate text-xs font-medium group-hover:underline md:text-sm">
                  {{ row._displayName }}
                </p>
              </div>
            </template>
            <template #content-data="{ row, column }">
              <div
                class="group flex max-w-[120px] items-center gap-4 overflow-hidden sm:max-w-[200px] md:max-w-[280px] lg:max-w-[360px]"
              >
                <p
                  @click="navigateToRecord(row.id)"
                  class="truncate text-xs font-medium group-hover:underline md:text-sm"
                >
                  {{ row._displayContent }}
                </p>
                <UToggle
                  v-if="row.proxiable"
                  v-model="row.proxied"
                  color="orange"
                  @update:modelValue="() => updateProxyStatus(row)"
                />
              </div>
            </template>
            <template #created_on-data="{ row, column }" v-show="isLargeScreen">
              <div
                class="flex max-w-[200px] items-center gap-4 overflow-hidden truncate text-xs md:text-sm"
              >
                <p class="truncate">{{ moment(row[column.key]).format('DD/MM/YYYY') }}</p>
              </div>
            </template>
            <template #modified_on-data="{ row, column }" v-show="isLargeScreen">
              <div
                class="flex max-w-[200px] items-center gap-4 overflow-hidden truncate text-xs md:text-sm"
              >
                <p class="truncate">{{ moment(row[column.key]).format('DD/MM/YYYY') }}</p>
              </div>
            </template>
            <template #actions-data="{ row }">
              <UDropdown :items="items(row)">
                <UButton
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-ellipsis-horizontal-20-solid"
                />
              </UDropdown>
            </template>
          </UTable>
          <div class="flex w-full justify-end">
            <UPagination v-model="page" :page-count="pageCount" :total="filteredRecords.length" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import moment from 'moment';
import { useDebounceFn } from '@vueuse/core';

const route = useRoute();
const router = useRouter();
const zoneId = computed(() => route.params.zone_id);
const apiKey = ref('');
const zoneName = ref('');
const dnsRecords = ref([]);
const zone = ref({});
const loading = ref(true);
const searchQuery = ref('');
const page = ref(1);
const pageCount = 25;
const selectedStatus = ref([]);
const showDropdown = ref(false);
const windowSize = useWindowSize();
const isLargeScreen = computed(() => windowSize.width.value >= 768);

const updateProxyStatus = async (record) => {
  const toast = useToast();
  const response = await fetch('/api/update_record', {
    method: 'POST',
    body: JSON.stringify({
      apiKey: apiKey.value,
      currZone: zoneId.value,
      currDnsRecord: record.id,
      dns: { ...record, proxied: record.proxied ? true : false },
    }),
  });
  if (response.ok) {
    const data = await response.json();
    if (data.success) {
      toast.add({
        id: 'update-proxy-success' + Date.now(),
        title: 'Update success',
        description: 'Proxy status updated successfully',
        icon: 'i-clarity-check-circle-solid',
        timeout: 3000,
        color: 'green',
      });
      await getDns(); // Refresh the DNS records
    } else {
      console.error(data.errors[0].message);
      toast.add({
        id: 'update-proxy-error' + Date.now(),
        title: 'Update failed',
        description: data.errors[0].message,
        icon: 'i-clarity-warning-solid',
        timeout: 3000,
        color: 'red',
      });
    }
  } else {
    console.error('HTTP-Error: ' + response.status);
  }
};

const updateSslSetting = async (sslMode) => {
  const toast = useToast();
  const response = await fetch('/api/update_ssl', {
    method: 'POST',
    body: JSON.stringify({
      apiKey: apiKey.value,
      currZone: zoneId.value,
      ssl: sslMode,
    }),
  });
  if (response.ok) {
    const data = await response.json();
    if (data.success) {
      toast.add({
        id: 'update-ssl-success' + Date.now(),
        title: 'Update success',
        description: 'SSL status updated successfully',
        icon: 'i-clarity-check-circle-solid',
        timeout: 3000,
        color: 'green',
      });
      showDropdown.value = false;
      await getAll();
    } else {
      console.error(data.errors[0].message);
      toast.add({
        id: 'update-ssl-error' + Date.now(),
        title: 'Update failed',
        description: data.errors[0].message,
        icon: 'i-clarity-warning-solid',
        timeout: 3000,
        color: 'red',
      });
    }
  } else {
    console.error('HTTP-Error: ' + response.status);
  }
};

const colorMode = useColorMode();
const isDark = computed({
  get() {
    return colorMode.value === 'dark';
  },
  set() {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
  },
});

const dnsTypes = computed(() => {
  if (!dnsRecords.value) return [];
  return dnsRecords.value
    .filter((record) => record && record.type)
    .map((record) => record.type)
    .filter((value, index, self) => self.indexOf(value) === index);
});

const columns = [
  {
    key: 'type',
    label: 'Type',
    sortable: true,
  },
  {
    key: 'name',
    label: 'Name',
    sortable: true,
  },
  {
    key: 'content',
    label: 'Content',
    sortable: true,
  },
  {
    key: 'created_on',
    label: 'Created',
    sortable: true,
  },
  {
    key: 'modified_on',
    label: 'Modified',
    sortable: true,
  },
  {
    key: 'actions',
    label: 'Actions',
    sortable: false,
  },
];

const selectedColumns = ref([...columns]);

const items = (row) => {
  return [
    [
      {
        label: 'Edit',
        icon: 'i-heroicons-pencil-square-20-solid',
        click: () => navigateToRecord(row.id),
      },
      {
        label: row.proxiable ? 'Proxiable' : 'Not Proxiable',
        disabled: true,
        icon: row.proxiable ? 'i-heroicons-check-circle-20-solid' : 'i-heroicons-x-circle-20-solid',
      },
    ],
    [
      {
        label: 'Delete',
        icon: 'i-heroicons-trash-20-solid',
        color: 'red',
        click: () => preDel(row),
      },
    ],
  ];
};

const formatDisplayName = (record) => {
  // First handle SRV records with special logic
  if (record.type === 'SRV') {
    return formatSrvRecordName(record);
  }
  
  // For standard records, handle zone name trimming
  const name = record.name;
  if (!name) return '';
  
  if (name === zoneName.value || !name.endsWith(zoneName.value)) {
    return name;
  }
  
  // Remove zone name and the preceding dot
  return name.slice(0, -zoneName.value.length - 1);
};

// Add a computed property for processed records to avoid repeated calculations
const processedRecords = computed(() => {
  if (!dnsRecords.value || !zoneName.value) return [];
  
  return dnsRecords.value.map(record => ({
    ...record,
    _displayName: formatDisplayName(record),
    _displayContent: formatContent(record)
  }));
});

const filteredRecords = computed(() => {
  let records = processedRecords.value || [];
  
  if (selectedStatus.value.length > 0) {
    records = records.filter(record => selectedStatus.value.includes(record.type));
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    records = records.filter(record => {
      return (
        (record.name && record.name.toLowerCase().includes(query)) ||
        (record.content && record.content.toLowerCase().includes(query)) ||
        (record.comment && record.comment.toLowerCase().includes(query))
      );
    });
  }
  
  return records;
});

const rows = computed(() => {
  const startIndex = (page.value - 1) * pageCount;
  const endIndex = startIndex + pageCount;
  return filteredRecords.value.slice(startIndex, endIndex);
});

// Add watch to update URL when filter changes
watch(selectedStatus, (newValue) => {
  if (newValue.length) {
    router.push({
      query: { 
        ...route.query,
        types: newValue.join(',') 
      }
    });
  } else if (route.query.types) {
    // Remove the types param if no filters are selected
    const { types, ...restQuery } = route.query;
    router.push({ query: restQuery });
  }
}, { deep: true });

// Add debounced function to update URL when search changes
const debouncedUpdateSearchQuery = useDebounceFn((newValue) => {
  if (newValue) {
    router.push({
      query: { 
        ...route.query,
        search: newValue 
      }
    });
  } else if (route.query.search) {
    // Remove the search param if query is empty
    const { search, ...restQuery } = route.query;
    router.push({ query: restQuery });
  }
}, 300);

// Watch search query changes
watch(searchQuery, (newValue) => {
  debouncedUpdateSearchQuery(newValue);
});

// Add watch to update URL when page changes
watch(page, (newValue) => {
  if (newValue > 1) {
    router.push({
      query: { 
        ...route.query,
        page: newValue.toString()
      }
    });
  } else if (route.query.page) {
    // Remove the page param if on page 1
    const { page, ...restQuery } = route.query;
    router.push({ query: restQuery });
  }
});

// Initialize from URL params
onMounted(async () => {
  apiKey.value = localStorage.getItem('cf-api-key');
  if (!apiKey.value) {
    router.push('/login');
    return;
  }
  
  // Check if we have types in the URL
  if (route.query.types) {
    const typesParam = route.query.types;
    selectedStatus.value = typesParam.includes(',') 
      ? typesParam.split(',') 
      : [typesParam];
  }
  
  // Check if we have search in the URL
  if (route.query.search) {
    searchQuery.value = route.query.search;
  }
  
  // Check if we have page in the URL
  if (route.query.page) {
    const pageNum = parseInt(route.query.page);
    if (!isNaN(pageNum) && pageNum > 0) {
      page.value = pageNum;
    }
  }
  
  // Add keyboard shortcut for search
  window.addEventListener('keydown', handleKeyDown);
  
  await getAll();
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

const getDns = async () => {
  const toast = useToast();
  const response = await fetch('/api/records', {
    method: 'POST',
    body: JSON.stringify({
      apiKey: apiKey.value,
      currZone: zoneId.value,
    }),
  });
  if (response.ok) {
    const data = await response.json();
    if (data.success === false) {
      toast.add({
        id: 'get-records-failed' + Date.now(),
        title: 'Failed to get records',
        description: data.errors[0].message,
        icon: 'i-clarity-warning-solid',
        timeout: 3000,
        color: 'red',
      });
      router.push('/zones');
      return;
    }
    
    // Ensure the zoneName is available before updating the dnsRecords
    if (!zoneName.value && data.result && data.result.length > 0) {
      await getZone();
    }
    
    // Update the records array
    dnsRecords.value = data.result || [];
  } else {
    console.error('HTTP-Error: ' + response.status);
  }
};

const getZone = async () => {
  const response = await fetch('/api/zone', {
    method: 'POST',
    body: JSON.stringify({
      apiKey: apiKey.value,
      currZone: zoneId.value,
    }),
  });
  if (response.ok) {
    const data = await response.json();
    if (data.success && data.result) {
      zone.value = data.result;
      zoneName.value = data.result.name;
    }
  } else {
    console.error('HTTP-Error: ' + response.status);
  }
};

const getAll = async () => {
  loading.value = true;
  // Get zone info first, then DNS records
  await getZone();
  await getDns();
  loading.value = false;
};

const delDns = async (record) => {
  const toast = useToast();
  const response = await fetch('/api/delete_record', {
    method: 'POST',
    body: JSON.stringify({
      apiKey: apiKey.value,
      currZone: zoneId.value,
      currDnsRecord: record.id,
    }),
  });
  if (response.ok) {
    const data = await response.json();
    toast.add({
      id: 'delete-record-success' + Date.now(),
      title: 'Delete success',
      description: 'Record deleted successfully',
      icon: 'i-clarity-check-circle-solid',
      timeout: 3000,
      color: 'green',
    });
    await getDns();
  } else {
    console.error('HTTP-Error: ' + response.status);
  }
};

const preDel = (record) => {
  const toast = useToast();
  toast.add({
    id: 'delete-record' + Date.now(),
    title: 'Delete record',
    description: 'Are you sure you want to delete this record?',
    icon: 'i-clarity-warning-solid',
    timeout: 3000,
    color: 'red',
    actions: [
      {
        label: 'Delete',
        color: 'red',
        click: () => {
          delDns(record);
          toast.remove('delete-record' + Date.now());
        },
      },
      {
        label: 'Cancel',
        color: 'white',
        click: () => {
          toast.remove('delete-record' + Date.now());
        },
      },
    ],
  });
};

const navigateToRecord = (recordId) => {
  // Also store in localStorage for compatibility with older pages
  localStorage.setItem('cf-dns-id', recordId);
  
  // Find record to store its name
  const record = dnsRecords.value.find(r => r.id === recordId);
  if (record) {
    localStorage.setItem('cf-dns-name', record.name);
  }
  
  // Add return query parameters to preserve filter state
  let returnQuery = '';
  if (Object.keys(route.query).length > 0) {
    // Encode the current query state
    returnQuery = encodeURIComponent(
      JSON.stringify(route.query)
    );
  }
  
  // Navigate with return query param if we have filters
  if (returnQuery) {
    router.push(`/zones/${zoneId.value}/records/${recordId}?return=${returnQuery}`);
  } else {
    router.push(`/zones/${zoneId.value}/records/${recordId}`);
  }
};

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
  const toast = useToast();
  toast.add({
    id: 'copy-ns' + Date.now(),
    title: 'Copied to clipboard',
    description: 'Nameserver copied to clipboard',
    icon: 'i-clarity-check-circle-solid',
    timeout: 3000,
    color: 'green',
  });
};

// Utility function to format content based on record type
const formatContent = (record) => {
  if (record.type === 'SRV' && record.data) {
    // For Minecraft SRV records, use a special format
    if (record.name && record.name.includes('_minecraft._tcp')) {
      // Extract just what follows after _minecraft._tcp.
      const domainPart = record.name.split('_minecraft._tcp.')[1];
      if (domainPart) {
        return `${domainPart} → ${record.data.target}:${record.data.port}`;
      }
    }
    
    // Make sure we have all the required fields before showing them
    if (record.data.target && record.data.port) {
      return `➡️ ${record.data.target}:${record.data.port}${record.data.weight ? ` (Weight: ${record.data.weight})` : ''}`;
    }
  }
  
  // For all other record types or if SRV is missing data
  return record.content || '';
};

// Get color for record type badge
const getRecordTypeColor = (type) => {
  const colorMap = {
    'A': 'blue',
    'AAAA': 'indigo',
    'CNAME': 'green',
    'MX': 'purple',
    'SRV': 'orange',
    'TXT': 'gray',
  };
  return colorMap[type] || 'yellow';
};

// Get icon for record types
const getRecordTypeIcon = (type) => {
  const iconMap = {
    'A': 'mdi:alpha-a-circle',
    'AAAA': 'mdi:alpha-a-circle',
    'CNAME': 'mdi:alpha-c-circle',
    'MX': 'mdi:email',
    'SRV': 'mdi:server',
    'TXT': 'mdi:text-box'
  };
  return iconMap[type] || 'mdi:dns';
};

// Format SRV record name for display
const formatSrvRecordName = (record) => {
  const name = record.name;
  
  // Handle Minecraft SRV
  if (name.includes('_minecraft._tcp')) {
    // Extract just what follows after _minecraft._tcp.
    const domainPart = name.split('_minecraft._tcp.')[1];
    if (domainPart) {
      return domainPart;
    }
  }
  
  // Handle general SRV records
  // Remove the service and proto parts, display them in a cleaner way
  const parts = name.split('.');
  
  // Try to find service and proto parts (with leading underscores)
  const serviceParts = parts.filter(p => p.startsWith('_'));
  if (serviceParts.length >= 2) {
    // Get domain by removing service parts
    const domainParts = parts.filter(p => !p.startsWith('_'));
    
    // Create a cleaner display version
    const service = serviceParts.map(p => p.replace('_', '')).join('.');
    return `${service}.${domainParts.join('.')}`;
  }
  
  return name;
};

// Add function to navigate to create page with return state
const navigateToCreate = () => {
  // Add return query parameters to preserve filter state
  let returnQuery = '';
  if (Object.keys(route.query).length > 0) {
    // Encode the current query state
    returnQuery = encodeURIComponent(
      JSON.stringify(route.query)
    );
  }
  
  // Navigate with return query param if we have filters
  if (returnQuery) {
    router.push(`/zones/${zoneId.value}/records/create?return=${returnQuery}`);
  } else {
    router.push(`/zones/${zoneId.value}/records/create`);
  }
};

// Add the clearFilters method
const clearFilters = () => {
  searchQuery.value = '';
  selectedStatus.value = [];
  page.value = 1;
  
  // Clear URL query params
  router.push({ query: {} });
};
</script> 