<script lang="ts">
	import { onMount } from 'svelte'
	import Chart, { type ChartItem } from 'chart.js/auto'
	import { formatCompactNumber } from '$lib/utils'

	export let labels: any

	export let usersData: any

	let portfolio: HTMLCanvasElement
	$: data = {
		labels: labels,
		datasets: [
			{
				data: usersData
			}
		]
	}

	$: config = {
		type: 'doughnut',
		data: data,
		options: {
			plugins: {
				legend: {
					display: false
				},
				tooltip: {
					callbacks: {
						label: function (context: any) {
							return `${formatCompactNumber(context.parsed, false)}`
						}
					},
					displayColors: false,
					bodyFont: {
						size: 16
					}
				}
			}
		}
	}
	onMount(() => {
		const ctx = portfolio.getContext('2d')
		// Initialize chart using default config set
		var myChart = new Chart(ctx as ChartItem, config as any)
	})
</script>

<canvas bind:this={portfolio} width={180} height={180} />
