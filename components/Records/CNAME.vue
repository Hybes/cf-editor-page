<template>
	<div class="flex w-full flex-col gap-2">
		<h2 class="pt-8 text-center text-lg font-bold">CNAME Record ({{ data ? data.record : 'New' }})</h2>
		<div v-for="(t, i) in types" :key="i" class="mx-auto flex w-1/2 flex-row items-center justify-start gap-1 px-2">
			<label v-if="t.type === 'checkbox'" :for="t.name">{{ t.name }}</label>
			<input
				v-if="t.type === 'checkbox'"
				:type="t.type"
				:id="t.name"
				:name="t.name"
				:checked="t.default"
				class="rounded border border-gray-300 p-2"
			/>
			<div v-else class="flex w-full flex-col">
				<label :for="t.name">{{ t.name }}:</label>
				<input
					:type="t.type"
					:id="t.name"
					:name="t.name"
					:required="t.required"
					:placeholder="t.placeholder"
					class="w-full rounded border border-gray-300 p-2"
				/>
			</div>
		</div>
	</div>
</template>

<script setup>
const props = defineProps({
	data: {
		type: Object,
		required: false,
		default: '',
	},
});

const types = ref({
	name: {
		type: 'text',
		name: 'Name',
		required: true,
		placeholder: 'new.brth.uk',
		default: '',
	},
	target: {
		type: 'text',
		name: 'Target',
		required: true,
		placeholder: 'dev.brth.uk',
		default: 'dev.brth.uk',
	},
	ttl: {
		type: 'number',
		name: 'TTL',
		required: true,
		placeholder: '1',
		default: 1,
	},
	proxied: {
		type: 'checkbox',
		name: 'Proxied',
		required: true,
		default: true,
	},
	comment: {
		type: 'text',
		name: 'Comment',
		required: false,
		placeholder: 'Added via API on ' + new Date().toLocaleString(),
		default: 'Added via API on ' + new Date().toLocaleString(),
	},
});
</script>
