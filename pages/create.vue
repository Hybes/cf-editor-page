<template>
  <div>
    <Head>
      <Title>New</Title>
    </Head>
    <div class="w-full">
      <UButton
        @click="clearDns()"
        class="absolute left-8 top-4"
        variant="outline"
        icon="i-clarity-undo-line"
        to="/records"
      >
        Back
      </UButton>
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
      <div v-else class="flex flex-col items-center">
        <div class="mt-4 flex gap-4">
          <UButton v-for="p in presets" @click="loadPreset(p)" variant="outline" color="orange"
            >{{ p }}<span @click="delPreset(p)"><Icon name="mdi:delete" /></span
          ></UButton>
          <UButton @click="savePreset" variant="outline" color="blue">Save Preset</UButton>
        </div>
        <h1 class="mb-2 mt-6 text-center text-lg font-semibold">{{ dns.name }}</h1>
        <div
          class="m-4 flex w-full flex-col justify-center gap-4 rounded p-4 text-center md:w-3/4 full:w-1/2"
        >
          <h2 class="mb-4 text-lg font-semibold">
            Creating DNS Record for <span class="text-blue-300">{{ zone.name }}</span>
          </h2>
          <div class="mb-2 flex items-center justify-between" v-if="dns.type !== 'SRV'">
            <label for="name" class="mr-2 w-24">Name:</label>
            <UInput
              @keydown.enter="createDns()"
              id="name"
              type="text"
              v-model="dns.name"
              placeholder="Name (Required)"
              class="flex-grow"
            />
          </div>
          <div class="mb-2 flex items-center justify-between">
            <label for="type-select" class="mr-2 w-24">Type:</label>
            <USelect
              id="type-select"
              v-model="dns.type"
              class="type-select flex-grow uppercase"
              :options="['A', 'CNAME', 'MX', 'SRV', 'TXT']"
            >
            </USelect>
          </div>
          <div class="flex w-full flex-col justify-center gap-4" v-if="dns.type === 'SRV'">
            <div class="mb-2 flex items-center justify-between">
              <label for="ttl" class="mr-2 w-24">Name:</label>
              <UInput
                id="srv_name"
                type="text"
                v-model="data.name"
                placeholder="Name"
                class="flex-grow"
              />
            </div>
            <div class="mb-2 flex items-center justify-between">
              <label for="ttl" class="mr-2 w-24">Port:</label>
              <UInput
                id="srv_port"
                type="text"
                v-model="data.port"
                placeholder="Port"
                class="flex-grow"
              />
            </div>
            <div class="mb-2 flex items-center justify-between">
              <label for="ttl" class="mr-2 w-24">Priority:</label>
              <UInput
                id="srv_priority"
                type="text"
                v-model="data.priority"
                placeholder="Priority"
                class="flex-grow"
              />
            </div>
            <div class="mb-2 flex items-center justify-between">
              <label for="ttl" class="mr-2 w-24">Proto:</label>
              <UInput
                id="srv_proto"
                type="text"
                v-model="data.proto"
                placeholder="Proto"
                class="flex-grow"
              />
            </div>
            <div class="mb-2 flex items-center justify-between">
              <label for="ttl" class="mr-2 w-24">Service:</label>
              <UInput
                id="srv_service"
                type="text"
                v-model="data.service"
                placeholder="Service"
                class="flex-grow"
              />
            </div>
            <div class="mb-2 flex items-center justify-between">
              <label for="ttl" class="mr-2 w-24">Target:</label>
              <UInput
                id="srv_target"
                type="text"
                v-model="data.target"
                placeholder="Target"
                class="flex-grow"
              />
            </div>
            <div class="mb-2 flex items-center justify-between">
              <label for="ttl" class="mr-2 w-24">Weight:</label>
              <UInput
                id="srv_weight"
                type="text"
                v-model="data.weight"
                placeholder="Weight"
                class="flex-grow"
              />
            </div>
          </div>
          <div class="mb-2 flex items-center justify-between" v-if="dns.type !== 'SRV'">
            <label
              @click="toggleEndpoint = !toggleEndpoint"
              for="endpoint"
              class="mr-2 w-24 cursor-pointer"
              >Endpoint:</label
            >
            <UInput
              @keydown.enter="createDns()"
              v-if="!toggleEndpoint"
              id="endpoint"
              type="text"
              v-model="dns.content"
              placeholder="Endpoint"
              class="flex-grow"
            />
            <textarea
              @keydown.enter="createDns()"
              v-else
              id="endpoint"
              v-model="dns.content"
              placeholder="Endpoint"
              class="flex-grow"
            ></textarea>
          </div>
          <div class="mb-2 flex items-center justify-between">
            <label for="ttl" class="mr-2 w-24">TTL:</label>
            <UInput
              @keydown.enter="createDns()"
              id="ttl"
              type="text"
              v-model="dns.ttl"
              placeholder="TTL (Leave blank or set to 1 for auto TTL)"
              class="flex-grow"
            />
          </div>
          <div class="mb-2 flex items-center justify-between" v-if="dns.type === 'SRV'">
            <label for="priority" class="mr-2 w-24">Priority:</label>
            <UInput
              id="priority"
              type="text"
              v-model="dns.priority"
              placeholder="Priority"
              class="flex-grow"
            />
          </div>
          <div
            class="mb-2 flex items-center justify-start"
            v-if="dns.type === 'A' || dns.type === 'CNAME'"
          >
            <label for="proxied" class="mr-2 w-24">Proxied:</label>
            <UToggle @keydown.enter="createDns()" id="proxied" v-model="dns.proxied" />
          </div>
          <div class="mb-2 flex items-center justify-between">
            <label for="comment" class="mr-2 w-24">Comment:</label>
            <UInput
              @keydown.enter="createDns()"
              id="comment"
              type="text"
              v-model="dns.comment"
              placeholder="Comment"
              class="flex-grow"
            />
          </div>
          <div>
            <UButton
              class="mt-4 px-6"
              color="green"
              variant="outline"
              :disabled="saving === 'progress'"
              :class="{ 'cursor-not-allowed bg-opacity-50': saving === 'progress' }"
              @click="createDns()"
              type="button"
              >Create</UButton
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const apiKey = ref('');
const currZone = ref('');
const dns = ref({
  name: '',
  type: 'CNAME',
  content: '',
  ttl: '',
  proxied: false,
  comment: '',
});
const data = ref({});
const loading = ref(true);
const saving = ref('');
const toggleEndpoint = ref(false);
const router = useRouter();
const zone = ref([]);
const presets = ref([]);

onMounted(() => {
  apiKey.value = localStorage.getItem('cf-api-key');
  if (!apiKey.value) {
    router.push('/login');
  }
  if (localStorage.getItem('cf-zone-id')) {
    currZone.value = localStorage.getItem('cf-zone-id');
    getZone();
    getPresets();
    loading.value = false;
  } else {
    router.push('/');
  }
  if (currZone.value === '63330adeb9390d44203534961651f894') {
    dns.value.type = 'CNAME';
    dns.value.content = 'dev.brth.uk';
    dns.value.ttl = '1';
    dns.value.proxied = true;
  }
});

const createDns = async () => {
  saving.value = 'progress';
  const bodyToSend = {
    apiKey: apiKey.value,
    currZone: currZone.value,
  };
  if (dns.value.type === 'SRV') {
    bodyToSend.data = data.value;
  } else {
    bodyToSend.dns = dns.value;
  }
  const response = await fetch('/api/create_record', {
    method: 'POST',
    body: JSON.stringify(bodyToSend),
  });
  if (response.ok) {
    const data = await response.json();
    const toast = useToast();
    if (data.success === true) {
      saving.value = 'success';
      toast.add({
        id: 'update-record-success' + Date.now(),
        title: 'Create success',
        description: 'Record created successfully',
        icon: 'i-clarity-check-circle-solid',
        timeout: 3000,
        color: 'green',
      });
      router.push('/records');
    } else {
      saving.value = 'error';
      console.error(data.errors[0].message);
      toast.add({
        id: 'update-record-error' + Date.now(),
        title: 'Create failed',
        description: data.errors[0].message,
        icon: 'i-clarity-warning-solid',
        timeout: 3000,
        color: 'red',
      });
      setTimeout(() => {
        saving.value = '';
      }, 3000);
    }
  } else {
    console.error('HTTP-Error: ' + response.status);
    saving.value = 'error';
    setTimeout(() => {
      saving.value = '';
    }, 3000);
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

const savePreset = () => {
  const preset = prompt('Enter a name for this preset');
  if (preset) {
    const { created_on, id, locked, meta, modified_on, zone_id, zone_name, name, ...rest } =
      dns.value;
    localStorage.setItem('cf-dns-preset-' + preset, JSON.stringify(rest));
  }
  getPresets();
};

const loadPreset = (preset) => {
  const presetData = JSON.parse(localStorage.getItem('cf-dns-preset-' + preset));
  if (presetData) {
    if (presetData.data) {
      // If there's a data object in the preset, spread its properties into data.value
      data.value = { ...data.value, ...presetData.data };
      // Remove the data property from presetData to avoid duplication
      delete presetData.data;
    }
    // Spread the remaining properties of presetData into dns.value
    dns.value = { ...dns.value, ...presetData };
  } else {
    console.error('Preset not found:', preset);
  }
};

const delPreset = (preset) => {
  localStorage.removeItem('cf-dns-preset-' + preset);
  getPresets();
};

const getPresets = () => {
  presets.value = []; // Clear the presets array first
  const seen = new Set();
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.includes('cf-dns-preset-')) {
      const preset = key.replace('cf-dns-preset-', '');
      if (!seen.has(preset)) {
        seen.add(preset);
        presets.value.push(preset);
      }
    }
  }
};

const clearDns = () => {
  localStorage.removeItem('cf-dns-id');
  localStorage.removeItem('cf-dns-name');
};
</script>
