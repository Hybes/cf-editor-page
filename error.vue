<template>
  <div class="flex h-screen w-screen flex-col items-center justify-center bg-stone-100 text-black dark:bg-stone-900 dark:text-white">
    <h1 class="text-6xl font-bold mb-4">404</h1>
    <p class="text-xl mb-8">Page Not Found</p>
    <UButton @click="goHome" variant="outline" color="blue">Go to Home</UButton>
  </div>
</template>

<script setup>
const router = useRouter();

const goHome = () => {
  router.push('/');
};
</script>
