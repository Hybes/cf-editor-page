<template>
	<div>
		<Head>
			<Title>New</Title>
		</Head>
		<div class="w-full">
			<UButton
				class="absolute top-4 left-8"
				variant="outline"
				icon="i-clarity-undo-line"
				to="/records"
				@click="clearDns()"
			>
				Back
			</UButton>
			<Loader
				v-if="loading && !appBootLoading"
				fullscreen
				title="Preparing record creation"
				subtitle="Fetching zone details from Cloudflare…"
			/>
			<div v-else-if="!loading" class="flex flex-col items-center">
				<div class="mt-4 flex gap-4">
					<UButton v-for="p in presets" :key="p" variant="outline" color="warning" @click="loadPreset(p)"
						>{{ p }}<span @click="delPreset(p)"><Icon name="mdi:delete" /></span
					></UButton>
					<UButton variant="outline" color="primary" @click="savePreset">Save Preset</UButton>
				</div>
				<h1 class="mt-6 mb-2 text-center text-lg font-semibold">{{ dns.name }}</h1>
				<div
					class="full:w-1/2 m-4 flex w-full flex-col justify-center gap-4 rounded-sm p-4 text-center md:w-3/4"
				>
					<h2 class="mb-4 text-lg font-semibold">
						Creating DNS Record for <span class="text-blue-300">{{ zone.name }}</span>
					</h2>
					<div class="mb-4 rounded-lg bg-blue-50 p-4 text-sm dark:bg-blue-900/20">
						<div class="flex items-start">
							<UIcon name="i-heroicons-information-circle" class="mt-0.5 mr-2 shrink-0" />
							<div>
								<p class="font-medium">DNS Record Types:</p>
								<ul class="mt-1 list-inside list-disc space-y-1">
									<li>
										<span class="font-medium">A</span>: Maps a domain to an IPv4 address (e.g.,
										192.168.1.1)
									</li>
									<li>
										<span class="font-medium">CNAME</span>: Creates an alias pointing to another
										domain
									</li>
									<li><span class="font-medium">MX</span>: Directs email to a mail server</li>
									<li>
										<span class="font-medium">TXT</span>: Stores text information (often for
										verification)
									</li>
									<li>
										<span class="font-medium">SRV</span>: Maps services to specific servers and
										ports
									</li>
								</ul>
							</div>
						</div>
					</div>
					<div v-if="dns?.type !== 'SRV'" class="mb-2 flex items-center justify-between">
						<label for="name" class="mr-2 w-24">Name:</label>
						<UInput
							id="name"
							v-model="dns.name"
							type="text"
							placeholder="Name (Required)"
							class="grow"
							@keydown.enter="createDns()"
						/>
					</div>
					<div class="mb-2 flex items-center justify-between">
						<label for="type-select" class="mr-2 w-24">Type:</label>
						<USelect
							id="type-select"
							v-model="dns.type"
							class="type-select grow uppercase"
							:items="['A', 'CNAME', 'MX', 'SRV', 'TXT']"
						>
						</USelect>
					</div>
					<div v-if="dns?.type === 'SRV'" class="flex w-full flex-col justify-center gap-4">
						<div class="mb-4 flex items-center justify-center">
							<USwitch v-model="advancedSrvMode" class="mr-2" />
							<label class="cursor-pointer text-sm" @click="advancedSrvMode = !advancedSrvMode">
								{{ advancedSrvMode ? 'Switch to Simple Mode' : 'Switch to Advanced Mode' }}
							</label>
						</div>

						<div v-if="!advancedSrvMode">
							<div class="mb-4 rounded-lg bg-blue-50 p-4 text-sm dark:bg-blue-900/20">
								<p class="mb-2 font-medium">Quick Service Setup</p>
								<div class="mb-4 flex flex-wrap gap-2">
									<UButton
										size="xs"
										variant="soft"
										color="primary"
										@click="loadSrvPreset('_sip._tcp', 5060)"
										>SIP</UButton
									>
									<UButton
										size="xs"
										variant="soft"
										color="primary"
										@click="loadSrvPreset('_xmpp-server._tcp', 5269)"
										>XMPP</UButton
									>
									<UButton
										size="xs"
										variant="soft"
										color="primary"
										@click="loadSrvPreset('_ldap._tcp', 389)"
										>LDAP</UButton
									>
									<UButton
										size="xs"
										variant="soft"
										color="primary"
										@click="loadSrvPreset('_imap._tcp', 143)"
										>IMAP</UButton
									>
									<UButton
										size="xs"
										variant="soft"
										color="primary"
										@click="loadSrvPreset('_smtp._tcp', 25)"
										>SMTP</UButton
									>
								</div>
							</div>

							<div class="mb-2 flex items-center justify-between">
								<label for="srv_simple_service" class="mr-2 w-24">Service:</label>
								<USelect
									id="srv_simple_service"
									v-model="srvSimpleService"
									class="grow"
									:items="commonServices"
									@update:model-value="updateSrvFromSimple"
								/>
							</div>

							<div class="mb-2 flex items-center justify-between">
								<label for="srv_simple_name" class="mr-2 w-24">Name:</label>
								<UInput
									id="srv_simple_name"
									v-model="data.name"
									type="text"
									placeholder="Hostname or subdomain"
									class="grow"
									@update:model-value="updateSrvPreview"
								/>
							</div>

							<div class="mb-2 flex items-center justify-between">
								<label for="srv_simple_target" class="mr-2 w-24">Target:</label>
								<UInput
									id="srv_simple_target"
									v-model="data.target"
									type="text"
									placeholder="Target hostname"
									class="grow"
								/>
							</div>

							<div class="mb-2 flex items-center justify-between">
								<label for="srv_simple_port" class="mr-2 w-24">Port:</label>
								<UInput
									id="srv_simple_port"
									v-model="data.port"
									type="number"
									placeholder="Port number"
									class="grow"
								/>
							</div>

							<div class="mb-2 flex items-center justify-between">
								<label for="srv_preview" class="mr-2 w-24">Full Name:</label>
								<UInput
									id="srv_preview"
									type="text"
									:model-value="getSrvFullName()"
									placeholder="Preview"
									class="grow text-gray-500"
									disabled
								/>
							</div>

							<div class="mt-2 rounded-lg bg-gray-50 p-4 text-sm dark:bg-gray-900/20">
								<p class="flex items-center">
									<UIcon name="i-heroicons-information-circle" class="mr-2" />
									Priority: {{ data.priority || 1 }} | Weight: {{ data.weight || 10 }}
									<UButton variant="link" class="ml-auto" @click="advancedSrvMode = true"
										>Edit</UButton
									>
								</p>
							</div>
						</div>

						<div v-else>
							<div class="mb-2 flex items-center justify-between">
								<label for="srv_name" class="mr-2 w-24">Name:</label>
								<UInput
									id="srv_name"
									v-model="data.name"
									type="text"
									placeholder="Name"
									class="grow"
									@update:model-value="updateSrvPreview"
								/>
							</div>
							<div class="mb-2 flex items-center justify-between">
								<label for="srv_service" class="mr-2 w-24">Service:</label>
								<UInput
									id="srv_service"
									v-model="data.service"
									type="text"
									placeholder="Service"
									class="grow"
									@update:model-value="updateSrvPreview"
								/>
							</div>
							<div class="mb-2 flex items-center justify-between">
								<label for="srv_proto" class="mr-2 w-24">Proto:</label>
								<UInput
									id="srv_proto"
									v-model="data.proto"
									type="text"
									placeholder="Proto"
									class="grow"
									@update:model-value="updateSrvPreview"
								/>
							</div>
							<div class="mb-2 flex items-center justify-between">
								<label for="srv_target" class="mr-2 w-24">Target:</label>
								<UInput
									id="srv_target"
									v-model="data.target"
									type="text"
									placeholder="Target"
									class="grow"
								/>
							</div>
							<div class="mb-2 flex items-center justify-between">
								<label for="srv_port" class="mr-2 w-24">Port:</label>
								<UInput
									id="srv_port"
									v-model="data.port"
									type="number"
									placeholder="Port"
									class="grow"
								/>
							</div>
							<div class="mb-2 flex items-center justify-between">
								<label for="srv_priority" class="mr-2 w-24">Priority:</label>
								<UInput
									id="srv_priority"
									v-model="data.priority"
									type="number"
									placeholder="Priority"
									class="grow"
								/>
							</div>
							<div class="mb-2 flex items-center justify-between">
								<label for="srv_weight" class="mr-2 w-24">Weight:</label>
								<UInput
									id="srv_weight"
									v-model="data.weight"
									type="number"
									placeholder="Weight"
									class="grow"
								/>
							</div>
							<div class="mb-2 flex items-center justify-between">
								<label for="srv_preview" class="mr-2 w-24">Full Name:</label>
								<UInput
									id="srv_preview"
									type="text"
									:model-value="getSrvFullName()"
									placeholder="Preview"
									class="grow text-gray-500"
									disabled
								/>
							</div>
						</div>
					</div>
					<div v-if="dns?.type !== 'SRV'" class="mb-2 flex items-center justify-between">
						<label for="endpoint" class="mr-2 w-24 cursor-pointer" @click="toggleEndpoint = !toggleEndpoint"
							>Endpoint:</label
						>
						<UInput
							v-if="!toggleEndpoint"
							id="endpoint"
							v-model="dns.content"
							type="text"
							placeholder="Endpoint"
							class="grow"
							@keydown.enter="createDns()"
						/>
						<textarea
							v-else
							id="endpoint"
							v-model="dns.content"
							placeholder="Endpoint"
							class="grow"
							@keydown.enter="createDns()"
						></textarea>
					</div>
					<div class="mb-2 flex items-center justify-between">
						<label for="ttl" class="mr-2 w-24">TTL:</label>
						<UInput
							id="ttl"
							v-model="dns.ttl"
							type="text"
							placeholder="TTL (Leave blank or set to 1 for auto TTL)"
							class="grow"
							@keydown.enter="createDns()"
						/>
					</div>
					<div v-if="dns.type === 'SRV' || dns.type === 'MX'" class="mb-2 flex items-center justify-between">
						<label for="priority" class="mr-2 w-24">Priority:</label>
						<UInput id="priority" v-model="dns.priority" type="text" placeholder="Priority" class="grow" />
					</div>
					<div v-if="dns?.type === 'A' || dns?.type === 'CNAME'" class="mb-2 flex items-center justify-start">
						<label for="proxied" class="mr-2 w-24">Proxied:</label>
						<USwitch id="proxied" v-model="dns.proxied" @keydown.enter="createDns()" />
					</div>
					<div class="mb-2 flex items-center justify-between">
						<label for="comment" class="mr-2 w-24">Comment:</label>
						<UInput
							id="comment"
							v-model="dns.comment"
							type="text"
							placeholder="Comment"
							class="grow"
							@keydown.enter="createDns()"
						/>
					</div>
					<div>
						<UButton
							class="mt-4 px-6"
							color="success"
							variant="outline"
							:disabled="saving === 'progress'"
							:class="{ 'bg-opacity-50 cursor-not-allowed': saving === 'progress' }"
							type="button"
							@click="createDns()"
							>Create</UButton
						>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
const appBootLoading = useState('appBootLoading')
const apiKey = ref('')
const currZone = ref('')
const dns = ref({
	name: '',
	type: 'CNAME',
	content: '',
	ttl: '',
	proxied: false,
	comment: ''
})
const data = ref({})
const loading = ref(true)
const saving = ref('')
const toggleEndpoint = ref(false)
const router = useRouter()
const zone = ref([])
const presets = ref([])

// For SRV records
const advancedSrvMode = ref(false)
const srvSimpleService = ref('')

const commonServices = [
	{ label: 'SIP (Voice/Video)', value: '_sip._tcp' },
	{ label: 'XMPP (Chat)', value: '_xmpp-server._tcp' },
	{ label: 'LDAP (Directory)', value: '_ldap._tcp' },
	{ label: 'IMAP (Email)', value: '_imap._tcp' },
	{ label: 'SMTP (Email)', value: '_smtp._tcp' },
	{ label: 'Minecraft', value: '_minecraft._tcp' },
	{ label: 'TeamSpeak', value: '_ts3._udp' },
	{ label: 'Custom', value: 'custom' }
]

onMounted(() => {
	apiKey.value = localStorage.getItem('cf-api-key')
	if (!apiKey.value) {
		router.push('/login')
		return
	}

	// Redirect to the new zone-based structure
	if (localStorage.getItem('cf-zone-id')) {
		const zoneId = localStorage.getItem('cf-zone-id')
		router.push(`/zones/${zoneId}/records/create`)
	} else {
		router.push('/zones')
	}
})

const createDns = async () => {
	saving.value = 'progress'
	const bodyToSend = {
		apiKey: apiKey.value,
		currZone: currZone.value
	}
	if (dns.value.type === 'SRV') {
		bodyToSend.data = data.value
	} else {
		bodyToSend.dns = dns.value
	}
	const response = await fetch('/api/create_record', {
		method: 'POST',
		body: JSON.stringify(bodyToSend)
	})
	if (response.ok) {
		const data = await response.json()
		const toast = useToast()
		if (data.success === true) {
			saving.value = 'success'
			toast.add({
				id: 'update-record-success' + Date.now(),
				title: 'Create success',
				description: 'Record created successfully',
				icon: 'i-clarity-check-circle-solid',
				duration: 3000,
				color: 'success'
			})
			router.push('/records')
		} else {
			saving.value = 'error'
			console.error(data.errors[0].message)
			toast.add({
				id: 'update-record-error' + Date.now(),
				title: 'Create failed',
				description: data.errors[0].message,
				icon: 'i-clarity-warning-solid',
				duration: 3000,
				color: 'error'
			})
			setTimeout(() => {
				saving.value = ''
			}, 3000)
		}
	} else {
		console.error('HTTP-Error: ' + response.status)
		saving.value = 'error'
		setTimeout(() => {
			saving.value = ''
		}, 3000)
	}
}

const savePreset = () => {
	const preset = prompt('Enter a name for this preset')
	if (preset) {
		const {
			created_on: _created_on,
			id: _id,
			locked: _locked,
			meta: _meta,
			modified_on: _modified_on,
			zone_id: _zone_id,
			zone_name: _zone_name,
			name: _name,
			...rest
		} = dns.value
		localStorage.setItem('cf-dns-preset-' + preset, JSON.stringify(rest))
	}
	getPresets()
}

const loadPreset = (preset) => {
	const presetData = JSON.parse(localStorage.getItem('cf-dns-preset-' + preset))
	if (presetData) {
		if (presetData.data) {
			// If there's a data object in the preset, spread its properties into data.value
			data.value = { ...data.value, ...presetData.data }
			// Remove the data property from presetData to avoid duplication
			delete presetData.data
		}
		// Spread the remaining properties of presetData into dns.value
		dns.value = { ...dns.value, ...presetData }
	} else {
		console.error('Preset not found:', preset)
	}
}

const delPreset = (preset) => {
	localStorage.removeItem('cf-dns-preset-' + preset)
	getPresets()
}

const getPresets = () => {
	presets.value = [] // Clear the presets array first
	const seen = new Set()
	for (let i = 0; i < localStorage.length; i++) {
		const key = localStorage.key(i)
		if (key.includes('cf-dns-preset-')) {
			const preset = key.replace('cf-dns-preset-', '')
			if (!seen.has(preset)) {
				seen.add(preset)
				presets.value.push(preset)
			}
		}
	}
}

const clearDns = () => {
	localStorage.removeItem('cf-dns-id')
	localStorage.removeItem('cf-dns-name')
}

// Helper to load SRV presets
const loadSrvPreset = (serviceProto, portNumber) => {
	const [service, proto] = serviceProto.split('.')
	data.value.service = service
	data.value.proto = proto.substring(1) // Remove leading underscore
	data.value.port = portNumber
	data.value.priority = 1
	data.value.weight = 10
	srvSimpleService.value = serviceProto
	updateSrvPreview()
}

// Update SRV fields from simple service selector
const updateSrvFromSimple = () => {
	if (srvSimpleService.value === 'custom') {
		advancedSrvMode.value = true
		return
	}

	const [service, proto] = srvSimpleService.value.split('.')
	data.value.service = service
	data.value.proto = proto.substring(1) // Remove leading underscore
	updateSrvPreview()
}

// Update SRV preview
const updateSrvPreview = () => {
	// This will be used by the getSrvFullName function
}

// Get full SRV record name
const getSrvFullName = () => {
	if (!data.value.service || !data.value.proto || !data.value.name) return ''
	return `${data.value.service}.${data.value.proto}.${data.value.name}`
}
</script>
