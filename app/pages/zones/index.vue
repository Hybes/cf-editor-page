<template>
	<PageContainer>
		<Head>
			<Title>Zones</Title>
		</Head>
		<div class="flex min-h-[70vh] w-full flex-col items-center justify-center">
			<Loader
				v-if="loading && !appBootLoading"
				fullscreen
				title="Loading your zones"
				subtitle="Fetching zone list from Cloudflare…"
			/>
			<div v-else-if="!loading" class="flex w-full flex-col items-center justify-center gap-6">
				<div class="flex flex-col items-center justify-center gap-2">
					<h1 class="text-center text-2xl font-semibold">Cloudflare DNS Editor</h1>
					<CapabilityIndicator :missing-items="capabilityMissing" />
				</div>
				<div class="max-w-8xl flex w-full flex-col rounded-lg border p-4 dark:border-gray-700">
					<div class="mb-4 flex flex-col gap-2">
						<h2 class="text-lg font-medium">Your Zones</h2>
						<div class="text-sm text-gray-500">Select a zone to manage its DNS records</div>
					</div>
					<div class="relative mb-4 w-full">
						<UTooltip text="Press '/' to search">
							<UInput
								ref="searchInput"
								v-model="searchQuery"
								icon="i-heroicons-magnifying-glass-20-solid"
								type="text"
								placeholder="Search zones..."
								color="neutral"
								class="w-full transition-all focus-within:shadow-md"
								size="lg"
								@focus="focusSearchInput"
							/>
						</UTooltip>
						<span
							v-if="searchQuery"
							class="absolute top-2 right-2 cursor-pointer text-gray-500 hover:text-gray-700"
							@click="searchQuery = ''"
						>
							<UIcon name="i-heroicons-x-mark-20-solid" class="h-5 w-5" />
						</span>
					</div>
					<div class="mb-4 flex w-full flex-wrap items-center justify-between gap-3">
						<div class="text-sm text-gray-500">{{ filteredZones.length }} zones</div>
						<div class="flex items-center gap-2">
							<UButton
								size="sm"
								variant="outline"
								:color="viewMode === 'grid' ? 'primary' : 'neutral'"
								icon="i-heroicons-squares-2x2"
								@click="viewMode = 'grid'"
							>
								Grid
							</UButton>
							<UButton
								size="sm"
								variant="outline"
								:color="viewMode === 'table' ? 'primary' : 'neutral'"
								icon="i-heroicons-table-cells"
								@click="viewMode = 'table'"
							>
								Table
							</UButton>
						</div>
					</div>

					<div v-if="viewMode === 'grid'" class="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
						<div
							v-for="zone in filteredZones"
							:key="zone.id"
							class="flex cursor-pointer flex-col gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
							@click="navigateToZone(zone.id)"
						>
							<div class="flex items-start justify-between gap-3">
								<div class="min-w-0">
									<div class="flex items-center gap-2">
										<UIcon name="i-heroicons-globe-alt" class="text-blue-500" />
										<div class="truncate font-medium">{{ zone.name }}</div>
									</div>
									<div class="mt-1 text-xs text-gray-500">{{ zone.id }}</div>
								</div>
								<UBadge
									:color="zone.status === 'active' ? 'success' : 'warning'"
									variant="subtle"
									class="uppercase"
								>
									{{ zone.status }}
								</UBadge>
							</div>
							<div class="flex justify-end">
								<UButton
									color="primary"
									variant="soft"
									size="sm"
									icon="i-heroicons-pencil-square"
									@click.stop="navigateToZone(zone.id)"
								>
									Manage Records
								</UButton>
							</div>
						</div>
					</div>

					<div v-else class="w-full rounded-sm">
						<UTable
							:data="filteredZones"
							:columns="columns"
							:loading="loading"
							:ui="{
								tr: {
									base: 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800'
								}
							}"
							@select="onSelectZone"
						>
							<template #name-cell="{ row }">
								<div class="flex items-center gap-3">
									<UIcon name="i-heroicons-globe-alt" class="text-blue-500" />
									<div class="font-medium">{{ row.original.name }}</div>
								</div>
							</template>
							<template #status-cell="{ row }">
								<UBadge
									:color="row.original.status === 'active' ? 'success' : 'warning'"
									variant="subtle"
									class="uppercase"
								>
									{{ row.original.status }}
								</UBadge>
							</template>
							<template #actions-cell="{ row }">
								<div class="flex gap-2">
									<UButton
										color="primary"
										variant="soft"
										size="sm"
										icon="i-heroicons-pencil-square"
										@click.stop="navigateToZone(row.original.id)"
									>
										Manage Records
									</UButton>
								</div>
							</template>
						</UTable>
					</div>
				</div>
			</div>
		</div>
	</PageContainer>
</template>

<script setup>
const appBootLoading = useState('appBootLoading')
const apiKey = ref('')
const zones = ref([])
const loading = ref(true)
const router = useRouter()
const searchInput = ref(null)
const searchQuery = ref('')
const capabilityMissing = ref([])
const viewMode = ref('grid')

const columns = [
	{ id: 'name', accessorKey: 'name', header: 'Domain' },
	{ id: 'status', accessorKey: 'status', header: 'Status' },
	{ id: 'actions', header: 'Actions', enableSorting: false }
]

// Function to focus and select text in search input
const focusSearchInput = () => {
	setTimeout(() => {
		const input = searchInput.value?.$el.querySelector('input')
		if (input) {
			input.select()
		}
	}, 100)
}

// Filtered zones based on search query
const filteredZones = computed(() => {
	if (!searchQuery.value) return zones.value

	const query = searchQuery.value.toLowerCase()
	return zones.value.filter(
		(zone) => zone.name.toLowerCase().includes(query) || zone.status.toLowerCase().includes(query)
	)
})

onMounted(async () => {
	apiKey.value = (localStorage.getItem('cf-api-key') || '').trim()
	if (!apiKey.value) {
		router.push('/login')
		return
	}
	const capsPromise = (async () => {
		try {
			const { loadGlobal, missing } = useCapabilities()
			const caps = await loadGlobal(apiKey.value)
			capabilityMissing.value = missing(caps)
		} catch {
			capabilityMissing.value = []
		}
	})()

	window.addEventListener('keydown', handleKeyDown)

	const savedView = localStorage.getItem('zones-view-mode')
	if (savedView === 'grid' || savedView === 'table') viewMode.value = savedView

	await Promise.all([capsPromise, getZones()])
})

onUnmounted(() => {
	window.removeEventListener('keydown', handleKeyDown)
})

// Keyboard shortcut handler
const handleKeyDown = (e) => {
	if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
		e.preventDefault()
		searchInput.value?.$el.querySelector('input')?.focus()
	}
}

watch(viewMode, (v) => {
	localStorage.setItem('zones-view-mode', v)
})

const getZones = async () => {
	try {
		const response = await fetch('/api/zones', {
			method: 'POST',
			body: JSON.stringify({ apiKey: apiKey.value })
		})

		if (response.ok) {
			const data = await response.json()
			zones.value = data.result || []
		} else {
			console.error('HTTP-Error: ' + response.status)
			const toast = useToast()
			toast.add({
				id: 'get-zones-error' + Date.now(),
				title: 'Error',
				description: 'Failed to fetch zones',
				icon: 'i-clarity-warning-solid',
				duration: 3000,
				color: 'error'
			})
		}
	} catch (error) {
		console.error('Error fetching zones:', error)
	} finally {
		loading.value = false
	}
}

const navigateToZone = (zoneId) => {
	// Also store in localStorage for compatibility with older pages
	localStorage.setItem('cf-zone-id', zoneId)

	// Look up zone name to store it too
	const zone = zones.value.find((z) => z.id === zoneId)
	if (zone) {
		localStorage.setItem('cf-zone-name', zone.name)
	}

	router.push(`/zones/${zoneId}/records`)
}

const onSelectZone = (_e, row) => {
	navigateToZone(row.original.id)
}
</script>
