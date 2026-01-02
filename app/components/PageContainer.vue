<template>
	<div class="min-h-screen w-full">
		<div :class="innerClass">
			<div v-if="showActions" class="flex items-center justify-end gap-2 pb-4">
				<ClientOnly v-if="showTheme">
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
				<UButton
					v-if="showLogout"
					color="error"
					variant="outline"
					icon="i-heroicons-arrow-right-on-rectangle"
					@click="logout"
				>
					Logout
				</UButton>
			</div>
			<slot />
		</div>
	</div>
</template>

<script setup>
const props = defineProps({
	fullWidth: { type: Boolean, default: false },
	showLogout: { type: Boolean, default: true },
	showTheme: { type: Boolean, default: true }
})

const innerClass = computed(() => {
	const base = 'mx-auto w-full px-4 py-6 md:px-8'
	return props.fullWidth ? base : `${base} max-w-8xl`
})

const router = useRouter()
const apiKey = ref('')
const colorMode = useColorMode()

const showActions = computed(() => Boolean(apiKey.value))

const isDark = computed({
	get() {
		return colorMode.value === 'dark'
	},
	set() {
		colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
	}
})

onMounted(() => {
	apiKey.value = (localStorage.getItem('cf-api-key') || '').trim()
})

const logout = () => {
	localStorage.removeItem('cf-api-key')
	localStorage.removeItem('cf-zone-id')
	localStorage.removeItem('cf-zone-name')
	localStorage.removeItem('cf-dns-id')
	localStorage.removeItem('cf-dns-name')
	localStorage.removeItem('zones-view-mode')

	const caps = useState('cf-capabilities')
	if (caps.value) {
		caps.value = { apiKey: null, global: null, zones: {}, loading: false }
	}

	apiKey.value = ''
	router.push('/login')
}
</script>
