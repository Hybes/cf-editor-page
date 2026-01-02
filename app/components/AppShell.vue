<template>
	<div class="bg-muted/30 min-h-screen">
		<header class="border-default bg-default/70 sticky top-0 z-40 border-b backdrop-blur">
			<UContainer>
				<div class="flex items-center justify-between gap-3 py-3">
					<div class="flex min-w-0 items-center gap-3">
						<UButton
							v-if="backTo"
							:to="backTo"
							variant="ghost"
							color="neutral"
							icon="i-heroicons-arrow-left-20-solid"
							class="shrink-0"
						>
							{{ backLabel || 'Back' }}
						</UButton>
						<div class="min-w-0">
							<div class="flex items-center gap-2">
								<UIcon name="i-clarity-cloud-line" class="text-primary h-5 w-5" />
								<p class="text-highlighted truncate text-sm font-semibold">
									{{ title }}
								</p>
							</div>
							<p v-if="subtitle" class="text-muted truncate text-xs">
								{{ subtitle }}
							</p>
						</div>
					</div>

					<div class="flex items-center gap-2">
						<slot name="actions" />
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
							@click="resetConfig"
						>
							Logout
						</UButton>
					</div>
				</div>
			</UContainer>
		</header>

		<main>
			<UContainer class="py-6">
				<div class="flex flex-col gap-6">
					<slot />
				</div>
			</UContainer>
		</main>

		<footer class="py-10">
			<UContainer>
				<a
					href="https://connectdorset.com"
					target="_blank"
					class="text-muted hover:text-default flex items-center justify-center gap-2 text-sm"
				>
					<span>Built by Connect</span>
					<UIcon name="i-heroicons-arrow-top-right-on-square" class="h-4 w-4" />
				</a>
			</UContainer>
		</footer>
	</div>
</template>

<script setup>
defineProps({
	title: { type: String, default: 'DNS Manager' },
	subtitle: { type: String, default: '' },
	backTo: { type: [String, Object], default: '' },
	backLabel: { type: String, default: '' },
	showLogout: { type: Boolean, default: true },
	showTheme: { type: Boolean, default: true }
})

const colorMode = useColorMode()
const isDark = computed({
	get() {
		return colorMode.value === 'dark'
	},
	set() {
		colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
	}
})

const resetConfig = () => {
	localStorage.removeItem('cf-api-key')
	localStorage.removeItem('cf-zone-id')
	localStorage.removeItem('cf-zone-name')
	localStorage.removeItem('cf-dns-id')
	localStorage.removeItem('cf-dns-name')

	useRouter().push('/login')
}
</script>
