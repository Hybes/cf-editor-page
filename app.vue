<template>
	<SeoKit />
	<div>
		<div v-if="loading">
			<div class="flex h-screen w-screen flex-col items-center justify-center gap-2">
				<div>
					<svg
						class="h-12 w-12 animate-spin"
						xmlns="http://www.w3.org/2000/svg"
						width="32"
						height="32"
						viewBox="0 0 24 24"
					>
						<path
							fill="none"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 3a9 9 0 1 0 9 9"
						/>
					</svg>
				</div>
			</div>
		</div>
		<div v-else>
			<NuxtPage />
			<UNotifications />
			<div class="mb-14 mt-8 text-center">
				<UButton class="my-2" color="red" variant="outline" @click="resetConfig()">Logout</UButton>
				<p class="my-2 text-sm opacity-60 hover:opacity-80">
					<a href="https://connectdorset.com" target="_blank">Built by Connect</a>
				</p>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	setup() {
		return {
			config: useRuntimeConfig(),
		};
	},
	data() {
		return {
			loading: true,
			apiKey: '',
		};
	},
	mounted() {
		this.apiKey = localStorage.getItem('cf-api-key');
		if (this.apiKey) {
			this.loading = false;
		} else {
			this.$router.push('/login');
			this.loading = false;
		}
	},
	methods: {
		navigateTo(id) {
			const element = document.querySelector(id);
			element.scrollIntoView({ behavior: 'smooth' });
		},
		resetConfig() {
			localStorage.removeItem('cf-api-key');
			localStorage.removeItem('cf-zone-id');
			localStorage.removeItem('cf-zone-name');
			localStorage.removeItem('cf-dns-id');
			localStorage.removeItem('cf-dns-name');
			this.$router.push('/login');
		},
	},
};
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
