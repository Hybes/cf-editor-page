<template>
	<div
		:class="
			fullscreen
				? 'fixed top-0 left-0 z-50 flex h-screen w-screen items-center justify-center bg-muted/70 px-6 backdrop-blur-sm'
				: 'flex items-center justify-center px-6'
		"
	>
		<div class="flex w-full max-w-xl flex-col items-center gap-4 rounded-xl border border-default bg-elevated/70 p-6 shadow-sm">
			<svg class="h-12 w-12 animate-spin text-primary" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
				<path
					fill="none"
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 3a9 9 0 1 0 9 9"
				/>
			</svg>
			<div class="flex w-full flex-col gap-1 text-center">
				<div class="text-lg font-semibold text-highlighted">{{ title }}</div>
				<div v-if="subtitle" class="text-sm text-muted">{{ subtitle }}</div>
			</div>
			<ul v-if="hints?.length" class="w-full list-outside list-disc space-y-1 pl-5 text-sm text-muted">
				<li v-for="(hint, i) in hints" :key="i">{{ hint }}</li>
			</ul>
		</div>
	</div>
</template>

<script setup>
defineProps({
	title: { type: String, default: 'Loading…' },
	subtitle: { type: String, default: '' },
	hints: { type: Array, default: () => [] },
	fullscreen: { type: Boolean, default: false }
})
</script>
