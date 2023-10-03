<template>
    <div>
        <Head>
            <Title>Records</Title>
        </Head>
        <div class="w-full">
            <div class="flex flex-row flex-wrap justify-center items-center gap-2 md:justify-between px-4 py-4">
                <div class="flex flex-row flex-wrap justify-center gap-2">
                    <UButton @click="clearZone()" variant="outline" icon="i-clarity-undo-line" to="/">
                        Back
                    </UButton>
                    <UButton to="/create" variant="outline" color="green" icon="i-clarity-plus-circle-solid">
                        Create
                    </UButton>
                </div>
                <div class="flex flex-row flex-wrap justify-center gap-2">
                    <UButton @click="sort('type')" variant="outline" color="white" icon="i-clarity-cloud-network-line">Sort Type</UButton>
                    <UButton @click="sort('name')" variant="outline" color="white" icon="i-clarity-sort-by-line">Sort Name</UButton>
                    <UButton @click="resetConfig()" variant="outline" color="red" >Logout</UButton>
                </div>
            </div>
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
                <h1 class="text-lg font-semibold text-center my-4">{{ currZoneName }}</h1>
                <UInput icon="i-heroicons-magnifying-glass-20-solid" v-model="searchQuery" type="text" placeholder="Search" ref="searchInput" size="md" color="white" class="w-11/12 px-2 sm:w-1/3 mx-auto" />
                <div v-if="columns === false">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                        <div @click="setDns(record)" class="bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-900 cursor-pointer px-4 py-2 rounded overflow-hidden"
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
                            v-for="record in filteredRecords">
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
            columns: true,
            searchQuery: '',
        }
    },
    computed: {
        filteredRecords() {
            return this.dnsRecords.filter((record) => {
                return record.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || record.content.toLowerCase().includes(this.searchQuery.toLowerCase())
            })
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
        } else {
            this.$router.push('/')
        }
        window.addEventListener('resize', () => {
            if (window.innerWidth <= 900) {
                this.columns = false;
            }
            if (window.innerWidth > 900) {
                this.columns = true;
            }
        });
    },
    beforeDestroy() {
        window.removeEventListener('resize', () => {
            if (window.innerWidth < 800) {
                this.columns = false;
            }
        });
    },
    methods: {
        async getDns() {
            const toast = useToast()
            const response = await fetch('/api/records', {
            method: 'POST',
            body: JSON.stringify({
                apiKey: this.apiKey,
                currZone: this.currZone
            }),
        })
        if (response.ok) {
            const data = await response.json();
            if (data.success === false) {
                toast.add({
                        id: 'get-records-failed' + Date.now(),
                        title: 'Failed to get records',
                        description: data.errors[0].message,
                        icon: 'i-clarity-warning-solid',
                        timeout: 3000,
                        color: 'red'
                    })
                this.$router.push('/')
            }

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
        handleKeydown(event) {
            if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
                event.preventDefault();
                this.$nextTick(() => this.$refs.searchInput.focus());
            }
        },
        hideSearch() {
            this.showSearch = false;
        },
        setDns(record) {
            localStorage.setItem('cf-dns-id', record.id);
            localStorage.setItem('cf-dns-name', record.name);
            this.$router.push('/editor')
        },
        switchView() {
            this.columns = !this.columns
        },
        resetConfig() {
            localStorage.removeItem('cf-api-key');
            localStorage.removeItem('cf-zone-id');
            localStorage.removeItem('cf-zone-name');
            localStorage.removeItem('cf-dns-id');
            localStorage.removeItem('cf-dns-name');
            this.$router.push('/login')
    }
    }
}
</script>