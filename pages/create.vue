<template>
	<div>
		<Head>
			<Title>New</Title>
		</Head>
		<div class="w-full">
			<UButton
				@click="clearDns()"
				class="absolute left-8 top-4"
				variant="outline"
				icon="i-clarity-undo-line"
				to="/records"
			>
				Back
			</UButton>
			<div class="flex h-screen w-screen flex-col items-center justify-center" v-if="loading">
				<div>
					<svg
						class="h-12 w-12 animate-spin"
						xmlns="http://www.w3.org/2000/svg"
						width="32"
						height="32"
						viewBox="0 0 24 24"
					>
						<path
							fill="none"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 3a9 9 0 1 0 9 9"
						/>
					</svg>
				</div>
			</div>
			<div v-else class="flex flex-col items-center">
				<h1 class="mb-2 mt-6 text-center text-lg font-semibold">{{ dns.name }}</h1>
				<div class="m-4 flex w-full flex-col justify-center gap-4 rounded p-4 text-center md:w-3/4 full:w-1/2">
					<h2 class="mb-4 text-lg font-semibold">Create DNS Record</h2>
					<div class="mb-2 flex items-center justify-between" v-if="dns.type !== 'SRV'">
						<label for="name" class="mr-2 w-24">Name:</label>
						<input
							@keydown.enter="createDns()"
							id="name"
							type="text"
							v-model="dns.name"
							placeholder="Name (Required)"
							class="flex-grow rounded border border-gray-300 p-2"
						/>
					</div>
					<div class="mb-2 flex items-center justify-between">
						<label for="type-select" class="mr-2 w-24">Type:</label>
						<select
							id="type-select"
							v-model="dns.type"
							class="type-select flex-grow rounded border border-gray-300 p-2"
						>
							<option value="A">A</option>
							<option value="CNAME">CNAME</option>
							<option value="MX">MX</option>
							<option value="TXT">TXT</option>
							<option value="SRV">SRV</option>
						</select>
					</div>
					<div class="mb-2 flex items-center justify-between" v-if="dns.type !== 'SRV'">
						<label @click="toggleEndpoint = !toggleEndpoint" for="endpoint" class="mr-2 w-24 cursor-pointer"
							>Endpoint:</label
						>
						<input
							@keydown.enter="createDns()"
							v-if="!toggleEndpoint"
							id="endpoint"
							type="text"
							v-model="dns.content"
							placeholder="Endpoint"
							class="flex-grow rounded border border-gray-300 p-2"
						/>
						<textarea
							@keydown.enter="createDns()"
							v-else
							id="endpoint"
							v-model="dns.content"
							placeholder="Endpoint"
							class="flex-grow rounded border border-gray-300 p-2"
						></textarea>
					</div>
					<div class="mb-2 flex items-center justify-between" v-if="dns.type !== 'SRV'">
						<label for="ttl" class="mr-2 w-24">TTL:</label>
						<input
							@keydown.enter="createDns()"
							id="ttl"
							type="text"
							v-model="dns.ttl"
							placeholder="TTL (Leave blank or set to 1 for auto TTL)"
							class="flex-grow rounded border border-gray-300 p-2"
						/>
					</div>
					<div class="mb-2 flex items-center justify-start" v-if="dns.type === 'A' || 'CNAME' || 'SRV'">
						<label for="proxied" class="mr-2 w-24">Proxied:</label>
						<input
							@keydown.enter="createDns()"
							id="proxied"
							type="checkbox"
							v-model="dns.proxied"
							class="rounded border border-gray-300 p-2"
						/>
					</div>
					<div class="mb-2 flex items-center justify-between" v-if="dns.type === 'SRV'">
						<label for="priority" class="mr-2 w-24">Priority:</label>
						<input
							@keydown.enter="createDns()"
							id="priority"
							type="text"
							v-model="dns.priority"
							:placeholder="dns.type === 'SRV' ? '0' : 'Leave blank for auto priority'"
							class="flex-grow rounded border border-gray-300 p-2"
						/>
					</div>
					<div class="mb-2 flex items-center justify-between" v-if="dns.type === 'SRV'">
						<label for="service" class="mr-2 w-24">Service:</label>
						<input
							@keydown.enter="createDns()"
							id="service"
							type="text"
							v-model="dns.data.service"
							:placeholder="dns.type === 'SRV' ? '_minecraft' : 'Service'"
							class="flex-grow rounded border border-gray-300 p-2"
						/>
					</div>
					<div class="mb-2 flex items-center justify-between" v-if="dns.type === 'SRV'">
						<label for="proto" class="mr-2 w-24">Proto:</label>
						<input
							@keydown.enter="createDns()"
							id="proto"
							type="text"
							v-model="dns.data.proto"
							:placeholder="dns.type === 'SRV' ? '_tcp' : 'Proto'"
							class="flex-grow rounded border border-gray-300 p-2"
						/>
					</div>
					<div class="mb-2 flex items-center justify-between" v-if="dns.type === 'SRV'">
						<label for="domain" class="mr-2 w-24">Domain:</label>
						<input
							@keydown.enter="createDns()"
							id="domain"
							type="text"
							v-model="dns.data.name"
							:placeholder="dns.type === 'SRV' ? 'new.brth.uk' : 'Domain'"
							class="flex-grow rounded border border-gray-300 p-2"
						/>
					</div>
					<div class="mb-2 flex items-center justify-between" v-if="dns.type === 'SRV'">
						<label for="weight" class="mr-2 w-24">Weight:</label>
						<input
							@keydown.enter="createDns()"
							id="weight"
							type="text"
							v-model="dns.data.weight"
							:placeholder="dns.type === 'SRV' ? '0' : 'Leave blank for auto weight'"
							class="flex-grow rounded border border-gray-300 p-2"
						/>
					</div>
					<div class="mb-2 flex items-center justify-between" v-if="dns.type === 'SRV'">
						<label for="port" class="mr-2 w-24">Port:</label>
						<input
							@keydown.enter="createDns()"
							id="port"
							type="text"
							v-model="dns.data.port"
							:placeholder="dns.type === 'SRV' ? '25565' : 'Port'"
							class="flex-grow rounded border border-gray-300 p-2"
						/>
					</div>
					<div class="mb-2 flex items-center justify-between" v-if="dns.type === 'SRV'">
						<label for="target" class="mr-2 w-24">Target:</label>
						<input
							@keydown.enter="createDns()"
							id="target"
							type="text"
							v-model="dns.data.target"
							:placeholder="dns.type === 'SRV' ? 'home.brth.uk' : 'Target'"
							class="flex-grow rounded border border-gray-300 p-2"
						/>
					</div>

					<div class="mb-2 flex items-center justify-between">
						<label for="comment" class="mr-2 w-24">Comment:</label>
						<input
							@keydown.enter="createDns()"
							id="comment"
							type="text"
							v-model="dns.comment"
							placeholder="Comment"
							class="flex-grow rounded border border-gray-300 p-2"
						/>
					</div>
					<div>
						<UButton
							class="mt-4 px-6"
							color="green"
							variant="outline"
							:disabled="saving === 'progress'"
							:class="{ 'cursor-not-allowed bg-opacity-50': saving === 'progress' }"
							@click="createDns()"
							type="button"
							>Create</UButton
						>
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
			dns: {
				name: '',
				type: 'CNAME',
				content: '',
				ttl: '',
				proxied: true,
				comment: '',
				data: {
					weight: 0,
					port: 0,
					target: '',
					service: '',
					proto: '',
					name: '',
					priority: 0,
				},
			},
			loading: true,
			saving: '',
			toggleEndpoint: false,
		};
	},
	mounted() {
		this.apiKey = localStorage.getItem('cf-api-key');
		if (!this.apiKey) {
			this.$router.push('/login');
		}
		if (localStorage.getItem('cf-zone-id')) {
			this.currZone = localStorage.getItem('cf-zone-id');
			this.loading = false;
		} else {
			this.$router.push('/');
		}
	},
	methods: {
		async createDns() {
			this.saving = 'progress';
			if (this.dns.type === 'SRV') {
				this.dns.data = {
					weight: parseInt(this.dns.data.weight) || 0,
					port: parseInt(this.dns.data.port) || 25565,
					target: this.dns.data.target || '',
					service: this.dns.data.service || '_minecraft',
					proto: this.dns.data.proto || '_tcp',
					name: this.dns.data.name || '',
					priority: this.dns.priority || 0,
				};
				this.dns.content = `${this.dns.data.weight}\t${this.dns.data.port}\t${this.dns.data.target}`;
				console.log(this.dns);
			}
			const response = await fetch('/api/create_record', {
				method: 'POST',
				body: JSON.stringify({
					apiKey: this.apiKey,
					currZone: this.currZone,
					dns: this.dns,
				}),
			});
			if (response.ok) {
				const data = await response.json();
				const toast = useToast();
				if (data.success === true) {
					this.saving = 'success';
					toast.add({
						id: 'update-record-success' + Date.now(),
						title: 'Create success',
						description: 'Record created successfully',
						icon: 'i-clarity-check-circle-solid',
						timeout: 3000,
						color: 'green',
					});
					this.$router.push('/records');
				} else {
					this.saving = 'error';
					console.error(data.errors[0].message);
					toast.add({
						id: 'update-record-error' + Date.now(),
						title: 'Create failed',
						description: data.errors[0].message,
						icon: 'i-clarity-warning-solid',
						timeout: 3000,
						color: 'red',
					});
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
			localStorage.removeItem('cf-dns-id');
			localStorage.removeItem('cf-dns-name');
		},
	},
};
</script>
