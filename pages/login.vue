<template>
  <div class="w-screen h-screen flex flex-col gap-2 justify-center items-center">
    <h1 class="text-xl font-semibold">Enter your API Key</h1>
    <p class="text-sm opacity-40">This is not sent to anywhere besides Cloudflare</p>
    <input @keydown.enter="saveApiKey" v-model="apiKey" class="w-11/12 md:w-3/4 border-2 border-black p-2 rounded" autofocus type="text"
      name="API Key" id="cf-api-key">
    <button @click="saveApiKey" class="bg-blue-500 text-white px-4 py-1 rounded" type="button">Submit</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      apiKey: ''
    }
  },
  mounted() {
    this.apiKey = localStorage.getItem('cf-api-key')
    if (this.apiKey) {
      this.$router.push('/')
    } else {
      this.$router.push('/login')
    }
  },
  methods: {
    saveApiKey() {
      localStorage.setItem('cf-api-key', this.apiKey);
      this.$router.push('/')
    }
  }
}
</script>