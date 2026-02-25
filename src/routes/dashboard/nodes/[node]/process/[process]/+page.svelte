<script lang="ts">
    import { page } from "$app/stores";
    import { fetcher, endpoints } from "$lib/api";
    import Breadcrumb from "$lib/components/common/Breadcrumb.svelte";
    import { t } from "$lib/i18n";

    $: nodeId = $page.params.node;
    $: processName = decodeURIComponent($page.params.process);

    let loading = true;
    let error = "";
    let processItem: any = null;
    let layoutDef = "";

    async function loadData() {
        loading = true;
        error = "";
        try {
            const res = (await fetcher(
                endpoints.dashboard.processDetail(nodeId, processName),
            )) as any;
            processItem = res?.data?.item ?? null;
            layoutDef = res?.data?.item?.layout_def ?? "";
        } catch (e) {
            error = String(e);
        }
        loading = false;
    }

    $: if (nodeId && processName) loadData();

    // Simple syntax coloring for the layout definition
    function highlightSyntax(text: string): string {
        if (!text) return "";
        return (
            text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                // Comments
                .replace(/(#.*)/g, '<span class="hl-comment">$1</span>')
                // Section headers [...]
                .replace(/^(\[.*\])/gm, '<span class="hl-section">$1</span>')
                // Key = value
                .replace(
                    /^(\s*\w[\w_]*)(\s*=\s*)(.*)/gm,
                    '<span class="hl-key">$1</span><span class="hl-eq">$2</span><span class="hl-val">$3</span>',
                )
        );
    }
</script>

<Breadcrumb
    node={nodeId}
    pages={[
        { pageName: $t.process.title, link: `/dashboard/nodes/${nodeId}/process` },
        { pageName: processName },
    ]}
/>

<h1 class="page-title">{$t.process.detailTitle}{processName}</h1>

<!-- Process Info Table -->
<div class="card proc-table-card">
    {#if loading}
        <div class="center-pad"><span class="loading-spinner"></span></div>
    {:else if error}
        <div class="center-pad error-text">{$t.process.errorFetching}</div>
    {:else if !processItem}
        <div class="center-pad muted-text">{$t.process.notFound}</div>
    {:else}
        <table>
            <thead>
                <tr>
                    <th></th>
                    <th>{$t.process.processName}</th>
                    <th></th>
                    <th>{$t.common.timestamp}</th>
                    <th style="text-align:right">{$t.process.cpu}</th>
                    <th style="text-align:right">{$t.process.mem}</th>
                    <th></th>
                    <th style="text-align:right">{$t.common.description}</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td></td>
                    <td>{processItem.name}</td>
                    <td></td>
                    <td>{processItem.timestamp}</td>
                    <td style="text-align:right">{processItem.cpu}</td>
                    <td style="text-align:right"
                        >{Number(processItem.mem).toLocaleString()}</td
                    >
                    <td></td>
                    <td style="text-align:right">{processItem.desc ?? ""}</td>
                </tr>
            </tbody>
        </table>
    {/if}
</div>

<!-- Process Definition / Layout Script -->
<div class="script-panel">
    <div class="script-header">{$t.process.definition}</div>
    <div class="script-body">
        {#if loading}
            <div class="center-pad"><span class="loading-spinner"></span></div>
        {:else if layoutDef}
            <pre class="script-code">{@html highlightSyntax(layoutDef)}</pre>
        {:else}
            <pre
                class="script-code muted-text">{$t.process.noDefinition}</pre>
        {/if}
    </div>
</div>

<style>
    .proc-table-card {
        padding: 0;
        overflow: auto;
        margin-bottom: 16px;
    }
    .center-pad {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 40px;
    }
    .error-text {
        color: var(--error, #ff5630);
    }
    .muted-text {
        color: var(--text-muted, #667085);
    }

    /* Script Panel */
    .script-panel {
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid var(--border-color, #2e3649);
    }
    .script-header {
        background: #667085;
        padding: 12px 16px;
        font-weight: 600;
        font-size: 15px;
        color: #d1d6e0;
        border-radius: 8px 8px 0 0;
    }
    .script-body {
        background: #202838;
        min-height: calc(100vh - 380px);
        max-height: calc(100vh - 48px);
        overflow-y: auto;
        padding: 0;
    }
    .script-code {
        margin: 0;
        padding: 16px;
        font-family: "Fira Code", "Consolas", "Monaco", monospace;
        font-size: 13px;
        line-height: 1.6;
        color: #afb7c8;
        white-space: pre-wrap;
        word-wrap: break-word;
    }

    /* Syntax highlighting */
    .script-code :global(.hl-comment) {
        color: #6a737d;
        font-style: italic;
    }
    .script-code :global(.hl-section) {
        color: #79b8ff;
        font-weight: 600;
    }
    .script-code :global(.hl-key) {
        color: #b392f0;
    }
    .script-code :global(.hl-eq) {
        color: #6a737d;
    }
    .script-code :global(.hl-val) {
        color: #9ecbff;
    }
</style>
