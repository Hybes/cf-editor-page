<template>
  <div>
    <Head>
      <Title>Rules</Title>
    </Head>
    <div class="w-full">
      <div class="flex flex-row flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-8">
        <div class="flex flex-row flex-wrap justify-center gap-4">
          <UButton variant="outline" icon="i-clarity-undo-line" :to="`/zones/${zoneId}/records`">
            Back to Records
          </UButton>
        </div>
      </div>

      <div class="flex flex-col items-center justify-center gap-6 px-4 md:px-8">
        <div class="flex w-full max-w-7xl flex-col gap-4">
          <div class="flex flex-col items-center justify-center gap-2">
            <h1 class="text-center text-2xl font-semibold text-stone-900 dark:text-stone-100">{{ zoneName }}</h1>
            <p class="text-sm text-stone-600 dark:text-stone-400">View rulesets rules by phase and add bypass-token skip rules</p>
          </div>

          <div class="flex w-full flex-wrap gap-4 rounded-lg border border-stone-300 p-4 dark:border-stone-700">
            <div class="flex min-w-[220px] flex-col gap-1">
              <span class="text-sm font-medium text-stone-700 dark:text-stone-200">Phase</span>
              <USelect v-model="selectedPhase" :options="phaseOptions" class="w-full" />
            </div>

            <div class="flex min-w-[280px] flex-1 flex-col gap-1">
              <span class="text-sm font-medium text-stone-700 dark:text-stone-200">Ruleset</span>
              <USelectMenu
                v-model="selectedRulesetId"
                :options="rulesetOptions"
                value-attribute="value"
                option-attribute="label"
                placeholder="Select a ruleset"
                class="w-full"
              />
            </div>

            <div class="flex items-end">
              <UButton variant="outline" color="blue" icon="i-heroicons-arrow-path" :loading="loadingRulesets" @click="refreshRulesets">
                Refresh
              </UButton>
            </div>
          </div>

          <div class="w-full rounded-lg border border-stone-300 dark:border-stone-700">
            <UTable :rows="rulesRows" :columns="rulesColumns" :loading="loadingRules" />
          </div>

          <div class="w-full max-w-7xl rounded-xl border border-stone-300 p-6 shadow-sm dark:border-stone-700">
            <h2 class="mb-4 text-lg font-semibold text-stone-900 dark:text-stone-100">Add bypass-token skip rule</h2>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="flex flex-col gap-1">
                <span class="text-sm font-medium text-stone-700 dark:text-stone-200">Bypass token</span>
                <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <UInput v-model="bypassToken" placeholder="Token value" class="flex-1" />
                  <div class="flex gap-2">
                    <UButton
                      variant="outline"
                      color="blue"
                      icon="i-heroicons-key"
                      @click="generateToken"
                    >
                      Generate token
                    </UButton>
                    <UButton
                      variant="outline"
                      color="gray"
                      icon="i-clarity-clipboard-line"
                      :disabled="!bypassToken"
                      @click="copyToken"
                    >
                      Copy token
                    </UButton>
                  </div>
                </div>
              </div>

              <div class="flex flex-col gap-1">
                <span class="text-sm font-medium text-stone-700 dark:text-stone-200">Description</span>
                <UInput v-model="description" placeholder="Allow Rules" />
              </div>
            </div>

            <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="flex flex-col gap-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-stone-700 dark:text-stone-200">Skip current ruleset</span>
                  <UToggle v-model="skipCurrentRuleset" />
                </div>

                <div class="flex flex-col gap-1">
                  <span class="text-sm font-medium text-stone-700 dark:text-stone-200">Skip phases</span>
                  <USelectMenu v-model="skipPhases" :options="phaseOptions" multiple placeholder="Select phases" />
                </div>

                <div class="flex flex-col gap-1">
                  <span class="text-sm font-medium text-stone-700 dark:text-stone-200">Skip products</span>
                  <USelectMenu v-model="skipProducts" :options="productOptions" multiple placeholder="Select products" />
                </div>
              </div>

              <div class="flex flex-col gap-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-stone-700 dark:text-stone-200">Enabled</span>
                  <UToggle v-model="enabled" />
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-stone-700 dark:text-stone-200">Logging</span>
                  <UToggle v-model="loggingEnabled" />
                </div>

                <div class="flex flex-col gap-1">
                  <span class="text-sm font-medium text-stone-700 dark:text-stone-200">Expression preview</span>
                  <UInput :model-value="expressionPreview" disabled />
                </div>
              </div>
            </div>

            <div class="mt-6 flex flex-wrap gap-3">
              <UButton
                color="green"
                variant="outline"
                icon="i-clarity-plus-circle-solid"
                :disabled="!canSubmit"
                :loading="creating"
                @click="createRule"
              >
                Add Rule
              </UButton>
              <UButton variant="outline" color="gray" icon="i-clarity-clipboard-line" :disabled="!expressionPreview" @click="copyExpression">
                Copy expression
              </UButton>
            </div>

            <div v-if="!selectedRulesetId" class="mt-4 text-sm text-stone-600 dark:text-stone-400">
              Select a ruleset to enable rule creation.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const router = useRouter();
const toast = useToast();

const zoneId = computed(() => route.params.zone_id);
const apiKey = ref('');
const zoneName = ref(localStorage.getItem('cf-zone-name') || '');

const phaseOptions = [
  'http_ratelimit',
  'http_request_firewall_custom',
  'http_request_firewall_managed',
  'http_request_sbfm',
  'http_request_late_transform',
  'http_request_sanitize',
  'http_request_transform',
  'http_response_compression',
  'http_response_headers_transform',
];

const productOptions = ['zoneLockdown', 'uaBlock', 'hot', 'bic', 'securityLevel', 'rateLimit'];

const selectedPhase = ref('http_request_firewall_managed');
const rulesets = ref([]);
const selectedRulesetId = ref('');

const rulesetOptions = computed(() => {
  const filtered = (rulesets.value || []).filter((r) => r && r.phase === selectedPhase.value);
  return filtered.map((r) => ({
    label: `${r.name || 'ruleset'} (${r.kind || 'unknown'})`,
    value: r.id,
  }));
});

const loadingRulesets = ref(false);
const loadingRules = ref(false);
const rulesRows = ref([]);

const rulesColumns = [
  { key: 'enabled', label: 'Enabled' },
  { key: 'action', label: 'Action' },
  { key: 'description', label: 'Description' },
  { key: 'logging', label: 'Logging' },
  { key: 'expression', label: 'Expression' },
  { key: 'id', label: 'ID' },
];

const refreshRulesets = async () => {
  loadingRulesets.value = true;
  try {
    const res = await fetch('/api/rulesets', {
      method: 'POST',
      body: JSON.stringify({
        apiKey: apiKey.value,
        currZone: zoneId.value,
      }),
    });

    const data = await res.json();
    if (!data.success) {
      toast.add({
        id: 'rulesets-error' + Date.now(),
        title: 'Failed to load rulesets',
        description: data.errors?.[0]?.message || 'Unknown error',
        icon: 'i-clarity-warning-solid',
        timeout: 4000,
        color: 'red',
      });
      return;
    }

    rulesets.value = data.result || [];

    const candidates = (rulesets.value || []).filter((r) => r && r.phase === selectedPhase.value);
    const zoneCandidate = candidates.find((r) => r.kind === 'zone');
    selectedRulesetId.value = (zoneCandidate || candidates[0] || {}).id || '';
  } catch (e) {
    toast.add({
      id: 'rulesets-error' + Date.now(),
      title: 'Failed to load rulesets',
      description: e.message || 'Unknown error',
      icon: 'i-clarity-warning-solid',
      timeout: 4000,
      color: 'red',
    });
  } finally {
    loadingRulesets.value = false;
  }
};

const refreshRules = async () => {
  if (!selectedRulesetId.value) {
    rulesRows.value = [];
    return;
  }

  loadingRules.value = true;
  try {
    const res = await fetch('/api/ruleset', {
      method: 'POST',
      body: JSON.stringify({
        apiKey: apiKey.value,
        currZone: zoneId.value,
        rulesetId: selectedRulesetId.value,
      }),
    });

    const data = await res.json();
    if (!data.success) {
      toast.add({
        id: 'ruleset-error' + Date.now(),
        title: 'Failed to load rules',
        description: data.errors?.[0]?.message || 'Unknown error',
        icon: 'i-clarity-warning-solid',
        timeout: 4000,
        color: 'red',
      });
      return;
    }

    const rules = data.result?.rules || [];
    rulesRows.value = rules.map((r) => ({
      id: r.id,
      enabled: r.enabled,
      action: r.action,
      description: r.description || '',
      logging: r.logging?.enabled === true ? 'on' : r.logging?.enabled === false ? 'off' : '',
      expression: r.expression || '',
    }));
  } catch (e) {
    toast.add({
      id: 'ruleset-error' + Date.now(),
      title: 'Failed to load rules',
      description: e.message || 'Unknown error',
      icon: 'i-clarity-warning-solid',
      timeout: 4000,
      color: 'red',
    });
  } finally {
    loadingRules.value = false;
  }
};

watch(selectedPhase, async () => {
  await refreshRulesets();
  await refreshRules();
});

watch(selectedRulesetId, async () => {
  await refreshRules();
});

const bypassToken = ref('');
const description = ref('Allow Rules');
const enabled = ref(true);
const loggingEnabled = ref(true);

const skipCurrentRuleset = ref(true);
const skipPhases = ref([...phaseOptions]);
const skipProducts = ref([...productOptions]);

const expressionPreview = computed(() => {
  if (!bypassToken.value) return '';
  return `(any(http.request.headers["x-cf-bypass-token"][*] eq "${bypassToken.value}"))`;
});

const canSubmit = computed(() => {
  return Boolean(apiKey.value && zoneId.value && selectedRulesetId.value && bypassToken.value);
});

const creating = ref(false);

const createRule = async () => {
  if (!canSubmit.value) return;
  creating.value = true;
  try {
    const actionParameters = {};
    if (skipCurrentRuleset.value) actionParameters.ruleset = 'current';
    if (skipPhases.value && skipPhases.value.length) actionParameters.phases = skipPhases.value;
    if (skipProducts.value && skipProducts.value.length) actionParameters.products = skipProducts.value;

    const res = await fetch('/api/create_skip_rule', {
      method: 'POST',
      body: JSON.stringify({
        apiKey: apiKey.value,
        currZone: zoneId.value,
        rulesetId: selectedRulesetId.value,
        bypassToken: bypassToken.value,
        description: description.value,
        enabled: enabled.value,
        loggingEnabled: loggingEnabled.value,
        actionParameters,
      }),
    });

    const data = await res.json();
    if (!data.success) {
      toast.add({
        id: 'create-skip-rule-error' + Date.now(),
        title: 'Failed to create rule',
        description: data.errors?.[0]?.message || 'Unknown error',
        icon: 'i-clarity-warning-solid',
        timeout: 5000,
        color: 'red',
      });
      return;
    }

    toast.add({
      id: 'create-skip-rule-success' + Date.now(),
      title: 'Rule created',
      description: 'Skip rule added successfully',
      icon: 'i-clarity-check-circle-solid',
      timeout: 3000,
      color: 'green',
    });

    await refreshRules();
  } catch (e) {
    toast.add({
      id: 'create-skip-rule-error' + Date.now(),
      title: 'Failed to create rule',
      description: e.message || 'Unknown error',
      icon: 'i-clarity-warning-solid',
      timeout: 5000,
      color: 'red',
    });
  } finally {
    creating.value = false;
  }
};

const copyExpression = async () => {
  if (!expressionPreview.value) return;
  await navigator.clipboard.writeText(expressionPreview.value);
  toast.add({
    id: 'copy-expression' + Date.now(),
    title: 'Copied',
    description: 'Expression copied to clipboard',
    icon: 'i-clarity-check-circle-solid',
    timeout: 2500,
    color: 'green',
  });
};

const generateToken = () => {
  const bytes = new Uint8Array(64);
  crypto.getRandomValues(bytes);
  bypassToken.value = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

const copyToken = async () => {
  if (!bypassToken.value) return;
  await navigator.clipboard.writeText(bypassToken.value);
  toast.add({
    id: 'copy-token' + Date.now(),
    title: 'Copied',
    description: 'Token copied to clipboard',
    icon: 'i-clarity-check-circle-solid',
    timeout: 2500,
    color: 'green',
  });
};

onMounted(async () => {
  apiKey.value = localStorage.getItem('cf-api-key');
  if (!apiKey.value) {
    router.push('/login');
    return;
  }

  await refreshRulesets();
  await refreshRules();
});
</script>


