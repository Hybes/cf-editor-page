<template>
  <div>
    <Head>
      <Title>Records</Title>
    </Head>
    <div class="w-full">
      <div
        class="flex flex-row flex-wrap items-center justify-center gap-2 px-4 py-4 md:justify-between"
      >
        <div class="flex flex-row flex-wrap justify-center gap-2">
          <UButton @click="clearZone()" variant="outline" icon="i-clarity-undo-line" to="/">
            Back
          </UButton>
          <UButton to="/create" variant="outline" color="green" icon="i-clarity-plus-circle-solid">
            Create
          </UButton>
        </div>
        <div class="flex flex-row flex-wrap justify-center gap-2">
          <UButton
            @click="sort('type')"
            variant="outline"
            color="white"
            icon="i-clarity-cloud-network-line"
            >Sort Type</UButton
          >
          <UButton
            @click="sort('name')"
            variant="outline"
            color="white"
            icon="i-clarity-sort-by-line"
            >Sort Name</UButton
          >
          <UButton @click="resetConfig()" variant="outline" color="red">Logout</UButton>
        </div>
      </div>
      <div class="flex h-screen w-screen flex-col items-center justify-center" v-if="loading">
        <Loader />
      </div>
      <div v-else>
        <h1 class="my-4 text-center text-lg font-semibold">{{ currZoneName }}</h1>
        <div class="flex w-full flex-col justify-center gap-2 px-6 pb-4">
          <div class="flex flex-wrap items-center justify-center gap-4">
            <div
              class="group flex cursor-pointer items-center gap-2"
              v-for="ns in zone.name_servers"
              @click="copyToClipboard(ns)"
            >
              <p class="font-bold italic text-stone-300">{{ ns }}</p>
              <UIcon name="i-clarity-clipboard-line" class="opacity-0 group-hover:opacity-100" />
            </div>
          </div>
        </div>
        <UInput
          icon="i-heroicons-magnifying-glass-20-solid"
          v-model="searchQuery"
          type="text"
          placeholder="Search"
          ref="searchInput"
          size="md"
          color="white"
          class="mx-auto w-11/12 px-2 sm:w-1/3"
        />
        <div v-if="columns === false">
          <div
            :class="{
              'xs:grid-cols-1': dnsRecords.length < 2,
              'xs:grid-cols-2': dnsRecords.length > 1,
            }"
            class="grid gap-4 p-4"
          >
            <div
              @click="setDns(record)"
              class="cursor-pointer overflow-hidden rounded bg-stone-800 px-4 py-2 hover:bg-stone-900"
              v-for="record in dnsRecords"
            >
              <div class="flex items-center gap-2 border-b border-stone-600 pb-1 font-semibold">
                <p>
                  {{ record.type }}
                </p>
                <UTooltip v-if="record.proxied === true" text="Record is Proxied">
                  <UIcon name="i-clarity-circle-solid" class="text-orange-400" />
                </UTooltip>
              </div>
              <p class="truncate pt-1 text-stone-300">{{ record.name }}</p>
              <p class="truncate text-stone-500">{{ record.content }}</p>
            </div>
          </div>
        </div>
        <div v-if="columns === true || columns === null">
          <div class="flex w-full flex-col flex-wrap justify-center gap-3 overflow-clip p-4">
            <div class="ml-4 flex w-[calc(100%-3.8rem)] gap-8">
              <div class="min-w-[8rem] overflow-hidden px-2 py-1">
                <p class="truncate font-bold">Type</p>
              </div>
              <div class="min-w-[16rem] overflow-hidden px-2 py-1">
                <p class="truncate">Name</p>
              </div>
              <div class="max-w-[600px] overflow-hidden px-2 py-1">
                <p class="truncate">Content</p>
              </div>
            </div>
            <div
              class="flex w-full cursor-pointer flex-col gap-6 overflow-hidden rounded bg-stone-200 px-4 py-2 hover:bg-stone-300 dark:bg-stone-700 dark:hover:bg-stone-800 md:flex-row"
              v-for="record in filteredRecords"
            >
              <div class="flex w-[calc(100%-3.8rem)] gap-8" @click="setDns(record)">
                <div class="min-w-[8rem] overflow-hidden rounded-md bg-stone-950/40 px-2 py-1">
                  <p class="truncate text-center font-bold">{{ record.type }}</p>
                </div>
                <div class="flex min-w-[16rem] items-center gap-2 overflow-hidden px-2 py-1">
                  <p class="truncate">{{ record.name }}</p>
                  <UTooltip v-if="record.proxied === true" text="Record is Proxied">
                    <UIcon name="i-clarity-circle-solid" class="text-orange-400" />
                  </UTooltip>
                </div>
                <div class="max-w-[600px] overflow-hidden px-2 py-1">
                  <p class="truncate">{{ record.content }}</p>
                </div>
              </div>
              <UButton
                color="red"
                variant="outline"
                class="justify-self-end"
                @click="preDel(record)"
              >
                <UIcon name="i-clarity-trash-solid" />
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      apiKey: '',
      currZone: '',
      currZoneName: '',
      dnsRecords: [],
      zone: [],
      loading: true,
      columns: true,
      searchQuery: '',
    };
  },
  computed: {
    filteredRecords() {
      return this.dnsRecords.filter((record) => {
        return (
          record.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          record.content.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      });
    },
  },
  mounted() {
    this.apiKey = localStorage.getItem('cf-api-key');
    if (!this.apiKey) {
      this.$router.push('/login');
    }
    if (localStorage.getItem('cf-zone-id')) {
      this.currZone = localStorage.getItem('cf-zone-id');
      this.currZoneName = localStorage.getItem('cf-zone-name');
      this.getDns();
      this.getZone();
    } else {
      this.$router.push('/');
    }
    if (window.innerWidth <= 900) {
      this.columns = false;
    }
    if (window.innerWidth > 900) {
      this.columns = true;
    }
    window.addEventListener('resize', () => {
      if (window.innerWidth <= 900) {
        this.columns = false;
      }
      if (window.innerWidth > 900) {
        this.columns = true;
      }
    });
  },
  beforeDestroy() {
    window.removeEventListener('resize', () => {
      if (window.innerWidth < 800) {
        this.columns = false;
      }
    });
  },
  methods: {
    async getDns() {
      const toast = useToast();
      const response = await fetch('/api/records', {
        method: 'POST',
        body: JSON.stringify({
          apiKey: this.apiKey,
          currZone: this.currZone,
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
          this.$router.push('/');
        }

        this.dnsRecords = data.result;
      } else {
        console.error('HTTP-Error: ' + response.status);
      }
    },
    async getZone() {
      const response = await fetch('/api/zone', {
        method: 'POST',
        body: JSON.stringify({
          apiKey: this.apiKey,
          currZone: this.currZone,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        this.zone = data.result;
        this.loading = false;
      } else {
        console.error('HTTP-Error: ' + response.status);
        this.loading = false;
      }
    },
    async delDns(record) {
      const toast = useToast();
      const response = await fetch('/api/delete_record', {
        method: 'POST',
        body: JSON.stringify({
          apiKey: this.apiKey,
          currZone: this.currZone,
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
        this.getDns();
      } else {
        console.error('HTTP-Error: ' + response.status);
      }
    },
    preDel(record) {
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
              this.delDns(record);
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
    },
    sort(field) {
      this.dnsRecords.sort((a, b) => a[field].localeCompare(b[field]));
    },
    copyToClipboard(text) {
      navigator.clipboard.writeText(text);
      const toast = useToast();
      toast.add({
        id: 'copy-ns-success' + Date.now(),
        title: 'Copied to clipboard',
        description: text,
        icon: 'i-clarity-check-circle-solid',
        timeout: 1500,
      });
    },
    clearZone() {
      localStorage.removeItem('cf-zone-id');
      localStorage.removeItem('cf-zone-name');
    },
    handleKeydown(event) {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        this.$nextTick(() => this.$refs.searchInput.focus());
      }
    },
    hideSearch() {
      this.showSearch = false;
    },
    setDns(record) {
      localStorage.setItem('cf-dns-id', record.id);
      localStorage.setItem('cf-dns-name', record.name);
      this.$router.push('/editor');
    },
    switchView() {
      this.columns = !this.columns;
    },
    resetConfig() {
      localStorage.removeItem('cf-api-key');
      localStorage.removeItem('cf-zone-id');
      localStorage.removeItem('cf-zone-name');
      localStorage.removeItem('cf-dns-id');
      localStorage.removeItem('cf-dns-name');
      this.$router.push('/login');
    },
  },
};
</script>
