<template>
    <div>

        <Head>
            <Title>New</Title>
        </Head>
        <div class="w-full">
            <UButton @click="clearDns()" class="absolute top-4 left-8" variant="outline" icon="i-clarity-undo-line" to="/records">
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
            <div v-else class="flex flex-col items-center">
                <h1 class="text-lg font-semibold text-center mt-6 mb-2">{{ dns.name }}</h1>
                <div class="flex flex-col text-center rounded justify-center gap-4 p-4 m-4 w-full md:w-3/4 full:w-1/2">
                    <h2 class="text-lg font-semibold mb-4">Create DNS Record</h2>
                    <div class="flex justify-between items-center mb-2">
                        <label for="name" class="w-24 mr-2">Name:</label>
                        <input @keydown.enter="createDns()" id="name" type="text" v-model="dns.name" placeholder="Name (Required)" class="p-2 rounded border border-gray-300 flex-grow">
                    </div>
                    <div class="flex justify-between items-center mb-2">
                        <label for="type-select" class="w-24 mr-2">Type:</label>
                        <select id="type-select" v-model="dns.type" class="type-select p-2 rounded border border-gray-300 flex-grow">
                            <option value="A">A</option>
                            <option value="CNAME">CNAME</option>
                            <option value="MX">MX</option>
                            <option value="TXT">TXT</option>
                        </select>
                    </div>
                    <div class="flex justify-between items-center mb-2">
                        <label @click="toggleEndpoint = !toggleEndpoint" for="endpoint" class="w-24 mr-2 cursor-pointer">Endpoint:</label>
                        <input @keydown.enter="createDns()"  v-if="!toggleEndpoint" id="endpoint" type="text" v-model="dns.content" placeholder="Endpoint" class="p-2 rounded border border-gray-300 flex-grow">
                        <textarea @keydown.enter="createDns()" v-else id="endpoint" v-model="dns.content" placeholder="Endpoint" class="p-2 rounded border border-gray-300 flex-grow"></textarea>
                    </div>
                    <div class="flex justify-between items-center mb-2">
                        <label for="ttl" class="w-24 mr-2">TTL:</label>
                        <input @keydown.enter="createDns()" id="ttl" type="text" v-model="dns.ttl" placeholder="TTL (Leave blank or set to 1 for auto TTL)" class="p-2 rounded border border-gray-300 flex-grow">
                    </div>
                    <div class="flex justify-start items-center mb-2" v-if="dns.type === 'A' || dns.type === 'CNAME'">
                        <label for="proxied" class="w-24 mr-2">Proxied:</label>
                        <input @keydown.enter="createDns()" id="proxied" type="checkbox" v-model="dns.proxied" class="p-2 rounded border border-gray-300">
                    </div>
                    <div class="flex justify-between items-center mb-2">
                        <label for="comment" class="w-24 mr-2">Comment:</label>
                        <input @keydown.enter="createDns()" id="comment" type="text" v-model="dns.comment" placeholder="Comment" class="p-2 rounded border border-gray-300 flex-grow">
                    </div>
                    <div>
                        <UButton class="mt-4 px-6" color="green" variant="outline" :disabled="saving === 'progress'" :class="{ 'bg-opacity-50 cursor-not-allowed' : saving === 'progress' }" @click="createDns()" type="button">Create</UButton>
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
            dns:
            {
                name: '',
                type: 'CNAME',
                content: '',
                ttl: '',
                proxied: true,
                comment: ''
            },
            loading: true,
            saving: '',
            toggleEndpoint: false
        }
    },
    mounted() {
        this.apiKey = localStorage.getItem('cf-api-key')
        if (!this.apiKey) {
            this.$router.push('/login')
        }
        if (localStorage.getItem('cf-zone-id')) {
            this.currZone = localStorage.getItem('cf-zone-id')
            this.loading = false
        } else {
            this.$router.push('/')
        }
    },
    methods: {
        async createDns() {
            this.saving = 'progress';
            const response = await fetch('/api/create_record', {
                method: 'POST',
                body: JSON.stringify({
                    apiKey: this.apiKey,
                    currZone: this.currZone,
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
                        title: 'Create success',
                        description: 'Record created successfully',
                        icon: 'i-clarity-check-circle-solid',
                        timeout: 3000,
                        color: 'green'
                    })
                    this.$router.push('/records')
                } else {
                    this.saving = 'error';
                    console.error(data.errors[0].message)
                    toast.add({
                        id: 'update-record-error' + Date.now(),
                        title: 'Create failed',
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