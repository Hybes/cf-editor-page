<template>
  <div>
    <Head>
      <Title>Create DNS Record</Title>
    </Head>
    <div class="w-full">
      <UButton
        class="absolute left-8 top-4"
        variant="outline"
        icon="i-clarity-undo-line"
        :to="`/zones/${zoneId}/records`"
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
      <div v-else class="flex flex-col items-center mb-20">
        <div class="mt-4 flex flex-wrap gap-4 justify-center">
          <UButton v-for="(p, index) in presets" :key="index" @click="loadPreset(p)" variant="outline" color="orange"
            class="flex items-center gap-2"
            >{{ p }}
            <UTooltip text="Delete preset">
              <span @click.stop="delPreset(p)" class="p-1 hover:bg-red-100 rounded-full">
                <Icon name="mdi:delete" />
              </span>
            </UTooltip>
          </UButton>
          <UButton @click="savePreset" variant="outline" color="blue" icon="i-heroicons-bookmark">Save Preset</UButton>
        </div>
        <h1 class="mb-2 mt-6 text-center text-xl font-semibold">{{ zone.name }}</h1>
        <div
          class="m-4 flex w-full flex-col justify-center gap-4 rounded-xl border dark:border-gray-700 p-6 shadow-sm text-center md:w-3/4 lg:w-1/2"
        >
          <h2 class="mb-2 text-lg font-semibold flex items-center justify-center gap-2">
            <Icon name="mdi:dns" class="text-blue-500" /> Create DNS Record
          </h2>
          <div class="mb-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-sm">
            <div class="flex items-start">
              <UIcon name="i-heroicons-information-circle" class="mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p class="font-medium">DNS Record Types:</p>
                <ul class="list-disc list-inside mt-1 space-y-1">
                  <li><span class="font-medium">A</span>: Maps a domain to an IPv4 address (e.g., 192.168.1.1)</li>
                  <li><span class="font-medium">CNAME</span>: Creates an alias pointing to another domain</li>
                  <li><span class="font-medium">MX</span>: Directs email to a mail server</li>
                  <li><span class="font-medium">TXT</span>: Stores text information (often for verification)</li>
                  <li><span class="font-medium">SRV</span>: Maps services to specific servers and ports</li>
                </ul>
              </div>
            </div>
          </div>
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
            <div class="mb-4 flex items-center justify-center">
              <UToggle v-model="advancedSrvMode" class="mr-2" />
              <label @click="advancedSrvMode = !advancedSrvMode" class="cursor-pointer text-sm">
                {{ advancedSrvMode ? 'Switch to Simple Mode' : 'Switch to Advanced Mode' }}
              </label>
            </div>
            
            <div v-if="!advancedSrvMode">
              <div class="mb-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-sm">
                <p class="mb-2 font-medium">Quick Service Setup</p>
                <div class="flex flex-wrap gap-2 mb-4">
                  <UButton @click="loadSrvPreset('_sip._tcp', 5060)" size="xs" variant="soft" color="blue">SIP</UButton>
                  <UButton @click="loadSrvPreset('_xmpp-server._tcp', 5269)" size="xs" variant="soft" color="blue">XMPP</UButton>
                  <UButton @click="loadSrvPreset('_ldap._tcp', 389)" size="xs" variant="soft" color="blue">LDAP</UButton>
                  <UButton @click="loadSrvPreset('_imap._tcp', 143)" size="xs" variant="soft" color="blue">IMAP</UButton>
                  <UButton @click="loadSrvPreset('_smtp._tcp', 25)" size="xs" variant="soft" color="blue">SMTP</UButton>
                  <UButton @click="loadSrvPreset('_minecraft._tcp', 25565)" size="xs" variant="soft" color="green">Minecraft</UButton>
                </div>
              </div>
              
              <div class="mb-2 flex items-center justify-between">
                <label for="srv_simple_service" class="mr-2 w-24">Service:</label>
                <USelect
                  id="srv_simple_service"
                  v-model="srvSimpleService"
                  class="flex-grow"
                  :options="commonServices"
                  @update:modelValue="updateSrvFromSimple"
                />
              </div>
              
              <div class="mb-2 flex items-center justify-between">
                <label for="srv_simple_name" class="mr-2 w-24">Name:</label>
                <UInput
                  id="srv_simple_name"
                  type="text"
                  v-model="data.name"
                  placeholder="Hostname or subdomain"
                  class="flex-grow"
                  @update:modelValue="updateSrvPreview"
                />
              </div>
              
              <div class="mb-2 flex items-center justify-between">
                <label for="srv_simple_target" class="mr-2 w-24">Target:</label>
                <UInput
                  id="srv_simple_target"
                  type="text"
                  v-model="data.target"
                  placeholder="Target hostname"
                  class="flex-grow"
                />
              </div>
              
              <div class="mb-2 flex items-center justify-between">
                <label for="srv_simple_port" class="mr-2 w-24">Port:</label>
                <UInput
                  id="srv_simple_port"
                  type="number"
                  v-model="data.port"
                  placeholder="Port number"
                  class="flex-grow"
                />
              </div>
              
              <div class="mb-2 flex items-center justify-between">
                <label for="srv_preview" class="mr-2 w-24">Full Name:</label>
                <UInput
                  id="srv_preview"
                  type="text"
                  :model-value="formatSrvDisplayName()"
                  placeholder="Preview"
                  class="flex-grow text-gray-500"
                  disabled
                />
              </div>
              
              <div class="mb-2 flex items-center justify-between">
                <label for="srv_full_name" class="mr-2 w-24">Technical:</label>
                <UInput
                  id="srv_full_name"
                  type="text"
                  :model-value="getSrvFullName()"
                  placeholder="Technical format"
                  class="flex-grow text-gray-500"
                  disabled
                />
              </div>
              
              <div class="mt-2 bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4 text-sm">
                <p class="flex items-center">
                  <UIcon name="i-heroicons-information-circle" class="mr-2" />
                  Priority: {{ data.priority || 1 }} | Weight: {{ data.weight || 10 }}
                  <UButton @click="advancedSrvMode = true" variant="link" class="ml-auto">Edit</UButton>
                </p>
              </div>
            </div>
            
            <div v-else>
              <div class="mb-2 flex items-center justify-between">
                <label for="srv_name" class="mr-2 w-24">Name:</label>
                <UInput
                  id="srv_name"
                  type="text"
                  v-model="data.name"
                  placeholder="Name"
                  class="flex-grow"
                  @update:modelValue="updateSrvPreview"
                />
              </div>
              <div class="mb-2 flex items-center justify-between">
                <label for="srv_service" class="mr-2 w-24">Service:</label>
                <UInput
                  id="srv_service"
                  type="text"
                  v-model="data.service"
                  placeholder="Service"
                  class="flex-grow"
                  @update:modelValue="updateSrvPreview"
                />
              </div>
              <div class="mb-2 flex items-center justify-between">
                <label for="srv_proto" class="mr-2 w-24">Proto:</label>
                <UInput
                  id="srv_proto"
                  type="text"
                  v-model="data.proto"
                  placeholder="Proto"
                  class="flex-grow"
                  @update:modelValue="updateSrvPreview"
                />
              </div>
              <div class="mb-2 flex items-center justify-between">
                <label for="srv_target" class="mr-2 w-24">Target:</label>
                <UInput
                  id="srv_target"
                  type="text"
                  v-model="data.target"
                  placeholder="Target"
                  class="flex-grow"
                />
              </div>
              <div class="mb-2 flex items-center justify-between">
                <label for="srv_port" class="mr-2 w-24">Port:</label>
                <UInput
                  id="srv_port"
                  type="number"
                  v-model="data.port"
                  placeholder="Port"
                  class="flex-grow"
                />
              </div>
              <div class="mb-2 flex items-center justify-between">
                <label for="srv_priority" class="mr-2 w-24">Priority:</label>
                <UInput
                  id="srv_priority"
                  type="number"
                  v-model="data.priority"
                  placeholder="Priority"
                  class="flex-grow"
                />
              </div>
              <div class="mb-2 flex items-center justify-between">
                <label for="srv_weight" class="mr-2 w-24">Weight:</label>
                <UInput
                  id="srv_weight"
                  type="number"
                  v-model="data.weight"
                  placeholder="Weight"
                  class="flex-grow"
                />
              </div>
              <div class="mb-2 flex items-center justify-between">
                <label for="srv_preview" class="mr-2 w-24">Full Name:</label>
                <UInput
                  id="srv_preview"
                  type="text"
                  :model-value="formatSrvDisplayName()"
                  placeholder="Preview"
                  class="flex-grow text-gray-500"
                  disabled
                />
              </div>
              <div class="mb-2 flex items-center justify-between">
                <label for="srv_full_name" class="mr-2 w-24">Technical:</label>
                <UInput
                  id="srv_full_name"
                  type="text"
                  :model-value="getSrvFullName()"
                  placeholder="Technical format"
                  class="flex-grow text-gray-500"
                  disabled
                />
              </div>
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
          <div class="mb-2 flex items-center justify-between" v-if="dns.type === 'SRV' || dns.type === 'MX'">
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
const route = useRoute();
const router = useRouter();
const zoneId = computed(() => route.params.zone_id);
const apiKey = ref('');
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
const zone = ref({});
const presets = ref([]);
const windowSize = useWindowSize();
const isLargeScreen = computed(() => windowSize.width.value >= 768);

// For SRV records
const advancedSrvMode = ref(false);
const srvSimpleService = ref('');

const commonServices = [
  { label: 'SIP (Voice/Video)', value: '_sip._tcp' },
  { label: 'XMPP (Chat)', value: '_xmpp-server._tcp' },
  { label: 'LDAP (Directory)', value: '_ldap._tcp' },
  { label: 'IMAP (Email)', value: '_imap._tcp' },
  { label: 'SMTP (Email)', value: '_smtp._tcp' },
  { label: 'Minecraft', value: '_minecraft._tcp' },
  { label: 'TeamSpeak', value: '_ts3._udp' },
  { label: 'Custom', value: 'custom' }
];

onMounted(() => {
  apiKey.value = localStorage.getItem('cf-api-key');
  if (!apiKey.value) {
    router.push('/login');
    return;
  }
  
  // Store zone ID in localStorage for compatibility with older pages
  localStorage.setItem('cf-zone-id', zoneId.value);
  
  getZone();
  getPresets();
});

const createDns = async () => {
  saving.value = 'progress';
  const bodyToSend = {
    apiKey: apiKey.value,
    currZone: zoneId.value,
  };
  
  // Basic validation
  if (dns.value.type === 'SRV') {
    if (!data.value.service || !data.value.proto || !data.value.name || !data.value.target) {
      const toast = useToast();
      toast.add({
        id: 'validation-error' + Date.now(),
        title: 'Validation Error',
        description: 'Please fill in all required SRV fields',
        icon: 'i-clarity-warning-solid',
        timeout: 3000,
        color: 'red',
      });
      saving.value = '';
      return;
    }
    
    // Convert numeric fields to numbers
    data.value.port = Number(data.value.port);
    data.value.weight = Number(data.value.weight || 10);
    data.value.priority = Number(data.value.priority || 1);
    
    bodyToSend.data = data.value;
  } else {
    if (!dns.value.name || !dns.value.content) {
      const toast = useToast();
      toast.add({
        id: 'validation-error' + Date.now(),
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        icon: 'i-clarity-warning-solid',
        timeout: 3000,
        color: 'red',
      });
      saving.value = '';
      return;
    }
    
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
        id: 'create-record-success' + Date.now(),
        title: 'Create success',
        description: 'Record created successfully',
        icon: 'i-clarity-check-circle-solid',
        timeout: 3000,
        color: 'green',
      });
      router.push(`/zones/${zoneId.value}/records`);
    } else {
      saving.value = 'error';
      console.error(data.errors[0].message);
      toast.add({
        id: 'create-record-error' + Date.now(),
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
      currZone: zoneId.value,
    }),
  });
  if (response.ok) {
    const data = await response.json();
    if (data.success) {
      zone.value = data.result;
      loading.value = false;
    } else {
      const toast = useToast();
      toast.add({
        id: 'get-zone-error' + Date.now(),
        title: 'Error',
        description: 'Failed to fetch zone information',
        icon: 'i-clarity-warning-solid',
        timeout: 3000,
        color: 'red',
      });
      router.push('/zones');
    }
  } else {
    console.error('HTTP-Error: ' + response.status);
    loading.value = false;
  }
};

const savePreset = () => {
  const preset = prompt('Enter a name for this preset');
  if (preset) {
    localStorage.setItem('cf-dns-preset-' + preset, JSON.stringify({
      ...dns.value,
      data: data.value
    }));
  }
  getPresets();
};

const loadPreset = (preset) => {
  const presetData = JSON.parse(localStorage.getItem('cf-dns-preset-' + preset));
  if (presetData) {
    if (presetData.data) {
      // If there's a data object in the preset, spread its properties into data.value
      data.value = { ...data.value, ...presetData.data };
      // Set SRV mode if needed
      if (presetData.type === 'SRV') {
        dns.value.type = 'SRV';
        detectServiceType();
      }
      // Remove the data property from presetData to avoid duplication
      const { data: _, ...rest } = presetData;
      dns.value = { ...dns.value, ...rest };
    } else {
      // Spread the remaining properties of presetData into dns.value
      dns.value = { ...dns.value, ...presetData };
    }
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

// Helper to load SRV presets
const loadSrvPreset = (serviceProto, portNumber) => {
  const [service, proto] = serviceProto.split('.');
  data.value.service = service;
  data.value.proto = proto.substring(1); // Remove leading underscore
  data.value.port = portNumber;
  data.value.priority = 1;
  data.value.weight = 10;
  srvSimpleService.value = serviceProto;
  updateSrvPreview();
};

// Update SRV fields from simple service selector
const updateSrvFromSimple = () => {
  if (srvSimpleService.value === 'custom') {
    advancedSrvMode.value = true;
    return;
  }
  
  const [service, proto] = srvSimpleService.value.split('.');
  data.value.service = service;
  data.value.proto = proto.substring(1); // Remove leading underscore
  updateSrvPreview();
};

// Update SRV preview
const updateSrvPreview = () => {
  // This function is called by input handlers to trigger reactivity
};

// Detect service type on load
const detectServiceType = () => {
  if (data.value.service && data.value.proto) {
    // Format with underscore for proper comparison
    const serviceProto = `${data.value.service}._${data.value.proto}`;
    
    // Special case for Minecraft which might be using _minecraft._tcp
    if (data.value.service === '_minecraft' && data.value.proto === 'tcp') {
      srvSimpleService.value = '_minecraft._tcp';
      return;
    }
    
    const found = commonServices.find(s => s.value === serviceProto);
    if (found) {
      srvSimpleService.value = found.value;
    } else {
      srvSimpleService.value = 'custom';
      advancedSrvMode.value = true;
    }
  }
};

// Get full SRV record name
const getSrvFullName = () => {
  if (!data.value.service || !data.value.proto || !data.value.name) return '';
  
  // Make sure we have the correct name for the SRV record
  let name = data.value.name;
  
  // If this is a Minecraft record and the name starts with 'mc.', remove the prefix
  // as it will be added by the service part
  if (data.value.service === '_minecraft' && data.value.proto === 'tcp' && name.startsWith('mc.')) {
    name = name.substring(3); // Remove 'mc.' prefix
  }
  
  // Always ensure both service and protocol have leading underscores
  const service = data.value.service.startsWith('_') ? data.value.service : `_${data.value.service}`;
  const proto = data.value.proto.startsWith('_') ? data.value.proto : `_${data.value.proto}`;
  
  return `${service}.${proto}.${name}`;
};

// Format SRV display name for better readability
const formatSrvDisplayName = () => {
  if (!data.value.service || !data.value.proto || !data.value.name) return '';
  
  // For display purposes, show a more user-friendly format that highlights the domain
  const domainPart = data.value.name;
  
  // Special case for Minecraft
  if (data.value.service === '_minecraft' && data.value.proto === 'tcp') {
    return `${domainPart} → ${data.value.target}:${data.value.port || '25565'}`;
  }
  
  // Strip leading underscores for display
  const cleanServicePart = `${data.value.service.replace(/_/g, '')}.${data.value.proto}`;
  return `${cleanServicePart}.${domainPart}`;
};
</script> 