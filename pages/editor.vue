<template>
  <div>
    <Head>
      <Title>Editor</Title>
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
        <Loader />
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
        <h1 class="mb-2 mt-6 text-center text-xl font-semibold">{{ dns.type === 'SRV' ? getSrvFullName() : dns.name }}</h1>
        <div
          class="m-4 flex w-full flex-col justify-center gap-4 rounded-xl border dark:border-gray-700 p-6 shadow-sm text-center md:w-3/4 lg:w-1/2"
        >
          <h2 class="mb-2 text-lg font-semibold flex items-center justify-center gap-2">
            <Icon :name="getRecordTypeIcon()" class="text-blue-500" /> Edit DNS Record
          </h2>
          <div class="mb-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-sm" v-if="dns.type">
            <div class="flex items-start">
              <UIcon name="i-heroicons-information-circle" class="mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p class="font-medium">{{ getDnsTypeDescription(dns.type) }}</p>
                <p class="mt-1">{{ getDnsTypeHelp(dns.type) }}</p>
              </div>
            </div>
          </div>
          <div class="mb-2 flex items-center justify-between" v-if="dns.type && dns.type !== 'SRV'">
            <label for="name" class="mr-2 w-24">Name:</label>
            <UInput id="name" v-model="dns.name" placeholder="Name (Required)" class="flex-grow" />
          </div>
          <div class="mb-2 flex items-center justify-between">
            <label for="type-select" class="mr-2 w-24">Type:</label>
            <USelect
              id="type-select"
              v-model="dns.type"
              class="type-select flex-grow uppercase"
              :options="['A', 'CNAME', 'MX', 'SRV', 'TXT']"
            />
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
                <label for="srv_name" class="mr-2 w-24">Name:</label>
                <UInput
                  id="srv_name"
                  type="text"
                  v-model="data.name"
                  placeholder="Hostname or subdomain"
                  class="flex-grow"
                  @update:modelValue="updateSrvPreview"
                  @keydown.enter="saveDns()"
                />
              </div>
              
              <div class="mb-2 flex items-center justify-between">
                <label for="srv_target" class="mr-2 w-24">Target:</label>
                <UInput
                  id="srv_target"
                  type="text"
                  v-model="data.target"
                  placeholder="Target hostname"
                  class="flex-grow"
                  @keydown.enter="saveDns()"
                />
              </div>
              
              <div class="mb-2 flex items-center justify-between">
                <label for="srv_port" class="mr-2 w-24">Port:</label>
                <UInput
                  id="srv_port"
                  type="number"
                  v-model="data.port"
                  placeholder="Port number"
                  class="flex-grow"
                  @keydown.enter="saveDns()"
                />
              </div>
              
              <div class="mb-2 flex items-center justify-between">
                <label for="srv_preview" class="mr-2 w-24">Full Name:</label>
                <UInput
                  id="srv_preview"
                  type="text"
                  :model-value="getSrvFullName()"
                  placeholder="Preview"
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
                  @keydown.enter="saveDns()"
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
                  @keydown.enter="saveDns()"
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
                  @keydown.enter="saveDns()"
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
                  @keydown.enter="saveDns()"
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
                  @keydown.enter="saveDns()"
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
                  @keydown.enter="saveDns()"
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
                  @keydown.enter="saveDns()"
                />
              </div>
              <div class="mb-2 flex items-center justify-between">
                <label for="srv_preview" class="mr-2 w-24">Full Name:</label>
                <UInput
                  id="srv_preview"
                  type="text"
                  :model-value="getSrvFullName()"
                  placeholder="Preview"
                  class="flex-grow text-gray-500"
                  disabled
                />
              </div>
            </div>
          </div>

          <div class="mb-2 flex items-center justify-between" v-if="dns.type && dns.type !== 'SRV'">
            <label
              @click="toggleEndpoint = !toggleEndpoint"
              for="endpoint"
              class="mr-2 w-24 cursor-pointer"
              @keydown.enter="saveDns()"
              >Endpoint:</label
            >
            <UInput
              @keydown.enter="saveDns()"
              v-if="!toggleEndpoint"
              id="endpoint"
              type="text"
              v-model="dns.content"
              placeholder="Endpoint"
              class="flex-grow"
            />
            <textarea
              @keydown.enter="saveDns()"
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
              id="ttl"
              type="text"
              v-model="dns.ttl"
              placeholder="TTL (Leave blank or set to 1 for auto TTL)"
              class="flex-grow"
              @keydown.enter="saveDns()"
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
              @keydown.enter="saveDns()"
            />
          </div>
          <div class="mb-2 flex items-center justify-start" v-if="dns.proxiable === true">
            <label for="proxied" class="mr-2 w-24">Proxied:</label>
            <UToggle id="proxied" v-model="dns.proxied" />
          </div>
          <div class="mb-2 flex items-center justify-between">
            <label for="comment" class="mr-2 w-24">Comment:</label>
            <UInput
              id="comment"
              type="text"
              v-model="dns.comment"
              placeholder="Comment"
              class="flex-grow"
              @keydown.enter="saveDns()"
            />
          </div>
          <div class="flex justify-center gap-4">
            <UButton
              class="mt-4 px-6"
              color="green"
              variant="outline"
              :disabled="saving === 'progress'"
              :class="{ 'cursor-not-allowed bg-opacity-50': saving === 'progress' }"
              @click="saveDns"
              type="button"
              >Save</UButton
            >
            <UButton
              class="mt-4 px-6"
              color="red"
              variant="outline"
              @click="preDel(dns)"
              type="button"
              >Delete</UButton
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
const currDnsId = ref('');
const dns = ref({});
const data = ref({});
const loading = ref(true);
const saving = ref(false);
const toggleEndpoint = ref(false);
const router = useRouter();
const presets = ref([]);

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

const getDns = async () => {
  const response = await fetch('/api/dns_record', {
    method: 'POST',
    body: JSON.stringify({
      apiKey: apiKey.value,
      currZone: currZone.value,
      currDnsRecord: currDnsId.value,
    }),
  });
  if (response.ok) {
    const result = await response.json();
    dns.value = result.result || {};
    data.value = result.result.data || {};
    
    // Set up SRV mode and detect service type
    if (dns.value.type === 'SRV') {
      detectServiceType();
    }
    
    loading.value = false;
  } else {
    console.error('HTTP-Error: ' + response.status);
    loading.value = false;
  }
};

const saveDns = async () => {
  saving.value = 'progress';

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
    data.value.weight = Number(data.value.weight);
    data.value.priority = Number(data.value.priority);
  } else if (!dns.value.name || !dns.value.content) {
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

  const bodyToSend = {
    apiKey: apiKey.value,
    currZone: currZone.value,
    currDnsRecord: currDnsId.value,
    dns: dns.value,
  };
  if (dns.value.type === 'SRV') {
    bodyToSend.dns.data = data.value;
    bodyToSend.dns.name = getSrvFullName();
  }
  const response = await fetch('/api/update_record', {
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
        title: 'Update success',
        description: 'Record updated successfully',
        icon: 'i-clarity-check-circle-solid',
        timeout: 3000,
        color: 'green',
      });
      setTimeout(() => {
        saving.value = '';
      }, 3000);
    } else {
      saving.value = 'error';
      console.error(data.errors[0].message);
      toast.add({
        id: 'update-record-error' + Date.now(),
        title: 'Update failed',
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
    if (data.success) {
      router.push('/records');
      toast.add({
        id: 'delete-record-success' + Date.now(),
        title: 'Delete success',
        description: 'Record deleted successfully',
        icon: 'i-clarity-check-circle-solid',
        timeout: 3000,
        color: 'green',
      });
    }
  } else {
    console.error('HTTP-Error: ' + response.status);
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
    dns.value = { ...dns.value, ...presetData };
  } else {
    console.error('Preset not found:', preset);
  }
};

const delPreset = (preset) => {
  localStorage.removeItem('cf-dns-preset-' + preset);
  getPresets();
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

const getSrvFullName = () => {
  if (!data.value.service || !data.value.proto || !data.value.name) return '';
  return `${data.value.service}.${data.value.proto}.${data.value.name}`;
};

// Add function to get icon based on record type
const getRecordTypeIcon = () => {
  const iconMap = {
    'A': 'mdi:alpha-a-circle',
    'CNAME': 'mdi:alpha-c-circle',
    'MX': 'mdi:email',
    'SRV': 'mdi:server',
    'TXT': 'mdi:text-box'
  };
  return iconMap[dns.value.type] || 'mdi:dns';
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
  // Function called by input updates to trigger reactivity
};

// Detect service type on load
const detectServiceType = () => {
  if (data.value.service && data.value.proto) {
    const serviceProto = `${data.value.service}._${data.value.proto}`;
    const found = commonServices.find(s => s.value === serviceProto);
    if (found) {
      srvSimpleService.value = found.value;
    } else {
      srvSimpleService.value = 'custom';
      advancedSrvMode.value = true;
    }
  }
};

// Add DNS type descriptions
const getDnsTypeDescription = (type) => {
  const descriptions = {
    'A': 'A Record: Maps a domain to an IPv4 address',
    'AAAA': 'AAAA Record: Maps a domain to an IPv6 address',
    'CNAME': 'CNAME Record: Creates an alias pointing to another domain',
    'MX': 'MX Record: Directs email to a mail server',
    'SRV': 'SRV Record: Maps services to specific servers and ports',
    'TXT': 'TXT Record: Stores text information for verification or other purposes'
  };
  return descriptions[type] || `${type} Record`;
};

// Add DNS type help text
const getDnsTypeHelp = (type) => {
  const help = {
    'A': 'Enter an IPv4 address like 192.168.1.1 in the Endpoint field.',
    'AAAA': 'Enter an IPv6 address in the Endpoint field.',
    'CNAME': 'Enter a domain name that this domain should point to.',
    'MX': 'Enter a mail server hostname and set the Priority (lower numbers have higher priority).',
    'SRV': 'Configure service location by specifying service, protocol, target server and port.',
    'TXT': 'Enter verification codes or other text-based information.'
  };
  return help[type] || 'Configure your DNS record settings below.';
};

onMounted(() => {
  apiKey.value = localStorage.getItem('cf-api-key');
  if (!apiKey.value) {
    router.push('/login');
    return;
  }
  
  // Redirect to the new zone-based structure
  if (localStorage.getItem('cf-zone-id') && localStorage.getItem('cf-dns-id')) {
    const zoneId = localStorage.getItem('cf-zone-id');
    const recordId = localStorage.getItem('cf-dns-id');
    router.push(`/zones/${zoneId}/records/${recordId}`);
  } else if (localStorage.getItem('cf-zone-id')) {
    const zoneId = localStorage.getItem('cf-zone-id');
    router.push(`/zones/${zoneId}/records`);
  } else {
    router.push('/zones');
  }
});
</script>
