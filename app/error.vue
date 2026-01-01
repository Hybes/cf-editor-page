<template>
	<div
		class="flex h-screen w-screen flex-col items-center justify-center bg-stone-100 text-black dark:bg-stone-900 dark:text-white"
	>
		<h1 class="mb-4 text-6xl font-bold">404</h1>
		<p class="mb-8 text-xl">Page Not Found</p>
		<UButton variant="outline" color="primary" @click="goHome">Go to Home</UButton>
	</div>
</template>

<script setup>
const router = useRouter()

const goHome = () => {
	router.push('/')
}
</script>
