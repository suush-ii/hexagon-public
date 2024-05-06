<script lang="ts">
	import { T } from '@threlte/core'
	import { interactivity, useSuspense } from '@threlte/extras'
	import { useLoader } from '@threlte/core'
	import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
	import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js'

	import Camera from './Camera.svelte'
	import { s3Url } from '$src/stores'
	import { Mesh, MeshLambertMaterial, MeshPhongMaterial, MeshStandardMaterial } from 'three'
	const suspend = useSuspense()

	export let objManifest: any

	const Key = 'thumbnails'

	//let obj = useLoader(OBJLoader).load(`https://${s3Url}/${Key}/${objManifest.obj}`)

	const { load } = useLoader(MTLLoader, {
		extend: (loader) => {
			loader.manager.setURLModifier((url) => {
				if (url.includes('/')) {
					return `https://${s3Url}/${Key}/${url.split('/')[1]}`
				}
				return `https://${s3Url}/${Key}/${url}`
			})
		}
	})
	const obj = suspend(
		useLoader(OBJLoader, {
			extend: async (loader) => {
				const materials = await load(objManifest.mtl)
				materials.preload()

				loader.setMaterials(materials)
			}
		}).load(objManifest.obj, {
			transform: (object) => {
				object.traverse((child) => {
					if (child instanceof Mesh) {
						const shinyMaterial = new MeshStandardMaterial({
							map: child.material.map,
							transparent: false,
							opacity: 1
						})

						child.material = shinyMaterial
					}
				})
				return object
			}
		})
	)

	const { target } = interactivity()
	target.set(document.getElementById('int-target') ?? undefined)
</script>

<Camera {objManifest} />

<T.AmbientLight color={0x444444} />
<T.DirectionalLight
	color={0xd4d4d4}
	on:create={({ ref }) => {
		ref.position.set(-7.5, 0.5, -6.0).normalize()
	}}
/>
<T.DirectionalLight
	color={0xacacac}
	on:create={({ ref }) => {
		ref.position.set(20.0, 4.0, -0).normalize()
	}}
/>
<T.DirectionalLight
	color={0xacacac}
	on:create={({ ref }) => {
		ref.position.set(0, 1, 1).normalize()
	}}
/>
<T.AmbientLight color={0xacacac} />
<T.DirectionalLight
	color={0xacacac}
	on:create={({ ref }) => {
		ref.position.set(-0.671597898, 0.671597898, 0.312909544).normalize()
	}}
/>

<T.DirectionalLight
	color={0x444444}
	on:create={({ ref }) => {
		ref.position.set(-0.671597898, 0.671597898, 0.312909544).negate().normalize()
	}}
/>
<!--<T.DirectionalLight position={[1, 2, 5]} />-->

{#if $obj}
	<T is={$obj}></T>
{/if}
<!--<Grid
	position.y={-0.001}
	cellColor="#ffffff"
	sectionColor="#ffffff"
	sectionThickness={0}
	fadeDistance={25}
	cellSize={2}
/>
-->
