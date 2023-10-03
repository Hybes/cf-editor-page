<template>
    <div>

        <Head>
            <Title>Records</Title>
        </Head>
        <div class="w-full">
            <NuxtLink @click="clearZone()" class="absolute top-4 left-8 flex px-4 py-1 bg-gray-100 rounded-sm hover:bg-gray-200" to="/">
                <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8l8 8l1.41-1.41L7.83 13H20v-2z" />
                </svg>Back
            </NuxtLink>
            <div class="w-screen h-screen flex justify-center items-center flex-col" v-if="loading">
                <div>
                    <svg class="animate-spin w-12 h-12" xmlns="http://www.w3.org/2000/svg" width="32" height="32"
                        viewBox="0 0 24 24">
                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                            stroke-width="2" d="M12 3a9 9 0 1 0 9 9" />
                    </svg>
                </div>
            </div>
            <div v-else>
                <h1 class="text-lg font-semibold text-center mt-6 mb-2">{{ currZoneName }}</h1>
                <div class="flex flex-row flex-wrap justify-center gap-4 p-4">
                    <div class="bg-gray-200 hover:bg-gray-300 cursor-pointer px-4 py-2 min-w-[100px] max-w-[300px] rounded-sm overflow-hidden"
                        v-for="record in dnsRecords">
                        <p class="font-bold">{{ record.type }}</p>
                        <p>{{ record.name }}</p>
                        <p class="truncate">{{ record.content }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            apiKey: '',
            currZone: '',
            currZoneName: '',
            dnsRecords: [],
            loading: true,
        }
    },
    mounted() {
        if (!this.apiKey) {
            this.$router.push('/login')
        }
        if (localStorage.getItem('cf-zone-id')) {
            this.apiKey = localStorage.getItem('cf-api-key')
            this.currZone = localStorage.getItem('cf-zone-id')
            this.currZoneName = localStorage.getItem('cf-zone-name')
            this.getDns()
        }
    },
    methods: {
        getDns() {
            fetch(`https://api.cloudflare.com/client/v4/zones/${this.currZone}/dns_records`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                }
            })
                .then(response => response.json())
                .then(data => {
                    this.dnsRecords = data.result
                    this.loading = false
                })
        },
        clearZone() {
            localStorage.removeItem('cf-zone-id')
            localStorage.removeItem('cf-zone-name')
        }
    }
}
</script>