<template>
	<div>
		<div class="w-full">
			<UButton class="absolute top-4 left-8" variant="outline" icon="i-clarity-undo-line" @click="goBack">
				Back
			</UButton>
			<Loader
				v-if="loading && !appBootLoading"
				fullscreen
				title="Preparing record creation"
				subtitle="Fetching zone details from Cloudflare…"
			/>
			<div v-else-if="!loading" class="mb-20 flex flex-col items-center">
				<div class="mt-4 flex flex-wrap justify-center gap-4">
					<UButton
						v-for="(p, index) in presets"
						:key="index"
						variant="outline"
						color="warning"
						class="flex items-center gap-2"
						@click="loadPreset(p)"
						>{{ p }}
						<UTooltip text="Delete preset">
							<span class="rounded-full p-1 hover:bg-red-100" @click.stop="delPreset(p)">
								<Icon name="mdi:delete" />
							</span>
						</UTooltip>
					</UButton>
					<UButton variant="outline" color="primary" icon="i-heroicons-bookmark" @click="savePreset"
						>Save Preset</UButton
					>
				</div>
				<h1 class="mt-6 mb-2 text-center text-xl font-semibold">{{ zone.name }}</h1>
				<div
					class="dark:border-comet-700 m-4 flex w-full flex-col justify-center gap-4 rounded-xl border p-6 text-center shadow-xs md:w-3/4 lg:w-1/2"
				>
					<h2 class="mb-2 flex items-center justify-center gap-2 text-lg font-semibold">
						<Icon name="mdi:dns" class="text-blue-500" /> Create DNS Record
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
					<div v-if="dns.type !== 'SRV'" class="mb-2 flex items-center justify-between">
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
					<div v-if="dns.type === 'SRV'" class="flex w-full flex-col justify-center gap-4">
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
									<UButton
										size="xs"
										variant="soft"
										color="success"
										@click="loadSrvPreset('_minecraft._tcp', 25565)"
										>Minecraft</UButton
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
									:model-value="formatSrvDisplayName()"
									placeholder="Preview"
									class="text-comet-500 grow"
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
									class="text-comet-500 grow"
									disabled
								/>
							</div>

							<div class="bg-comet-50 dark:bg-comet-900/20 mt-2 rounded-lg p-4 text-sm">
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
									:model-value="formatSrvDisplayName()"
									placeholder="Preview"
									class="text-comet-500 grow"
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
									class="text-comet-500 grow"
									disabled
								/>
							</div>
						</div>
					</div>
					<div v-if="dns.type !== 'SRV'" class="mb-2 flex items-center justify-between">
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
					<div v-if="dns.type === 'A' || dns.type === 'CNAME'" class="mb-2 flex items-center justify-start">
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
const route = useRoute()
const router = useRouter()
const zoneId = computed(() => route.params.zone_id)
const apiKey = ref('')
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
const zone = ref({})
const presets = ref([])
const zoneRequestBody = computed(() => ({ apiKey: apiKey.value, currZone: zoneId.value }))
const markRecordsUpdated = () => {
	if (!zoneId.value) return
	localStorage.setItem(`cf-records-updated-${zoneId.value}`, String(Date.now()))
}
const {
	data: zoneData,
	error: zoneError,
	refresh: refreshZone
} = useFetch('/api/zone', {
	method: 'POST',
	body: zoneRequestBody,
	server: false,
	immediate: false
})

const seoZoneLabel = computed(() => zone.value?.name || zoneId.value || 'Zone')
useDynamicSeo({
	title: computed(() => `Create DNS Record — ${seoZoneLabel.value}`),
	description: computed(() => `Create a DNS record for ${seoZoneLabel.value}.`)
})

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

	// Store zone ID in localStorage for compatibility with older pages
	localStorage.setItem('cf-zone-id', zoneId.value)

	getZone()
	getPresets()
})

const createDns = async () => {
	saving.value = 'progress'
	const bodyToSend = {
		apiKey: apiKey.value,
		currZone: zoneId.value
	}

	// Basic validation
	if (dns.value.type === 'SRV') {
		if (!data.value.service || !data.value.proto || !data.value.name || !data.value.target) {
			const toast = useToast()
			toast.add({
				id: 'validation-error' + Date.now(),
				title: 'Validation Error',
				description: 'Please fill in all required SRV fields',
				icon: 'i-clarity-warning-solid',
				duration: 3000,
				color: 'error'
			})
			saving.value = ''
			return
		}

		// Convert numeric fields to numbers
		data.value.port = Number(data.value.port)
		data.value.weight = Number(data.value.weight || 10)
		data.value.priority = Number(data.value.priority || 1)

		bodyToSend.data = data.value
	} else {
		if (!dns.value.name || !dns.value.content) {
			const toast = useToast()
			toast.add({
				id: 'validation-error' + Date.now(),
				title: 'Validation Error',
				description: 'Please fill in all required fields',
				icon: 'i-clarity-warning-solid',
				duration: 3000,
				color: 'error'
			})
			saving.value = ''
			return
		}

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
				id: 'create-record-success' + Date.now(),
				title: 'Create success',
				description: 'Record created successfully',
				icon: 'i-clarity-check-circle-solid',
				duration: 3000,
				color: 'success'
			})
			markRecordsUpdated()
			router.push(`/zones/${zoneId.value}/records`)
		} else {
			saving.value = 'error'
			console.error(data.errors[0].message)
			toast.add({
				id: 'create-record-error' + Date.now(),
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

const getZone = async () => {
	try {
		await refreshZone()
		if (zoneError.value) throw zoneError.value
		const data = zoneData.value
		if (data?.success) {
			zone.value = data.result
			loading.value = false
			return
		}
		const toast = useToast()
		toast.add({
			id: 'get-zone-error' + Date.now(),
			title: 'Error',
			description: data?.errors?.[0]?.message || 'Failed to fetch zone information',
			icon: 'i-clarity-warning-solid',
			duration: 3000,
			color: 'error'
		})
		router.push('/zones')
	} catch (error) {
		console.error('HTTP-Error: ' + (error?.data?.statusCode || error?.statusCode || ''))
		loading.value = false
	}
}

const savePreset = () => {
	const preset = prompt('Enter a name for this preset')
	if (preset) {
		localStorage.setItem(
			'cf-dns-preset-' + preset,
			JSON.stringify({
				...dns.value,
				data: data.value
			})
		)
	}
	getPresets()
}

const loadPreset = (preset) => {
	const presetData = JSON.parse(localStorage.getItem('cf-dns-preset-' + preset))
	if (presetData) {
		if (presetData.data) {
			// If there's a data object in the preset, spread its properties into data.value
			data.value = { ...data.value, ...presetData.data }
			// Set SRV mode if needed
			if (presetData.type === 'SRV') {
				dns.value.type = 'SRV'
				detectServiceType()
			}
			// Remove the data property from presetData to avoid duplication
			const { data: _, ...rest } = presetData
			dns.value = { ...dns.value, ...rest }
		} else {
			// Spread the remaining properties of presetData into dns.value
			dns.value = { ...dns.value, ...presetData }
		}
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
	// This function is called by input handlers to trigger reactivity
}

// Detect service type on load
const detectServiceType = () => {
	if (data.value.service && data.value.proto) {
		// Format with underscore for proper comparison
		const serviceProto = `${data.value.service}._${data.value.proto}`

		// Special case for Minecraft which might be using _minecraft._tcp
		if (data.value.service === '_minecraft' && data.value.proto === 'tcp') {
			srvSimpleService.value = '_minecraft._tcp'
			return
		}

		const found = commonServices.find((s) => s.value === serviceProto)
		if (found) {
			srvSimpleService.value = found.value
		} else {
			srvSimpleService.value = 'custom'
			advancedSrvMode.value = true
		}
	}
}

// Get full SRV record name
const getSrvFullName = () => {
	if (!data.value.service || !data.value.proto || !data.value.name) return ''

	// Make sure we have the correct name for the SRV record
	let name = data.value.name

	// If this is a Minecraft record and the name starts with 'mc.', remove the prefix
	// as it will be added by the service part
	if (data.value.service === '_minecraft' && data.value.proto === 'tcp' && name.startsWith('mc.')) {
		name = name.substring(3) // Remove 'mc.' prefix
	}

	// Always ensure both service and protocol have leading underscores
	const service = data.value.service.startsWith('_') ? data.value.service : `_${data.value.service}`
	const proto = data.value.proto.startsWith('_') ? data.value.proto : `_${data.value.proto}`

	return `${service}.${proto}.${name}`
}

// Format SRV display name for better readability
const formatSrvDisplayName = () => {
	if (!data.value.service || !data.value.proto || !data.value.name) return ''

	// For display purposes, show a more user-friendly format that highlights the domain
	const domainPart = data.value.name

	// Special case for Minecraft
	if (data.value.service === '_minecraft' && data.value.proto === 'tcp') {
		return `${domainPart} → ${data.value.target}:${data.value.port || '25565'}`
	}

	// Strip leading underscores for display
	const cleanServicePart = `${data.value.service.replace(/_/g, '')}.${data.value.proto}`
	return `${cleanServicePart}.${domainPart}`
}

// Function to go back preserving filter state
const goBack = () => {
	// Check if we have return parameters
	if (route.query.return) {
		try {
			// Parse the stored query state
			const returnQuery = JSON.parse(decodeURIComponent(route.query.return))
			// Navigate back with the saved query
			router.push({
				path: `/zones/${zoneId.value}/records`,
				query: returnQuery
			})
		} catch {
			// If there's an error parsing, just go back without query params
			router.push(`/zones/${zoneId.value}/records`)
		}
	} else {
		// No return parameters, just go back
		router.push(`/zones/${zoneId.value}/records`)
	}
}
</script>
