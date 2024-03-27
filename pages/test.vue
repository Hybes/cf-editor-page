<template>
	<div class="flex flex-col items-center justify-center gap-2">
		<RecordsCNAME />
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
			dns: {},
			loading: true,
			saving: false,
		};
	},
	mounted() {
		this.apiKey = localStorage.getItem('cf-api-key');
		if (!this.apiKey) {
			this.$router.push('/login');
		}
		if (localStorage.getItem('cf-dns-id') && localStorage.getItem('cf-zone-id')) {
			this.currZone = localStorage.getItem('cf-zone-id');
			this.currDns = localStorage.getItem('cf-dns-id');
			this.currDnsName = localStorage.getItem('cf-dns-name');
			this.getDns();
		} else {
			this.$router.push('/');
		}
	},
	methods: {
		async getDns() {
			const response = await fetch('/api/dns_record', {
				method: 'POST',
				body: JSON.stringify({
					apiKey: this.apiKey,
					currZone: this.currZone,
					currDnsRecord: this.currDns,
				}),
			});
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
			if (this.dns.type === 'MX' || this.dns.type === 'SRV') {
				this.dns.priority = parseInt(this.dns.priority);
			}
			if (this.dns.ttl === '') {
				this.dns.ttl = 1;
			}
			if (this.dns.type === 'SRV') {
				const contentParts = this.dns.content.split('\t');
				const parts = this.dns.name.split('.');
				const service = parts[0].substring(1); // Removes leading '_'
				const proto = parts[1].substring(1); // Removes leading '_'
				const domain = parts.slice(2).join('.');
				if (contentParts.length === 3 && service && proto && domain) {
					this.dns.data = {
						weight: parseInt(contentParts[0], 10),
						port: parseInt(contentParts[1], 10),
						target: contentParts[2],
						service: '_' + service,
						proto: '_' + proto,
						name: domain,
						priority: this.dns.priority,
					};
				} else {
					const toast = useToast();
					toast.add({
						id: 'invalid-srv-format' + Date.now(),
						title: 'Invalid SRV Record Format',
						description: 'Expected format: "weight port target"',
						icon: 'i-clarity-warning-solid',
						timeout: 3000,
						color: 'red',
					});
				}
			}
			const response = await fetch('/api/update_record', {
				method: 'POST',
				body: JSON.stringify({
					apiKey: this.apiKey,
					currZone: this.currZone,
					currDnsRecord: this.currDns,
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
						title: 'Update success',
						description: 'Record updated successfully',
						icon: 'i-clarity-check-circle-solid',
						timeout: 3000,
						color: 'green',
					});
					setTimeout(() => {
						this.saving = '';
					}, 3000);
				} else {
					this.saving = 'error';
					console.error(data.errors[0].message);
					toast.add({
						id: 'update-record-error' + Date.now(),
						title: 'Update failed',
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
		async delDns(record) {
			const toast = useToast();
			const response = await fetch('/api/delete_record', {
				method: 'POST',
				body: JSON.stringify({
					apiKey: this.apiKey,
					currZone: this.currZone,
					currDnsRecord: record.id,
				}),
			});
			if (response.ok) {
				const data = await response.json();
				if (data.success) {
					this.$router.push('/records');
					toast.add({
						id: 'delete-record-success' + Date.now(),
						title: 'Delete success',
						description: 'Record deleted successfully',
						icon: 'i-clarity-check-circle-solid',
						timeout: 3000,
						color: 'green',
					});
				}
			} else {
				console.error('HTTP-Error: ' + response.status);
			}
		},
		preDel(record) {
			const toast = useToast();
			toast.add({
				id: 'delete-record' + Date.now(),
				title: 'Delete record',
				description: 'Are you sure you want to delete this record?',
				icon: 'i-clarity-warning-solid',
				timeout: 3000,
				color: 'red',
				actions: [
					{
						label: 'Delete',
						color: 'red',
						click: () => {
							this.delDns(record);
							toast.remove('delete-record' + Date.now());
						},
					},
					{
						label: 'Cancel',
						color: 'white',
						click: () => {
							toast.remove('delete-record' + Date.now());
						},
					},
				],
			});
		},
		clearDns() {
			localStorage.removeItem('cf-dns-id');
			localStorage.removeItem('cf-dns-name');
		},
	},
};
</script>
