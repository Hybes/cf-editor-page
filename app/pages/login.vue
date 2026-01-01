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
			<div class="flex flex-col items-center gap-3">
				<UButton
					href="https://dash.cloudflare.com/profile/api-tokens"
					target="_blank"
					rel="noopener noreferrer"
					external
					variant="outline"
					color="primary"
					icon="i-heroicons-key"
				>
					Create an API token in Cloudflare
				</UButton>
				<p class="text-xs text-stone-600 dark:text-stone-400">
					You will paste it here afterwards.
				</p>
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
			<UButton color="primary" @click="saveApiToken">
				Continue
			</UButton>
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
