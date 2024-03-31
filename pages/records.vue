<template>
  <div>
    <Head>
      <Title>Records</Title>
    </Head>
    <div class="w-full">
      <div class="flex flex-row flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-8">
        <div class="flex flex-row flex-wrap justify-center gap-4">
          <UButton @click="clearZone()" variant="outline" icon="i-clarity-undo-line" to="/">
            Back
          </UButton>
          <UButton to="/create" variant="outline" color="green" icon="i-clarity-plus-circle-solid">
            Create
          </UButton>
        </div>
        <div class="flex flex-row flex-wrap justify-center gap-4 px-4 md:px-8">
          <ClientOnly>
            <UButton
              :icon="isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'"
              color="white"
              variant="outline"
              aria-label="Theme"
              @click="isDark = !isDark"
            />
            <template #fallback>
              <div class="h-8 w-8" />
            </template>
          </ClientOnly>
          <UButton @click="resetConfig()" variant="outline" color="red">Logout</UButton>
        </div>
      </div>
      <div class="flex flex-col items-center justify-center gap-4 px-4 md:px-8">
        <div class="flex w-full max-w-7xl flex-col justify-center gap-4">
          <NuxtLink
            :to="'http://' + currZoneName"
            external
            target="_blank"
            class="text-center text-2xl font-semibold text-stone-900 hover:underline dark:text-stone-100"
            >{{ currZoneName }}</NuxtLink
          >
          <div class="flex translate-x-[12px] flex-wrap items-center justify-center gap-4">
            <div
              class="group flex cursor-pointer items-center gap-4"
              v-for="ns in zone.name_servers"
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
              <UInput
                icon="i-heroicons-magnifying-glass-20-solid"
                v-model="searchQuery"
                type="text"
                placeholder="Search"
                ref="searchInput"
                color="white"
                class="min-w-[12rem] flex-grow"
              />
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
                base: 'even:bg-stone-100 even:dark:bg-stone-950/50',
              },
              td: {
                color: 'text-stone-700 dark:text-stone-200',
              },
            }"
          >
            <template #type-data="{ row, column }">
              <p class="truncate text-xs md:text-sm">{{ row[column.key] }}</p>
            </template>
            <template #name-data="{ row, column }">
              <div
                @click="setDns(row)"
                class="group flex max-w-[120px] cursor-pointer items-center gap-4 overflow-hidden sm:max-w-[200px]"
              >
                <p class="truncate text-xs font-medium group-hover:underline md:text-sm">
                  {{
                    row[column.key] === currZoneName || !row[column.key].endsWith(currZoneName)
                      ? row[column.key]
                      : row[column.key].slice(0, -currZoneName.length - 1)
                  }}
                </p>
              </div>
            </template>
            <template #content-data="{ row, column }">
              <div
                @click="setDns(row)"
                class="group flex max-w-[120px] cursor-pointer items-center gap-4 overflow-hidden sm:max-w-[200px] md:max-w-[280px] lg:max-w-[360px]"
              >
                <p class="truncate text-xs font-medium group-hover:underline md:text-sm">
                  {{ row[column.key] }}
                </p>
                <UTooltip v-if="row.proxied === true" text="Record is Proxied">
                  <UIcon
                    name="i-clarity-circle-solid"
                    class="animate-pulse text-xs text-orange-400 md:text-sm"
                  />
                </UTooltip>
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
const apiKey = ref('');
const currZone = ref('');
const currZoneName = ref('');
const dnsRecords = ref([]);
const zone = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const page = ref(1);
const pageCount = 25;
const router = useRouter();
const selectedStatus = ref([]);

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
  return dnsRecords.value
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
        click: () => setDns(row),
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

const filteredRecords = computed(() => {
  if (selectedStatus.value.length > 0) {
    return dnsRecords.value.filter((record) => {
      return selectedStatus.value.includes(record.type);
    });
  }
  return dnsRecords.value.filter((record) => {
    return (
      record.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      record.content.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  });
});

const rows = computed(() => {
  return filteredRecords.value.slice((page.value - 1) * pageCount, page.value * pageCount);
});

onMounted(async () => {
  apiKey.value = localStorage.getItem('cf-api-key');
  if (!apiKey.value) {
    router.push('/login');
  }
  if (localStorage.getItem('cf-zone-id')) {
    currZone.value = localStorage.getItem('cf-zone-id');
    currZoneName.value = localStorage.getItem('cf-zone-name');
    await getZone();
    await getDns();
  } else {
    router.push('/');
  }
});

const getDns = async () => {
  const toast = useToast();
  const response = await fetch('/api/records', {
    method: 'POST',
    body: JSON.stringify({
      apiKey: apiKey.value,
      currZone: currZone.value,
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
      router.push('/');
    }
    dnsRecords.value = data.result;
  } else {
    console.error('HTTP-Error: ' + response.status);
  }
};

const getZone = async () => {
  const response = await fetch('/api/zone', {
    method: 'POST',
    body: JSON.stringify({
      apiKey: apiKey.value,
      currZone: currZone.value,
    }),
  });
  if (response.ok) {
    const data = await response.json();
    zone.value = data.result;
    loading.value = false;
  } else {
    console.error('HTTP-Error: ' + response.status);
    loading.value = false;
  }
};

const delDns = async (record) => {
  const toast = useToast();
  const response = await fetch('/api/delete_record', {
    method: 'POST',
    body: JSON.stringify({
      apiKey: apiKey.value,
      currZone: currZone.value,
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

const setDns = (record) => {
  localStorage.setItem('cf-dns-id', record.id);
  localStorage.setItem('cf-dns-name', record.name);
  router.push('/editor');
};

const clearZone = () => {
  localStorage.removeItem('cf-zone-id');
  localStorage.removeItem('cf-zone-name');
  router.push('/');
};

const resetConfig = () => {
  localStorage.removeItem('cf-api-key');
  localStorage.removeItem('cf-zone-id');
  localStorage.removeItem('cf-zone-name');
  localStorage.removeItem('cf-dns-id');
  localStorage.removeItem('cf-dns-name');
  router.push('/login');
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
</script>
