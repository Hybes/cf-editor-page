<template>
    <div>

        <Head>
            <Title>Records</Title>
        </Head>
        <div class="w-full">
            <UButton @click="clearZone()" class="absolute top-6 left-8" icon="i-clarity-undo-line" to="/">
                Back
            </UButton>
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
                <div v-if="columns === false">
                    <div class="flex flex-row flex-wrap justify-center gap-4 p-4">
                        <div @click="setDns(record)" class="bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-900 cursor-pointer px-4 py-2 min-w-[100px] max-w-[300px] rounded overflow-hidden"
                            v-for="record in dnsRecords">
                            <p class="font-bold">{{ record.type }}</p>
                            <p>{{ record.name }}</p>
                            <p class="truncate">{{ record.content }}</p>
                        </div>
                    </div>
                </div>
                <div v-if="columns === true || columns === null">
                    <div class="flex flex-col flex-wrap justify-center gap-4 p-4 w-full overflow-clip">
                        <div @click="setDns(record)" class="flex md:flex-row flex-col cursor-pointer px-4 py-2 overflow-hidden gap-6 w-full bg-stone-200 hover:bg-stone-300 dark:bg-stone-700 dark:hover:bg-stone-800 rounded"
                            v-for="record in dnsRecords">
                            <div class="px-2 py-1 w-24 text-center">
                                <p class="font-bold">{{ record.type }}</p>
                            </div>
                            <div class="border-l-2 pl-8 border-stone-600 dark:border-stone-400 px-2 py-1 text-center">
                                <p>{{ record.name }}</p>
                            </div>
                            <div class="border-l-2 pl-8 border-stone-600 dark:border-stone-400 px-2 py-1 text-center overflow-hidden max-w-[600px]">
                                <p class="truncate">{{ record.content }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <UButton class="absolute top-6 right-4" v-if="!columns" @click="switchView()" icon="i-clarity-bars-line">Columns</UButton>
            <UButton class="absolute top-6 right-4" v-if="columns" @click="switchView()" icon="i-clarity-grid-chart-solid">Blocks</UButton>
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
            columns: true
        }
    },
    mounted() {
        this.apiKey = localStorage.getItem('cf-api-key')
        if (!this.apiKey) {
            this.$router.push('/login')
        }
        if (localStorage.getItem('cf-zone-id')) {
            this.currZone = localStorage.getItem('cf-zone-id')
            this.currZoneName = localStorage.getItem('cf-zone-name')
            this.getDns()
        }
    },
    methods: {
        async getDns() {
            const response = await fetch('/api/records', {
            method: 'POST',
            body: JSON.stringify({
                apiKey: this.apiKey,
                currZone: this.currZone
            }),
        })
        if (response.ok) {
            const data = await response.json();
            this.dnsRecords = data.result;
            this.loading = false;
        } else {
            console.error('HTTP-Error: ' + response.status);
            this.loading = false;
        }
        },
        sort(field) {
            this.dnsRecords.sort((a, b) => a[field].localeCompare(b[field]));
        },
        clearZone() {
            localStorage.removeItem('cf-zone-id')
            localStorage.removeItem('cf-zone-name')
        },
        setDns(record) {
            localStorage.setItem('cf-dns-id', record.id);
            localStorage.setItem('cf-dns-name', record.name);
            this.$router.push('/editor')
        },
        switchView() {
            this.columns = !this.columns
        }
    }
}
</script>