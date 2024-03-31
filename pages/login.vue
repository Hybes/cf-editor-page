<template>
  <div class="flex h-screen w-screen flex-col items-center justify-center gap-4">
    <Head>
      <Title>Login</Title>
    </Head>
    <h1 class="text-xl font-semibold">Enter your API Key</h1>
    <p class="text-sm opacity-40">This is not sent to anywhere besides Cloudflare</p>
    <UInput
      @keydown.enter="saveApiKey"
      v-model="apiKey"
      class="w-11/12 md:w-3/4"
      autofocus
      type="text"
      name="API Key"
      id="cf-api-key"
    />
    <button @click="saveApiKey" class="rounded bg-blue-500 px-4 py-1 text-white" type="button">
      Submit
    </button>
  </div>
</template>

<script setup>
const apiKey = ref('');
const router = useRouter();

onMounted(() => {
  apiKey.value = localStorage.getItem('cf-api-key');
  if (apiKey.value) {
    router.push('/');
  } else {
    router.push('/login');
  }
});

const saveApiKey = () => {
  localStorage.setItem('cf-api-key', apiKey.value);
  router.push('/');
};
</script>
