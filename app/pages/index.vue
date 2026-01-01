<template>
	<PageContainer>
		<div class="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
			<Head>
				<Title>Zones</Title>
			</Head>
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
			<div class="flex min-h-[70vh] items-center justify-center gap-4">
				<div class="flex w-full flex-col items-center justify-center gap-4">
					<h1 class="text-xl font-semibold">Zones</h1>
					<UInput
						ref="searchInput"
						v-model="searchQuery"
						icon="i-heroicons-magnifying-glass-20-solid"
						type="text"
						placeholder="Search"
						autofocus
						color="neutral"
						class="w-full md:w-1/2"
					/>
					<UButton
						variant="outline"
						color="primary"
						:loading="loadingSsl"
						:disabled="gotSSL"
						@click="getSsl()"
					>
						Get SSL Mode
					</UButton>
					<div class="w-full">
						<UTable
							:data="filteredZones"
							:columns="columns"
							:loading="loading"
							:ui="{
								tr: {
									base: 'cursor-pointer even:bg-stone-100 dark:even:bg-stone-950/50 hover:bg-stone-200 dark:hover:bg-stone-800'
								},
								td: {
									color: 'text-stone-700 dark:text-stone-200'
								}
							}"
							class="rounded-lg border border-stone-300 dark:border-stone-700"
							@select="setZone"
						>
						<template #name-cell="{ row }">
							<div class="flex items-center gap-4">
								<UIcon
									v-if="row.original.ssl?.result?.value === 'strict'"
									name="i-clarity-lock-solid"
									class="h-6 w-6"
								/>
								<UIcon
									v-if="row.original.ssl?.result?.value === 'full'"
									name="i-clarity-lock-line"
									class="h-6 w-6"
								/>
								<UIcon
									v-if="row.original.ssl?.result?.value === 'flexible'"
									name="i-clarity-curve-chart-solid"
									class="h-6 w-6"
								/>
								<UIcon
									v-if="row.original.ssl?.result?.value === 'off'"
									name="i-clarity-no-access-solid"
									class="h-6 w-6"
								/>
								<UTooltip
									v-if="row.original.status === 'active' && row.original.paused !== true"
									text="Active"
								>
									<UIcon name="i-clarity-circle-solid" class="animate-pulse text-green-400" />
								</UTooltip>
								<UTooltip
									v-if="row.original.status !== 'active' && row.original.paused !== true"
									text="Inactive"
								>
									<UIcon name="i-clarity-circle-solid" class="animate-pulse text-red-500" />
								</UTooltip>
								<UTooltip v-if="row.original.paused === true" text="Domain is paused">
									<UIcon name="i-clarity-pause-solid" class="animate-pulse text-orange-400" />
								</UTooltip>
								<p class="whitespace nowrap text-sm text-stone-600 dark:text-stone-200">
									{{ row.original.name }}
								</p>
							</div>
						</template>
						<template #created_on-cell="{ row }">
							<p class="whitespace nowrap text-xs text-stone-600 dark:text-stone-200">
								{{ dayjs(row.original.created_on).format('MMM DD, YYYY') }}
							</p>
						</template>
						<template #original_registrar-cell="{ row }">
							<p class="whitespace nowrap text-xs text-stone-600 dark:text-stone-200">
								{{
									row.original.original_registrar
										? row.original.original_registrar.replace(/\(.*?\)/g, '')
										: ''
								}}
							</p>
						</template>
						</UTable>
					</div>
				</div>
			</div>
	</PageContainer>
</template>

<script setup>
import dayjs from 'dayjs'
const router = useRouter()
const apiKey = ref('')
const zones = ref([])
const loading = ref(true)
const searchQuery = ref('')
const loadingSsl = ref(false)
const gotSSL = ref(false)

const columns = [
	{ id: 'name', accessorKey: 'name', header: 'Name' },
	{ id: 'created_on', accessorKey: 'created_on', header: 'Created' },
	{ id: 'original_registrar', accessorKey: 'original_registrar', header: 'Previous' }
]

const colorMode = useColorMode()
const isDark = computed({
	get() {
		return colorMode.value === 'dark'
	},
	set() {
		colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
	}
})

const filteredZones = computed(() => {
	return zones.value.filter((record) => {
		return record.name.toLowerCase().includes(searchQuery.value.toLowerCase())
	})
})

onMounted(() => {
	apiKey.value = localStorage.getItem('cf-api-key')
	if (!apiKey.value) {
		router.push('/login')
		return
	}

	// Redirect to zones page directly
	router.push('/zones')
})

const setZone = (_e, row) => {
	localStorage.setItem('cf-zone-id', row.original.id)
	localStorage.setItem('cf-zone-name', row.original.name)
	useRouter().push('/records')
}

const resetConfig = () => {
	localStorage.removeItem('cf-api-key')
	localStorage.removeItem('cf-zone-id')
	localStorage.removeItem('cf-zone-name')
	localStorage.removeItem('cf-dns-id')
	localStorage.removeItem('cf-dns-name')
	useRouter().push('/login')
}

const getSsl = async () => {
	loadingSsl.value = true
	const response = await fetch('/api/zones', {
		method: 'POST',
		body: JSON.stringify({
			apiKey: apiKey.value,
			getSsl: true
		})
	})
	if (response.ok) {
		const data = await response.json()
		zones.value = data.result
		loading.value = false
		gotSSL.value = true
		loadingSsl.value = false
	} else {
		console.error('HTTP-Error: ' + response.status)
		loading.value = false
		loadingSsl.value = false
	}
}
</script>
