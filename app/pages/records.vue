<template>
	<PageContainer>
		<Head>
			<Title>Records</Title>
		</Head>
		<div class="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
			<div class="flex flex-wrap items-center justify-center gap-3">
				<UButton variant="outline" icon="i-clarity-undo-line" to="/" @click="clearZone()">Back</UButton>
				<UButton to="/create" variant="outline" color="success" icon="i-clarity-plus-circle-solid">
					Create
				</UButton>
			</div>
			<div class="flex flex-wrap items-center justify-center gap-3">
				<ClientOnly>
					<UButton
						:icon="isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'"
						color="neutral"
						variant="outline"
						aria-label="Theme"
						@click="isDark = !isDark"
					/>
					<template #fallback>
						<div class="h-8 w-8" />
					</template>
				</ClientOnly>
				<UButton variant="outline" color="error" @click="resetConfig()">Logout</UButton>
			</div>
		</div>
			<div class="flex flex-col items-center justify-center gap-4">
				<div class="flex w-full flex-col justify-center gap-4">
					<div class="flex items-center justify-center gap-2">
						<NuxtLink
							:to="'http://' + currZoneName"
							external
							target="_blank"
							class="text-center text-2xl font-semibold text-stone-900 hover:underline dark:text-stone-100"
						>
							{{ currZoneName }}
						</NuxtLink>
						<div class="relative">
							<div class="cursor-pointer" @click="showDropdown = !showDropdown">
								<UIcon
									v-if="zone.ssl?.value === 'strict'"
									name="i-clarity-lock-solid"
									class="h-6 w-6"
								/>
								<UIcon v-if="zone.ssl?.value === 'full'" name="i-clarity-lock-line" class="h-6 w-6" />
								<UIcon
									v-if="zone.ssl?.value === 'flexible'"
									name="i-clarity-curve-chart-solid"
									class="h-6 w-6"
								/>
								<UIcon
									v-if="zone.ssl?.value === 'off'"
									name="i-clarity-no-access-solid"
									class="h-6 w-6"
								/>
							</div>
							<div
								v-if="showDropdown"
								class="absolute right-0 z-10 mt-2 w-48 rounded-sm border border-stone-600 bg-stone-300 shadow-lg dark:border-stone-400 dark:bg-stone-700"
							>
								<div
									class="flex cursor-pointer items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-stone-800"
									:class="{ 'bg-gray-200 dark:bg-gray-800': zone.ssl?.value === 'strict' }"
									@click="updateSslSetting('strict')"
								>
									<UIcon name="i-clarity-lock-solid" class="h-4 w-4" />
									Strict
								</div>
								<div class="border-t border-stone-400 dark:border-stone-600"></div>
								<div
									class="flex cursor-pointer items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-stone-800"
									:class="{ 'bg-gray-200 dark:bg-gray-800': zone.ssl?.value === 'full' }"
									@click="updateSslSetting('full')"
								>
									<UIcon name="i-clarity-lock-line" class="h-4 w-4" />
									Full
								</div>
								<div class="border-t border-stone-400 dark:border-stone-600"></div>
								<div
									class="flex cursor-pointer items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-stone-800"
									:class="{ 'bg-gray-200 dark:bg-gray-800': zone.ssl?.value === 'flexible' }"
									@click="updateSslSetting('flexible')"
								>
									<UIcon name="i-clarity-curve-chart-solid" class="h-4 w-4" />
									Flexible
								</div>
								<div class="border-t border-stone-400 dark:border-stone-600"></div>
								<div
									class="flex cursor-pointer items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-stone-800"
									:class="{ 'bg-gray-200 dark:bg-gray-800': zone.ssl?.value === 'off' }"
									@click="updateSslSetting('off')"
								>
									<UIcon name="i-clarity-no-access-solid" class="h-4 w-4" />
									Off
								</div>
							</div>
						</div>
					</div>
					<div class="flex translate-x-[12px] flex-wrap items-center justify-center gap-4">
						<div
							v-for="ns in zone.name_servers || []"
							:key="ns"
							class="group flex cursor-pointer items-center gap-4"
							@click="copyToClipboard(ns)"
						>
							<p class="font-bold text-stone-600 italic dark:text-stone-400">{{ ns }}</p>
							<UIcon name="i-clarity-clipboard-line" class="opacity-0 group-hover:opacity-100" />
						</div>
					</div>
				</div>
				<div class="flex w-full flex-col items-center justify-center gap-4">
					<div class="flex w-full flex-wrap items-center justify-between gap-4">
						<div class="flex w-full gap-4 md:w-[calc(50%-0.5rem)]">
							<USelectMenu
								v-model="selectedStatus"
								:items="dnsTypes"
								multiple
								placeholder="Type"
								class="min-w-24"
							/>
							<UInput
								ref="searchInput"
								v-model="searchQuery"
								icon="i-heroicons-magnifying-glass-20-solid"
								type="text"
								placeholder="Search"
								color="neutral"
								class="min-w-48 grow"
							/>
						</div>
						<div class="flex w-full gap-4 md:w-[calc(50%-0.5rem)]">
							<UDropdownMenu
								:items="
									columns.map((c) => ({
										label: c.header,
										type: 'checkbox',
										checked: columnVisibility[c.id] !== false,
										onUpdateChecked(checked) {
											columnVisibility[c.id] = checked
										},
										onSelect(e) {
											e.preventDefault()
										}
									}))
								"
								:content="{ align: 'end' }"
							>
								<UButton
									label="Columns"
									color="neutral"
									variant="outline"
									trailing-icon="i-heroicons-chevron-down-20-solid"
									class="grow md:grow-0"
								/>
							</UDropdownMenu>
							<UPagination v-model:page="page" :page-count="pageCount" :total="filteredRecords.length" />
						</div>
					</div>
					<UTable
						:data="rows"
						:columns="columns"
						:loading="loading"
						class="w-full rounded-lg border border-stone-300 dark:border-stone-700"
						v-model:column-visibility="columnVisibility"
						:ui="{
							tr: {
								base: 'cursor-pointer even:bg-stone-100 dark:even:bg-stone-950/50 hover:bg-stone-200 dark:hover:bg-stone-800'
							},
							td: {
								color: 'text-stone-700 dark:text-stone-200'
							}
						}"
						@select="onSelectRecord"
					>
						<template #type-cell="{ row }">
							<div class="flex items-center gap-2">
								<UBadge :color="getRecordTypeColor(row.original.type)" class="uppercase">
									{{ row.original.type }}
								</UBadge>
								<UTooltip
									v-if="row.original.type === 'SRV'"
									text="Service Record - Maps services to hostnames and ports"
								>
									<UIcon name="i-heroicons-question-mark-circle" class="h-4 w-4 text-gray-500" />
								</UTooltip>
							</div>
						</template>
						<template #name-cell="{ row }">
							<div
								class="group flex max-w-[120px] cursor-pointer items-center gap-2 overflow-hidden sm:max-w-[200px]"
								@click="setDns(row.original)"
							>
								<UIcon :name="getRecordTypeIcon(row.original.type)" class="h-4 w-4 text-gray-500" />
								<p class="truncate text-xs font-medium group-hover:underline md:text-sm">
									{{
										row.original.name === currZoneName || !row.original.name.endsWith(currZoneName)
											? row.original.name
											: row.original.name.slice(0, -currZoneName.length - 1)
									}}
								</p>
							</div>
						</template>
						<template #content-cell="{ row }">
							<div
								class="group flex max-w-[120px] items-center gap-4 overflow-hidden sm:max-w-[200px] md:max-w-[280px] lg:max-w-[360px]"
							>
								<p
									class="truncate text-xs font-medium group-hover:underline md:text-sm"
									@click="setDns(row.original)"
								>
									{{ formatContent(row.original) }}
								</p>
								<div v-if="row.original.proxiable" @click.stop>
									<USwitch
										v-model="row.original.proxied"
										color="warning"
										@update:model-value="() => updateProxyStatus(row.original)"
									/>
								</div>
							</div>
						</template>
						<template #created_on-cell="{ row }">
							<div
								v-if="isLargeScreen"
								class="flex max-w-[200px] items-center gap-4 truncate overflow-hidden text-xs md:text-sm"
							>
								<p class="truncate">{{ dayjs(row.original.created_on).format('DD/MM/YYYY') }}</p>
							</div>
						</template>
						<template #modified_on-cell="{ row }">
							<div
								v-if="isLargeScreen"
								class="flex max-w-[200px] items-center gap-4 truncate overflow-hidden text-xs md:text-sm"
							>
								<p class="truncate">{{ dayjs(row.original.modified_on).format('DD/MM/YYYY') }}</p>
							</div>
						</template>
						<template #actions-cell="{ row }">
							<UDropdownMenu :items="items(row.original)">
								<UButton
									color="neutral"
									variant="ghost"
									icon="i-heroicons-ellipsis-horizontal-20-solid"
									@click.stop
								/>
							</UDropdownMenu>
						</template>
					</UTable>
					<div class="flex w-full justify-end">
						<UPagination v-model:page="page" :page-count="pageCount" :total="filteredRecords.length" />
					</div>
				</div>
			</div>
	</PageContainer>
</template>

<script setup>
import dayjs from 'dayjs'
const apiKey = ref('')
const currZone = ref('')
const currZoneName = ref('')
const dnsRecords = ref([])
const zone = ref({})
const loading = ref(true)
const searchQuery = ref('')
const page = ref(1)
const pageCount = 25
const router = useRouter()
const selectedStatus = ref([])
const showDropdown = ref(false)

const updateProxyStatus = async (record) => {
	const toast = useToast()
	const response = await fetch('/api/update_record', {
		method: 'POST',
		body: JSON.stringify({
			apiKey: apiKey.value,
			currZone: currZone.value,
			currDnsRecord: record.id,
			dns: { ...record, proxied: record.proxied ? true : false }
		})
	})
	if (response.ok) {
		const data = await response.json()
		if (data.success) {
			toast.add({
				id: 'update-proxy-success' + Date.now(),
				title: 'Update success',
				description: 'Proxy status updated successfully',
				icon: 'i-clarity-check-circle-solid',
				duration: 3000,
				color: 'success'
			})
			await getDns() // Refresh the DNS records
		} else {
			console.error(data.errors[0].message)
			toast.add({
				id: 'update-proxy-error' + Date.now(),
				title: 'Update failed',
				description: data.errors[0].message,
				icon: 'i-clarity-warning-solid',
				duration: 3000,
				color: 'error'
			})
		}
	} else {
		console.error('HTTP-Error: ' + response.status)
	}
}

const updateSslSetting = async (sslMode) => {
	const toast = useToast()
	const response = await fetch('/api/update_ssl', {
		method: 'POST',
		body: JSON.stringify({
			apiKey: apiKey.value,
			currZone: currZone.value,
			ssl: sslMode
		})
	})
	if (response.ok) {
		const data = await response.json()
		if (data.success) {
			toast.add({
				id: 'update-ssl-success' + Date.now(),
				title: 'Update success',
				description: 'SSL status updated successfully',
				icon: 'i-clarity-check-circle-solid',
				duration: 3000,
				color: 'success'
			})
			showDropdown.value = false
			await getAll()
		} else {
			console.error(data.errors[0].message)
			toast.add({
				id: 'update-ssl-error' + Date.now(),
				title: 'Update failed',
				description: data.errors[0].message,
				icon: 'i-clarity-warning-solid',
				duration: 3000,
				color: 'error'
			})
		}
	} else {
		console.error('HTTP-Error: ' + response.status)
	}
}

const colorMode = useColorMode()
const isDark = computed({
	get() {
		return colorMode.value === 'dark'
	},
	set() {
		colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
	}
})

const dnsTypes = computed(() => {
	if (!dnsRecords.value) return []
	return dnsRecords.value
		.filter((record) => record && record.type)
		.map((record) => record.type)
		.filter((value, index, self) => self.indexOf(value) === index)
})

const columns = [
	{
		id: 'type',
		accessorKey: 'type',
		header: 'Type'
	},
	{
		id: 'name',
		accessorKey: 'name',
		header: 'Name'
	},
	{
		id: 'content',
		accessorKey: 'content',
		header: 'Content'
	},
	{
		id: 'created_on',
		accessorKey: 'created_on',
		header: 'Created'
	},
	{
		id: 'modified_on',
		accessorKey: 'modified_on',
		header: 'Modified'
	},
	{
		id: 'actions',
		header: 'Actions',
		enableSorting: false
	}
]

const columnVisibility = ref({})

const items = (row) => {
	return [
		[
			{
				label: 'Edit',
				icon: 'i-heroicons-pencil-square-20-solid',
				onClick: () => setDns(row)
			},
			{
				label: row.proxiable ? 'Proxiable' : 'Not Proxiable',
				disabled: true,
				icon: row.proxiable ? 'i-heroicons-check-circle-20-solid' : 'i-heroicons-x-circle-20-solid'
			}
		],
		[
			{
				label: 'Delete',
				icon: 'i-heroicons-trash-20-solid',
				color: 'error',
				onClick: () => preDel(row)
			}
		]
	]
}

const { width } = useWindowSize()
const isLargeScreen = computed(() => width.value >= 768)

const filteredRecords = computed(() => {
	let records = dnsRecords.value || []

	if (selectedStatus.value.length > 0) {
		records = records.filter((record) => selectedStatus.value.includes(record.type))
	}

	if (searchQuery.value) {
		const query = searchQuery.value.toLowerCase()
		records = records.filter((record) => {
			return (
				(record.name && record.name.toLowerCase().includes(query)) ||
				(record.content && record.content.toLowerCase().includes(query)) ||
				(record.comment && record.comment.toLowerCase().includes(query))
			)
		})
	}

	return records
})

const rows = computed(() => {
	const startIndex = (page.value - 1) * pageCount
	const endIndex = startIndex + pageCount
	return filteredRecords.value.slice(startIndex, endIndex)
})

onMounted(() => {
	apiKey.value = localStorage.getItem('cf-api-key')
	if (!apiKey.value) {
		router.push('/login')
		return
	}

	// Redirect to the new zone-based structure
	if (localStorage.getItem('cf-zone-id')) {
		const zoneId = localStorage.getItem('cf-zone-id')
		router.push(`/zones/${zoneId}/records`)
	} else {
		router.push('/zones')
	}
})

const getDns = async () => {
	const toast = useToast()
	const response = await fetch('/api/records', {
		method: 'POST',
		body: JSON.stringify({
			apiKey: apiKey.value,
			currZone: currZone.value
		})
	})
	if (response.ok) {
		const data = await response.json()
		if (data.success === false) {
			toast.add({
				id: 'get-records-failed' + Date.now(),
				title: 'Failed to get records',
				description: data.errors[0].message,
				icon: 'i-clarity-warning-solid',
				duration: 3000,
				color: 'error'
			})
			router.push('/')
		}
		dnsRecords.value = data.result
	} else {
		console.error('HTTP-Error: ' + response.status)
	}
}

const getZone = async () => {
	const response = await fetch('/api/zone', {
		method: 'POST',
		body: JSON.stringify({
			apiKey: apiKey.value,
			currZone: currZone.value
		})
	})
	if (response.ok) {
		const data = await response.json()
		zone.value = data.result
	} else {
		console.error('HTTP-Error: ' + response.status)
	}
}

const getAll = async () => {
	loading.value = true
	await Promise.all([getDns(), getZone()])
	loading.value = false
}

const delDns = async (record) => {
	const toast = useToast()
	const response = await fetch('/api/delete_record', {
		method: 'POST',
		body: JSON.stringify({
			apiKey: apiKey.value,
			currZone: currZone.value,
			currDnsRecord: record.id
		})
	})
	if (response.ok) {
		const _data = await response.json()
		toast.add({
			id: 'delete-record-success' + Date.now(),
			title: 'Delete success',
			description: 'Record deleted successfully',
			icon: 'i-clarity-check-circle-solid',
			duration: 3000,
			color: 'success'
		})
		await getDns()
	} else {
		console.error('HTTP-Error: ' + response.status)
	}
}

const preDel = (record) => {
	const toast = useToast()
	toast.add({
		id: 'delete-record' + Date.now(),
		title: 'Delete record',
		description: 'Are you sure you want to delete this record?',
		icon: 'i-clarity-warning-solid',
		duration: 3000,
		color: 'error',
		actions: [
			{
				label: 'Delete',
				color: 'error',
				onClick: () => {
					delDns(record)
					toast.remove('delete-record' + Date.now())
				}
			},
			{
				label: 'Cancel',
				color: 'neutral',
				onClick: () => {
					toast.remove('delete-record' + Date.now())
				}
			}
		]
	})
}

const setDns = (record) => {
	localStorage.setItem('cf-dns-id', record.id)
	localStorage.setItem('cf-dns-name', record.name)
	router.push('/editor')
}

const onSelectRecord = (_e, row) => {
	setDns(row.original)
}

const clearZone = () => {
	localStorage.removeItem('cf-zone-id')
	localStorage.removeItem('cf-zone-name')
	router.push('/')
}

const resetConfig = () => {
	localStorage.removeItem('cf-api-key')
	localStorage.removeItem('cf-zone-id')
	localStorage.removeItem('cf-zone-name')
	localStorage.removeItem('cf-dns-id')
	localStorage.removeItem('cf-dns-name')
	router.push('/login')
}

const copyToClipboard = (text) => {
	navigator.clipboard.writeText(text)
	const toast = useToast()
	toast.add({
		id: 'copy-ns' + Date.now(),
		title: 'Copied to clipboard',
		description: 'Nameserver copied to clipboard',
		icon: 'i-clarity-check-circle-solid',
		duration: 3000,
		color: 'success'
	})
}

// Utility function to format content based on record type
const formatContent = (record) => {
	if (record.type === 'SRV' && record.data) {
		return `➡️ ${record.data.target}:${record.data.port} (Weight: ${record.data.weight})`
	}
	return record.content
}

// Get color for record type badge
const getRecordTypeColor = (type) => {
	const colorMap = {
		A: 'primary',
		AAAA: 'secondary',
		CNAME: 'success',
		MX: 'info',
		SRV: 'warning',
		TXT: 'neutral'
	}
	return colorMap[type] || 'neutral'
}

// Get icon for record types
const getRecordTypeIcon = (type) => {
	const iconMap = {
		A: 'mdi:alpha-a-circle',
		AAAA: 'mdi:alpha-a-circle',
		CNAME: 'mdi:alpha-c-circle',
		MX: 'mdi:email',
		SRV: 'mdi:server',
		TXT: 'mdi:text-box'
	}
	return iconMap[type] || 'mdi:dns'
}
</script>
