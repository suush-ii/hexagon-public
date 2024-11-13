<script lang="ts">
	import { onMount } from 'svelte'
	import Chart, { type ChartItem } from 'chart.js/auto'
	import 'chartjs-adapter-date-fns'
	import { formatCompactNumber } from '$lib/utils'

	export let signupHistory: any

	let portfolio: HTMLCanvasElement
	$: data = {
		datasets: [
			{
				label: 'Registrations',
				data: signupHistory,
				tension: 0.1,
				spanGaps: true,
				fill: false
			}
		]
	}

	function getMax() {
		let max = 0
		data.datasets.forEach((dataset) => {
			const maxInDataset = Math.max(...dataset.data.map((point: { y: number }) => point.y))
			max = Math.max(max, maxInDataset)
		})

		return max + max
	}

	$: config = {
		type: 'line',
		data: data,
		options: {
			hover: {
				mode: 'nearest',
				intersect: true
			},
			plugins: {
				legend: {
					display: true,
					position: 'chartArea',
					align: 'start',
					onClick: null,
					labels: {
						padding: 24,
						boxHeight: 16,
						boxWidth: 20,
						color: '#fff',
						font: {
							size: 16
						}
					}
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
					},
					mode: 'index',
					intersect: false
				}
			},
			scales: {
				x: {
					type: 'timeseries',
					time: {
						unit: 'day'
					},
					grid: {
						color: 'rgba(255, 255, 255, 0.1)'
					}
				},
				y: {
					min: 1,
					max: getMax(),
					ticks: {
						beginAtZero: false,
						max: getMax(),
						callback: function (value: number) {
							return Number.isInteger(value) ? formatCompactNumber(value, false) : ''
						}
					},
					grid: {
						color: 'rgba(255, 255, 255, 0.1)'
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
