<template>
	<UApp>
		<div class="relative min-h-screen">
			<div v-if="appBootLoading">
				<Loader
					fullscreen
					title="Preparing Cloudflare DNS Editor"
					subtitle="Checking your API key and restoring your session…"
					:hints="[
						'If this takes longer than a few seconds, check your API key is still valid.',
						'Ensure your token has permission to read zones and manage DNS.'
					]"
				/>
			</div>

			<NuxtPage />
		</div>
	</UApp>
</template>

<script setup>
const appBootLoading = useState('appBootLoading', () => true)
const apiKey = ref('')

onMounted(() => {
	apiKey.value = (localStorage.getItem('cf-api-key') || '').trim()
	if (apiKey.value) {
		appBootLoading.value = false
	} else {
		useRouter().push('/login')
		appBootLoading.value = false
	}
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
	opacity: 1;
	transition: opacity 0.2s cubic-bezier(0.33, 1, 0.68, 1);
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>
