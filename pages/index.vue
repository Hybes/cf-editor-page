<script setup lang="ts">
import { NuxtPluginIndicator } from 'nuxt/app';
const route = useRoute()
</script>

<template>
  <div class="w-screen h-screen flex flex-col justify-center items-center">
    <h1>This is your home/index page</h1>
    <p>Current route: {{ route.path }}</p>
    <a href="https://nuxt.com/docs/getting-started/routing" target="_blank">Learn more about Nuxt Routing</a>
    <NuxtPage />
  </div>
</template>
