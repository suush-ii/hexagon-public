<script lang="ts">
	import { onMount } from 'svelte'
	import Chart, { type ChartItem } from 'chart.js/auto'
	import 'chartjs-adapter-date-fns'
	import { formatCompactNumber } from '$lib/utils'

	export let volumehistory: any

	let portfolio: HTMLCanvasElement
	$: data = {
		datasets: [
			{
				label: 'sales',
				data: volumehistory
			}
		]
	}

	function getMax() {
		let max = 0
		data.datasets.forEach((dataset) => {
			const maxInDataset = Math.max(...dataset.data.map((point: { y: number }) => point.y))
			max = Math.max(max, maxInDataset)
		})

		return max
	}

	$: config = {
		type: 'bar',
		data: data,
		options: {
			plugins: {
				legend: {
					display: false
				},
				tooltip: {
					callbacks: {
						title: function () {
							return ''
						},
						label: function (context: any) {
							return `${formatCompactNumber(context.parsed.y, false)}`
						}
					},
					displayColors: false,
					bodyFont: {
						size: 16
					}
				}
			},
			scales: {
				x: {
					type: 'timeseries',
					time: {
						unit: 'day'
					},
					ticks: {
						display: false
					}
				},
				y: {
					max: getMax(),
					ticks: {
						display: false
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

<canvas bind:this={portfolio} width={180} height={20} />
