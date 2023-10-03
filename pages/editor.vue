<template>
    <div>

        <Head>
            <Title>Editor</Title>
        </Head>
        <div class="w-full">
            <UButton @click="clearZone()" class="absolute top-4 left-8" icon="i-clarity-undo-line" to="/">
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
                <h1 class="text-lg font-semibold text-center mt-6 mb-2">{{ dns.type }} - {{ dns.name }}</h1>
                <div class="flex flex-col text-center rounded justify-center gap-4 p-4 m-4">
                    <h2 class="text-lg font-semibold mb-4">Edit DNS Record</h2>
                    <p class="mb-2">ID: {{ dns.id }}</p>
                    <label for="record">Record:</label>
                    <input id="record" type="text" v-model="dns.name" placeholder="Record" class="p-2 rounded border border-gray-300 mb-2">
                    <label for="type-select">Type:</label>
                    <select id="type-select" v-model="dns.type" class="type-select p-2 rounded border border-gray-300 mb-2">
                        <option value="A">A</option>
                        <option value="CNAME">CNAME</option>
                        <option value="MX">MX</option>
                        <option value="TXT">TXT</option>
                    </select>
                    <label for="endpoint">Endpoint:</label>
                    <input id="endpoint" type="text" v-model="dns.content" placeholder="Endpoint" class="p-2 rounded border border-gray-300 mb-2">
                    <label for="ttl">TTL:</label>
                    <input id="ttl" type="text" v-model="dns.ttl" placeholder="TTL" class="p-2 rounded border border-gray-300 mb-2">
                    <div class="flex justify-center items-center" v-if="dns.proxiable === true">
                        <label for="proxied">Proxied:</label>
                        <input id="proxied" type="checkbox" v-model="dns.proxied" class="p-2 rounded border border-gray-300 ml-2">
                    </div>
                    <label for="comment">Comment:</label>
                    <input id="comment" type="text" v-model="dns.comment" placeholder="Comment" class="p-2 rounded border border-gray-300 mb-2">
                    <button class="bg-blue-500 text-white px-4 py-2 rounded mt-4" :disabled="saving === 'progress'" :class="{ 'bg-opacity-50 cursor-not-allowed' : saving === 'progress' }" @click="saveDns" type="button">Save</button>
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
            currDns: '',
            currDnsName: '',
            dns: [],
            loading: true,
            saving: '',
        }
    },
    mounted() {
        this.apiKey = localStorage.getItem('cf-api-key')
        if (!this.apiKey) {
            this.$router.push('/login')
        }
        if (localStorage.getItem('cf-dns-id') && localStorage.getItem('cf-zone-id')) {
            this.currZone = localStorage.getItem('cf-zone-id')
            this.currDns = localStorage.getItem('cf-dns-id')
            this.currDnsName = localStorage.getItem('cf-dns-name')
            this.getDns()
        }
    },
    methods: {
        async getDns() {
            const response = await fetch('/api/dns_record', {
                method: 'POST',
                body: JSON.stringify({
                    apiKey: this.apiKey,
                    currZone: this.currZone,
                    currDnsRecord: this.currDns
                }),
            })
            if (response.ok) {
                const data = await response.json();
                this.dns = data.result;
                this.loading = false;
            } else {
                console.error('HTTP-Error: ' + response.status);
                this.loading = false;
            }
        },
        async saveDns() {
            this.saving = 'progress';
            const response = await fetch('/api/update_record', {
                method: 'POST',
                body: JSON.stringify({
                    apiKey: this.apiKey,
                    currZone: this.currZone,
                    currDnsRecord: this.currDns,
                    dns: this.dns
                }),
            })
            if (response.ok) {
                const data = await response.json();
                const toast = useToast()
                if (data.success === true) {
                    this.saving = 'success';
                    toast.add({
                        id: 'update-record-success' + Date.now(),
                        title: 'Update success',
                        description: 'Record updated successfully',
                        icon: 'i-clarity-check-circle-solid',
                        timeout: 3000,
                        color: 'green'
                    })
                    setTimeout(() => {
                        this.saving = '';
                    }, 3000);
                } else {
                    this.saving = 'error';
                    console.error(data.errors[0].message)
                    toast.add({
                        id: 'update-record-error' + Date.now(),
                        title: 'Update failed',
                        description: data.errors[0].message,
                        icon: 'i-clarity-warning-solid',
                        timeout: 3000,
                        color: 'red'
                    })
                    setTimeout(() => {
                        this.saving = '';
                    }, 3000);
                }
            } else {
                console.error('HTTP-Error: ' + response.status);
                this.saving = 'error';
                setTimeout(() => {
                    this.saving = '';
                }, 3000);

            }
        },
        clearDns() {
            localStorage.removeItem('cf-dns-id')
            localStorage.removeItem('cf-dns-name')
        }
    }
}
</script>