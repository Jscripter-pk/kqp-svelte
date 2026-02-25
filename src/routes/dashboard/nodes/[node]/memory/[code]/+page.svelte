<script lang="ts">
    import { page } from "$app/stores";
    import { fetcher, endpoints } from "$lib/api";
    import Breadcrumb from "$lib/components/common/Breadcrumb.svelte";
    import { t } from "$lib/i18n";

    $: nodeId = $page.params.node;
    $: code = $page.params.code;

    let loading = true;
    let issueInfo: any = {};
    let ask: Record<string, any> = {};
    let bid: Record<string, any> = {};
    let sumAsk: any = { uni: 0, krx: 0, nxt: 0 };
    let sumBid: any = { uni: 0, krx: 0, nxt: 0 };
    let askKeys: string[] = [];
    let bidKeys: string[] = [];

    async function loadData() {
        loading = true;
        try {
            const [infoRes, quoteRes] = await Promise.all([
                fetcher(endpoints.nodes.issues.info(nodeId), {
                    params: { code },
                }) as Promise<any>,
                fetcher(endpoints.nodes.issues.quote(nodeId), {
                    params: { code },
                }) as Promise<any>,
            ]);

            issueInfo = infoRes?.data?.issueInfo ?? {};

            const orderBook = quoteRes?.data?.issueQuote?.order_book;
            ask = orderBook?.ask ?? {};
            bid = orderBook?.bid ?? {};

            sumAsk = ask.sum ?? { uni: 0, krx: 0, nxt: 0 };
            sumBid = bid.sum ?? { uni: 0, krx: 0, nxt: 0 };

            askKeys = Object.keys(ask)
                .filter((k) => k !== "sum")
                .sort((a, b) => Number(b) - Number(a));
            bidKeys = Object.keys(bid)
                .filter((k) => k !== "sum")
                .sort((a, b) => Number(a) - Number(b));
        } catch (e) {
            console.error($t.memory.errorLoading, e);
        }
        loading = false;
    }

    $: if (nodeId && code) loadData();

    function fmt(v: any): string {
        if (v == null) return "-";
        return typeof v === "number" ? v.toLocaleString() : String(v);
    }

    // Build the info table data
    $: infoTableRows = [
        { label: $t.memory.lastPrice, key: "last_price" },
        { label: $t.memory.lastVol, key: "last_vol" },
        { label: $t.memory.volAccum, key: "vol_accum" },
        { label: $t.memory.amtAccum, key: "amt_accum" },
    ];

    $: ohlRows = [
        { label: "Open", key: "open", icon: "open" },
        { label: "High", key: "high", icon: "high" },
        { label: "Low", key: "low", icon: "low" },
    ];
</script>

<Breadcrumb
    node={nodeId}
    pages={[
        { pageName: $t.memory.title, link: `/dashboard/nodes/${nodeId}/memory` },
        { pageName: issueInfo.name || code },
    ]}
/>

<div class="title-row">
    <h1 class="page-title">{issueInfo.name || "-"}</h1>
    {#if !loading}
        <button class="refresh-btn" on:click={loadData}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                ><path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M1.798 7C1.798 4.131 4.138 1.8 7.03 1.8c1.965 0 3.676 1.076 4.571 2.667H9.533a.533.533 0 000 1.067h3.333a.533.533 0 00.534-.534V1.667a.533.533 0 10-1.067 0v1.95C11.213 1.883 9.256.734 7.03.734 3.554.734.731 3.537.731 7.001c0 3.464 2.823 6.267 6.299 6.267 3.156 0 5.772-2.31 6.229-5.327a.533.533 0 10-1.055-.166C11.826 10.28 9.655 12.2 7.03 12.2 4.138 12.2 1.798 9.87 1.798 7z"
                    fill="currentColor"
                /></svg
            >
            {$t.common.refresh}
        </button>
    {/if}
</div>

{#if loading}
    <div class="loading-box"><span class="loading-spinner"></span></div>
{:else}
    <div class="detail-layout">
        <!-- LEFT: Issue Info + Info Table -->
        <div class="detail-left">
            <!-- Basic Info Card -->
            <div class="info-card">
                <div class="info-field">
                    <span class="info-lbl">{$t.memory.seq}</span><span class="info-val"
                        >{issueInfo.seq ?? "-"}</span
                    >
                </div>
                <div class="info-field">
                    <span class="info-lbl">{$t.memory.code}</span><span class="info-val"
                        >{issueInfo.code ?? "-"}</span
                    >
                </div>
                <div class="info-field">
                    <span class="info-lbl">{$t.memory.name}</span><span class="info-val"
                        >{issueInfo.name ?? "-"}</span
                    >
                </div>
                <div class="info-field">
                    <span class="info-lbl">{$t.memory.g1SsnId}</span><span
                        class="info-val"
                        >{Array.isArray(issueInfo.g1_ssn_id)
                            ? `[${issueInfo.g1_ssn_id.join(" / ")}]`
                            : (issueInfo.g1_ssn_id ?? "-")}</span
                    >
                </div>
                <div class="info-field">
                    <span class="info-lbl">{$t.memory.compet}</span><span class="info-val"
                        >{issueInfo.compet ?? "-"}</span
                    >
                </div>
            </div>

            <!-- Info Table (UNI/KRX/NXT) -->
            <div class="info-table">
                <!-- Header -->
                <div class="it-row it-header">
                    <div class="it-cell it-label-cell"></div>
                    <div class="it-cell it-val-cell">UNI</div>
                    <div class="it-cell it-val-cell">KRX</div>
                    <div class="it-cell it-val-cell">NXT</div>
                </div>

                {#each infoTableRows as row, i}
                    <div
                        class="it-row"
                        class:it-even={i % 2 === 0}
                        class:it-odd={i % 2 !== 0}
                    >
                        <div class="it-cell it-label-cell">{row.label}</div>
                        <div class="it-cell it-val-cell">
                            {fmt(issueInfo[row.key]?.uni)}
                        </div>
                        <div class="it-cell it-val-cell">
                            {fmt(issueInfo[row.key]?.krx)}
                        </div>
                        <div class="it-cell it-val-cell">
                            {fmt(issueInfo[row.key]?.nxt)}
                        </div>
                    </div>
                {/each}

                <div class="it-divider"></div>

                <!-- Open -->
                <div class="it-row it-even">
                    <div class="it-cell it-label-cell">
                        <span class="ohl-icon ohl-open"></span> {$t.memory.open}
                    </div>
                    <div class="it-cell it-val-cell">
                        {fmt(issueInfo.open?.uni)}
                    </div>
                    <div class="it-cell it-val-cell">
                        {fmt(issueInfo.open?.krx)}
                    </div>
                    <div class="it-cell it-val-cell">
                        {fmt(issueInfo.open?.nxt)}
                    </div>
                </div>

                <!-- High -->
                <div class="it-row it-odd">
                    <div class="it-cell it-label-cell">
                        <span class="ohl-icon ohl-high">▲</span> {$t.memory.high}
                    </div>
                    <div class="it-cell it-val-cell">
                        <span class="high-val"
                            >▲ {fmt(issueInfo.high?.uni)}</span
                        >
                    </div>
                    <div class="it-cell it-val-cell">
                        <span class="high-val"
                            >▲ {fmt(issueInfo.high?.krx)}</span
                        >
                    </div>
                    <div class="it-cell it-val-cell">
                        <span class="high-val"
                            >▲ {fmt(issueInfo.high?.nxt)}</span
                        >
                    </div>
                </div>

                <!-- Low -->
                <div class="it-row it-even">
                    <div class="it-cell it-label-cell">
                        <span class="ohl-icon ohl-low">▼</span> {$t.memory.low}
                    </div>
                    <div class="it-cell it-val-cell">
                        <span class="low-val">▼ {fmt(issueInfo.low?.uni)}</span>
                    </div>
                    <div class="it-cell it-val-cell">
                        <span class="low-val">▼ {fmt(issueInfo.low?.krx)}</span>
                    </div>
                    <div class="it-cell it-val-cell">
                        <span class="low-val">▼ {fmt(issueInfo.low?.nxt)}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- RIGHT: Order Book (Ask + Bid) -->
        <div class="detail-right">
            <div class="card" style="padding:0;overflow:auto;">
                <table>
                    <thead>
                        <tr>
                            <th style="text-align:right">No</th>
                            <th style="text-align:right">{$t.memory.price}</th>
                            <th style="text-align:right">UNI</th>
                            <th style="text-align:right">KRX</th>
                            <th style="text-align:right">NXT</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Ask Sum Row -->
                        <tr class="sum-row-ask">
                            <td></td><td></td>
                            <td style="text-align:right"
                                ><span class="ask-sum">{fmt(sumAsk.uni)}</span
                                ></td
                            >
                            <td style="text-align:right"
                                ><span class="ask-sum">{fmt(sumAsk.krx)}</span
                                ></td
                            >
                            <td style="text-align:right"
                                ><span class="ask-sum">{fmt(sumAsk.nxt)}</span
                                ></td
                            >
                        </tr>

                        <!-- Ask Rows -->
                        {#each askKeys as key}
                            <tr>
                                <td style="text-align:right">{key}</td>
                                <td style="text-align:right"
                                    ><span class="price-ask"
                                        >{fmt(ask[key]?.price)}</span
                                    ></td
                                >
                                <td style="text-align:right"
                                    >{fmt(ask[key]?.uni)}</td
                                >
                                <td style="text-align:right"
                                    >{fmt(ask[key]?.krx)}</td
                                >
                                <td style="text-align:right"
                                    >{fmt(ask[key]?.nxt)}</td
                                >
                            </tr>
                        {/each}

                        <!-- Separator -->
                        <tr class="separator-row"><td colspan="5"></td></tr>

                        <!-- Bid Rows -->
                        {#each bidKeys as key}
                            <tr>
                                <td style="text-align:right">{key}</td>
                                <td style="text-align:right"
                                    ><span class="price-bid"
                                        >{fmt(bid[key]?.price)}</span
                                    ></td
                                >
                                <td style="text-align:right"
                                    >{fmt(bid[key]?.uni)}</td
                                >
                                <td style="text-align:right"
                                    >{fmt(bid[key]?.krx)}</td
                                >
                                <td style="text-align:right"
                                    >{fmt(bid[key]?.nxt)}</td
                                >
                            </tr>
                        {/each}

                        <!-- Bid Sum Row -->
                        <tr class="sum-row-bid">
                            <td></td><td></td>
                            <td style="text-align:right"
                                ><span class="bid-sum">{fmt(sumBid.uni)}</span
                                ></td
                            >
                            <td style="text-align:right"
                                ><span class="bid-sum">{fmt(sumBid.krx)}</span
                                ></td
                            >
                            <td style="text-align:right"
                                ><span class="bid-sum">{fmt(sumBid.nxt)}</span
                                ></td
                            >
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
{/if}

<style>
    .loading-box {
        display: flex;
        justify-content: center;
        padding: 60px;
    }

    .title-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-bottom: 24px;
    }
    .title-row .page-title {
        margin: 16px 0 0;
    }
    .refresh-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 6px;
        padding: 6px 12px;
        color: var(--text-primary);
        font-size: 13px;
        cursor: pointer;
    }
    .refresh-btn:hover {
        background: var(--row-hover);
    }

    /* Layout */
    .detail-layout {
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
    }
    @media (min-width: 1200px) {
        .detail-layout {
            grid-template-columns: 1fr 2fr;
        }
    }

    /* ===== LEFT: Info ===== */
    .info-card {
        background: linear-gradient(180deg, #202838 80%, #373f4e 100%);
        border: 1px solid #4e576a;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 8px;
    }
    .info-field {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 8px;
    }
    .info-field:last-child {
        margin-bottom: 0;
    }
    .info-lbl {
        color: #d1d6e0;
        font-size: 15px;
        width: 150px;
        flex-shrink: 0;
    }
    .info-val {
        color: #f0f1f5;
        font-size: 17px;
        font-weight: 500;
    }

    /* Info Table */
    .info-table {
        border-radius: 8px;
        overflow: hidden;
    }
    .it-row {
        display: flex;
        align-items: center;
        height: 60px;
    }
    .it-header {
        height: 32px;
        background: #667085;
    }
    .it-header .it-val-cell {
        color: #f0f1f5;
        font-weight: 400;
    }
    .it-even {
        background: #202838;
    }
    .it-odd {
        background: #141c2a;
    }
    .it-cell {
        flex: 1;
        padding: 0 12px;
        font-size: 15px;
    }
    .it-label-cell {
        color: #8892a4;
        display: flex;
        align-items: center;
        gap: 6px;
    }
    .it-val-cell {
        text-align: right;
        color: #8892a4;
    }
    .it-divider {
        height: 8px;
        background: #0a0e15;
    }

    /* OHL icons */
    .ohl-icon {
        display: inline-flex;
        width: 16px;
        height: 16px;
        border-radius: 4px;
        align-items: center;
        justify-content: center;
        font-size: 8px;
    }
    .ohl-open {
        background: #ddf4da;
        color: #00a41e;
    }
    .ohl-high {
        background: #ffd8d8;
        color: #f01b3e;
    }
    .ohl-low {
        background: #c7dbff;
        color: #5e66ff;
    }

    .high-val {
        color: #ff3d4a;
        font-size: 13px;
    }
    .low-val {
        color: #5e66ff;
        font-size: 13px;
    }

    /* ===== RIGHT: Order Book ===== */
    .sum-row-ask {
        background: #212447 !important;
    }
    .sum-row-ask td {
        border: none;
    }
    .ask-sum {
        font-weight: 500;
        color: #7aa2ff;
    }

    .sum-row-bid {
        background: #331b1e !important;
    }
    .sum-row-bid td {
        border: none;
    }
    .bid-sum {
        font-weight: 500;
        color: #ff8882;
    }

    .price-ask {
        background: #212447;
        border: 1px solid #1d2654;
        color: #7aa2ff;
        padding: 2px 4px;
        border-radius: 2px;
        font-size: 13px;
    }
    .price-bid {
        background: #331b1e;
        border: 1px solid #4a2c31;
        color: #ff8882;
        padding: 2px 4px;
        border-radius: 2px;
        font-size: 13px;
    }

    .separator-row td {
        background: #0a0e15;
        height: 8px;
        padding: 0;
        border: none;
    }
</style>
