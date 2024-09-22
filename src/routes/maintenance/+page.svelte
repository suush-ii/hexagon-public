<svelte:head>
	<style type="text/css">
		html {
			height: 100%;
		}
		body {
			background-color: #000;
			background-image: url('/Images/img_ohnoes.jpg');
			background-size: contain;
			background-repeat: no-repeat;
			background-position: center;
			height: auto;
			font-family: 'Source Sans Pro', sans-serif;
			font-size: 18px;
			line-height: 24px;
			text-align: center;
			margin: 0;
			overflow: hidden;
			min-width: 320px;
		}

		@media screen and (max-width: 991px) {
			body {
				background-size: cover;
			}
		}
		.header {
			padding: 20px 0;
		}

		.header img {
			width: 200px;
			height: 200px;
			margin: 0 auto;
		}

		@media screen and (max-width: 768px) {
			.header img {
				width: 256px;
			}
		}

		@media screen and (max-width: 480px) {
			body {
				background-position: 39% 50%;
			}

			.header img {
				width: 150px;
			}
		}
		.notification {
			width: auto;
			height: auto;
			padding: 12px 20px;
			margin: 0;
			background-color: hsl(25 95 53);
			color: #fff;
		}

		@media screen and (max-width: 479px) {
			.notification {
				font-size: 14px;
				line-height: 20px;
			}
		}
	</style>
</svelte:head>

<div class="header">
	<img src="/hexagon512.png" alt="Hexagon" />
</div>
<div class="content night">
	<p class="notification">Hexagon is undergoing scheduled maintenance</p>
</div>
