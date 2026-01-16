<template>
	<div>
		<div class="w-full">
			<UButton class="absolute top-4 left-8" variant="outline" icon="i-clarity-undo-line" @click="goBack">
				Back
			</UButton>
			<Loader
				v-if="loading && !appBootLoading"
				fullscreen
				title="Loading DNS record"
				subtitle="Fetching record details from Cloudflare…"
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
				<h1 class="mt-6 mb-2 text-center text-xl font-semibold">
					{{ dns.type === 'SRV' ? formatSrvDisplayName() : dns.name }}
				</h1>
				<div
					class="dark:border-comet-700 m-4 flex w-full flex-col justify-center gap-4 rounded-xl border p-6 text-center shadow-xs md:w-3/4 lg:w-1/2"
				>
					<h2 class="mb-2 flex items-center justify-center gap-2 text-lg font-semibold">
						<Icon :name="getRecordTypeIcon()" class="text-blue-500" /> Edit DNS Record
					</h2>
					<div v-if="dns.type" class="mb-4 rounded-lg bg-blue-50 p-4 text-sm dark:bg-blue-900/20">
						<div class="flex items-start">
							<UIcon name="i-heroicons-information-circle" class="mt-0.5 mr-2 shrink-0" />
							<div>
								<p class="font-medium">{{ getDnsTypeDescription(dns.type) }}</p>
								<p class="mt-1">{{ getDnsTypeHelp(dns.type) }}</p>
							</div>
						</div>
					</div>
					<div v-if="dns.type && dns.type !== 'SRV'" class="mb-2 flex items-center justify-between">
						<label for="name" class="mr-2 w-24">Name:</label>
						<UInput id="name" v-model="dns.name" placeholder="Name (Required)" class="grow" />
					</div>
					<div class="mb-2 flex items-center justify-between">
						<label for="type-select" class="mr-2 w-24">Type:</label>
						<USelect
							id="type-select"
							v-model="dns.type"
							class="type-select grow uppercase"
							:items="['A', 'CNAME', 'MX', 'SRV', 'TXT']"
						/>
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
								<label for="srv_name" class="mr-2 w-24">Name:</label>
								<UInput
									id="srv_name"
									v-model="data.name"
									type="text"
									placeholder="Hostname or subdomain"
									class="grow"
									@update:model-value="updateSrvPreview"
									@keydown.enter="saveDns()"
								/>
							</div>

							<div class="mb-2 flex items-center justify-between">
								<label for="srv_target" class="mr-2 w-24">Target:</label>
								<UInput
									id="srv_target"
									v-model="data.target"
									type="text"
									placeholder="Target hostname"
									class="grow"
									@keydown.enter="saveDns()"
								/>
							</div>

							<div class="mb-2 flex items-center justify-between">
								<label for="srv_port" class="mr-2 w-24">Port:</label>
								<UInput
									id="srv_port"
									v-model="data.port"
									type="number"
									placeholder="Port number"
									class="grow"
									@keydown.enter="saveDns()"
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
									@keydown.enter="saveDns()"
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
									@keydown.enter="saveDns()"
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
									@keydown.enter="saveDns()"
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
									@keydown.enter="saveDns()"
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
									@keydown.enter="saveDns()"
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
									@keydown.enter="saveDns()"
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
									@keydown.enter="saveDns()"
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
						</div>
					</div>

					<div v-if="dns.type && dns.type !== 'SRV'" class="mb-2 flex items-center justify-between">
						<label
							for="endpoint"
							class="mr-2 w-24 cursor-pointer"
							@click="toggleEndpoint = !toggleEndpoint"
							@keydown.enter="saveDns()"
							>Endpoint:</label
						>
						<UInput
							v-if="!toggleEndpoint"
							id="endpoint"
							v-model="dns.content"
							type="text"
							placeholder="Endpoint"
							class="grow"
							@keydown.enter="saveDns()"
						/>
						<textarea
							v-else
							id="endpoint"
							v-model="dns.content"
							placeholder="Endpoint"
							class="grow"
							@keydown.enter="saveDns()"
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
							@keydown.enter="saveDns()"
						/>
					</div>
					<div v-if="dns.type === 'SRV' || dns.type === 'MX'" class="mb-2 flex items-center justify-between">
						<label for="priority" class="mr-2 w-24">Priority:</label>
						<UInput
							id="priority"
							v-model="dns.priority"
							type="text"
							placeholder="Priority"
							class="grow"
							@keydown.enter="saveDns()"
						/>
					</div>
					<div v-if="dns.proxiable === true" class="mb-2 flex items-center justify-start">
						<label for="proxied" class="mr-2 w-24">Proxied:</label>
						<USwitch id="proxied" v-model="dns.proxied" />
					</div>
					<div class="mb-2 flex items-center justify-between">
						<label for="comment" class="mr-2 w-24">Comment:</label>
						<UInput
							id="comment"
							v-model="dns.comment"
							type="text"
							placeholder="Comment"
							class="grow"
							@keydown.enter="saveDns()"
						/>
					</div>
					<div class="flex justify-center gap-4">
						<UButton
							class="mt-4 px-6"
							color="success"
							variant="outline"
							:disabled="saving === 'progress'"
							:class="{ 'bg-opacity-50 cursor-not-allowed': saving === 'progress' }"
							type="button"
							@click="saveDns"
							>Save</UButton
						>
						<UButton
							class="mt-4 px-6"
							color="error"
							variant="outline"
							type="button"
							@click="openDeleteModal"
							>Delete</UButton
						>
					</div>
				</div>
			</div>
			<UModal v-model:open="deleteModalOpen">
				<template #content>
					<UCard>
						<template #header>
							<div class="flex items-center gap-2">
								<UIcon name="i-heroicons-exclamation-triangle" class="h-5 w-5 text-red-500" />
								<span class="text-lg font-semibold">Delete record</span>
							</div>
						</template>
						<div class="space-y-4">
							<p class="text-sm text-stone-600 dark:text-stone-300">
								This will permanently delete
								<span class="font-semibold">{{ deleteLabel }}</span>
								from
								<span class="font-semibold">{{ dns.zone_name || zoneId }}</span
								>.
							</p>
							<p class="text-xs text-stone-500 dark:text-stone-400">This action cannot be undone.</p>
						</div>
						<template #footer>
							<div class="flex justify-end gap-3">
								<UButton color="neutral" variant="ghost" @click="closeDeleteModal">Cancel</UButton>
								<UButton color="error" :loading="deleteLoading" @click="confirmDelete">Delete</UButton>
							</div>
						</template>
					</UCard>
				</template>
			</UModal>
		</div>
	</div>
</template>

<script setup>
const appBootLoading = useState('appBootLoading')
const route = useRoute()
const router = useRouter()
const zoneId = computed(() => route.params.zone_id)
const recordId = computed(() => route.params.record_id)

const apiKey = ref('')
const dns = ref({})
const data = ref({})
const loading = ref(true)
const saving = ref('')
const toggleEndpoint = ref(false)
const presets = ref([])
const deleteModalOpen = ref(false)
const deleteLoading = ref(false)
const dnsRequestBody = computed(() => ({
	apiKey: apiKey.value,
	currZone: zoneId.value,
	currDnsRecord: recordId.value
}))
const {
	data: dnsRecordData,
	error: dnsRecordError,
	refresh: refreshDnsRecord
} = useFetch('/api/dns_record', {
	method: 'POST',
	body: dnsRequestBody,
	server: false,
	immediate: false
})

const seoZoneLabel = computed(() => dns.value?.zone_name || zoneId.value || 'Zone')
const seoRecordLabel = computed(() => {
	if (dns.value?.type === 'SRV') {
		if (data.value?.service && data.value?.proto && data.value?.name) {
			const svc = `${String(data.value.service).replace(/_/g, '')}.${data.value.proto}`
			return `${svc}.${data.value.name}`
		}
	}
	return dns.value?.name || recordId.value || 'DNS Record'
})

useDynamicSeo({
	title: computed(() => `Edit ${seoRecordLabel.value} — ${seoZoneLabel.value}`),
	description: computed(() => `Edit DNS record ${seoRecordLabel.value} in ${seoZoneLabel.value}.`)
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

const getDns = async () => {
	try {
		await refreshDnsRecord()
		if (dnsRecordError.value) throw dnsRecordError.value
		const result = dnsRecordData.value
		dns.value = result?.result || {}
		data.value = result?.result?.data || {}

		if (dns.value.type === 'SRV') {
			detectServiceType()
		}

		loading.value = false
	} catch (error) {
		console.error('HTTP-Error: ' + (error?.data?.statusCode || error?.statusCode || ''))
		loading.value = false
		const toast = useToast()
		const message = error?.data?.statusMessage || error?.statusMessage || 'Failed to fetch DNS record'
		toast.add({
			id: 'get-record-error' + Date.now(),
			title: 'Error',
			description: message,
			icon: 'i-clarity-warning-solid',
			duration: 3000,
			color: 'error'
		})
		router.push(`/zones/${zoneId.value}/records`)
	}
}

const saveDns = async () => {
	saving.value = 'progress'

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
		data.value.weight = Number(data.value.weight)
		data.value.priority = Number(data.value.priority)
	} else if (!dns.value.name || !dns.value.content) {
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

	const bodyToSend = {
		apiKey: apiKey.value,
		currZone: zoneId.value,
		currDnsRecord: recordId.value,
		dns: dns.value
	}

	if (dns.value.type === 'SRV') {
		bodyToSend.dns.data = data.value

		// For SRV records, we need to construct the full name with service and protocol
		// But if it's an existing record with a properly formatted name, just use that
		if (
			dns.value.name &&
			dns.value.name.includes('._') &&
			dns.value.name.includes(data.value.service) &&
			dns.value.name.includes(`._${data.value.proto}`)
		) {
			// The name is already in correct format
			bodyToSend.dns.name = dns.value.name
		} else {
			// Generate the new name
			bodyToSend.dns.name = getSrvFullName()
		}
	}

	const response = await fetch('/api/update_record', {
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
				title: 'Update success',
				description: 'Record updated successfully',
				icon: 'i-clarity-check-circle-solid',
				duration: 3000,
				color: 'success'
			})
			setTimeout(() => {
				saving.value = ''
			}, 3000)
		} else {
			saving.value = 'error'
			console.error(data.errors[0].message)
			toast.add({
				id: 'update-record-error' + Date.now(),
				title: 'Update failed',
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

const delDns = async (record) => {
	const toast = useToast()
	const response = await fetch('/api/delete_record', {
		method: 'POST',
		body: JSON.stringify({
			apiKey: apiKey.value,
			currZone: zoneId.value,
			currDnsRecord: record.id
		})
	})
	if (response.ok) {
		const data = await response.json()
		if (data.success) {
			router.push(`/zones/${zoneId.value}/records`)
			toast.add({
				id: 'delete-record-success' + Date.now(),
				title: 'Delete success',
				description: 'Record deleted successfully',
				icon: 'i-clarity-check-circle-solid',
				duration: 3000,
				color: 'success'
			})
		}
	} else {
		console.error('HTTP-Error: ' + response.status)
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
		dns.value = { ...dns.value, ...presetData }
	} else {
		console.error('Preset not found:', preset)
	}
}

const delPreset = (preset) => {
	localStorage.removeItem('cf-dns-preset-' + preset)
	getPresets()
}

const deleteLabel = computed(() => {
	if (dns.value?.type === 'SRV') {
		return formatSrvDisplayName() || dns.value.name || recordId.value
	}
	return dns.value?.name || recordId.value
})

const openDeleteModal = () => {
	deleteModalOpen.value = true
}

const closeDeleteModal = () => {
	deleteModalOpen.value = false
}

const confirmDelete = async () => {
	deleteLoading.value = true
	await delDns(dns.value)
	deleteLoading.value = false
	closeDeleteModal()
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

const getSrvFullName = () => {
	// If this is an existing SRV record with a name that already has service and protocol parts,
	// just return the original name to avoid modifying it
	if (dns.value.name && dns.value.name.includes('._')) {
		return dns.value.name
	}

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

// Add function to get icon based on record type
const getRecordTypeIcon = () => {
	const iconMap = {
		A: 'mdi:alpha-a-circle',
		CNAME: 'mdi:alpha-c-circle',
		MX: 'mdi:email',
		SRV: 'mdi:server',
		TXT: 'mdi:text-box'
	}
	return iconMap[dns.value.type] || 'mdi:dns'
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
	// Function called by input updates to trigger reactivity
}

// Detect service type on load
const detectServiceType = () => {
	if (dns.value.type === 'SRV') {
		// Check if the record name is already in fully qualified format (_service._proto.name)
		if (dns.value.name && dns.value.name.includes('._')) {
			// Parse the full name format
			const parts = dns.value.name.split('.')

			// Extract service and protocol parts (with leading underscores)
			const serviceParts = parts.filter((p) => p.startsWith('_'))
			if (serviceParts.length >= 2) {
				// Store these in data.value for display
				data.value.service = serviceParts[0]
				data.value.proto = serviceParts[1].substring(1) // Remove leading underscore

				// Extract the domain part (everything else)
				const domainParts = parts.slice(serviceParts.length)
				data.value.name = domainParts.join('.')

				// Special case for Minecraft
				if (data.value.service === '_minecraft' && data.value.proto === 'tcp') {
					srvSimpleService.value = '_minecraft._tcp'
					return
				}

				// Find matching service in our common services
				const serviceProto = `${data.value.service}._${data.value.proto}`
				const found = commonServices.find((s) => s.value === serviceProto)
				if (found) {
					srvSimpleService.value = found.value
				} else {
					srvSimpleService.value = 'custom'
					advancedSrvMode.value = true
				}
			}
		} else if (data.value.service && data.value.proto) {
			// Already in separate fields format
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
}

// Add DNS type descriptions
const getDnsTypeDescription = (type) => {
	const descriptions = {
		A: 'A Record: Maps a domain to an IPv4 address',
		AAAA: 'AAAA Record: Maps a domain to an IPv6 address',
		CNAME: 'CNAME Record: Creates an alias pointing to another domain',
		MX: 'MX Record: Directs email to a mail server',
		SRV: 'SRV Record: Maps services to specific servers and ports',
		TXT: 'TXT Record: Stores text information for verification or other purposes'
	}
	return descriptions[type] || `${type} Record`
}

// Add DNS type help text
const getDnsTypeHelp = (type) => {
	const help = {
		A: 'Enter an IPv4 address like 192.168.1.1 in the Endpoint field.',
		AAAA: 'Enter an IPv6 address in the Endpoint field.',
		CNAME: 'Enter a domain name that this domain should point to.',
		MX: 'Enter a mail server hostname and set the Priority (lower numbers have higher priority).',
		SRV: 'Configure service location by specifying service, protocol, target server and port.',
		TXT: 'Enter verification codes or other text-based information.'
	}
	return help[type] || 'Configure your DNS record settings below.'
}

// Format SRV display name for the title
const formatSrvDisplayName = () => {
	if (!data.value.service || !data.value.proto || !data.value.name) return ''

	// For display purposes, show a more user-friendly format that highlights the domain
	const domainPart = data.value.name

	// Special case for Minecraft
	if (data.value.service === '_minecraft' && data.value.proto === 'tcp') {
		return `${domainPart} → ${data.value.target}:${data.value.port}`
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

onMounted(() => {
	apiKey.value = localStorage.getItem('cf-api-key')
	if (!apiKey.value) {
		router.push('/login')
		return
	}

	// Store in localStorage for compatibility with older pages
	localStorage.setItem('cf-zone-id', zoneId.value)
	localStorage.setItem('cf-dns-id', recordId.value)

	getDns()
	getPresets()
})
</script>
