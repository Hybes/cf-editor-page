<template>
	<PageContainer>
		<Head>
			<Title>Login</Title>
		</Head>
		<div class="flex min-h-[70vh] flex-col items-center justify-center gap-4">
			<h1 class="text-xl font-semibold">Enter your Cloudflare API token</h1>
			<p class="text-sm text-stone-600 dark:text-stone-400">
				Your token is only used to call the Cloudflare API.
			</p>
			<div class="w-full max-w-2xl rounded-lg border border-stone-200 bg-white/70 p-4 text-sm text-stone-700 shadow-xs dark:border-stone-700 dark:bg-stone-900/40 dark:text-stone-200">
				<p class="font-semibold text-stone-800 dark:text-stone-100">Quick setup</p>
				<p class="mt-2">
					Create a custom token, choose all accounts and all zones, then add these permissions.
				</p>
				<ul class="mt-3 list-inside list-disc space-y-1">
					<li>Zone: Read, Edit</li>
					<li>DNS: Read, Edit</li>
					<li>Rulesets: Read, Edit</li>
					<li>Bots: Read, Edit</li>
					<li>Turnstile: Read, Edit</li>
					<li>Analytics: Read</li>
				</ul>
				<p class="mt-3 text-xs text-stone-600 dark:text-stone-400">
					Some features depend on your Cloudflare plan, even with the right permissions.
				</p>
			</div>
			<div class="flex flex-col items-center gap-3">
				<NuxtLink
					to="https://dash.cloudflare.com/profile/api-tokens"
					external
					target="_blank"
					rel="noopener noreferrer"
				>
					<UButton variant="outline" color="primary" icon="i-heroicons-key">
						Open the Cloudflare token page
					</UButton>
				</NuxtLink>
				<p class="text-xs text-stone-600 dark:text-stone-400">You will paste it here afterwards.</p>
			</div>
			<UInput
				id="cf-api-key"
				v-model="apiToken"
				class="w-full max-w-2xl"
				autofocus
				type="password"
				name="API Token"
				placeholder="Paste your API token"
				@keydown.enter="saveApiToken"
			/>
			<UButton color="primary" @click="saveApiToken"> Continue </UButton>
		</div>
	</PageContainer>
</template>

<script setup>
const apiToken = ref('')
const router = useRouter()

onMounted(() => {
	apiToken.value = (localStorage.getItem('cf-api-key') || '').trim()
	if (apiToken.value) {
		router.push('/')
	}
})

const saveApiToken = () => {
	const token = (apiToken.value || '').trim()
	if (!token) return
	localStorage.setItem('cf-api-key', token)
	router.push('/')
}
</script>
