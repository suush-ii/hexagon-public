<script lang="ts">
	import { forwardEventHandlers, T, useThrelte } from '@threlte/core'
	import { OrbitControls } from '@threlte/extras'
	import { Vector3 } from 'three'

	export let objManifest: any

	let aabbMax = objManifest.aabb.max
	aabbMax = new Vector3(aabbMax.x, aabbMax.y, aabbMax.z)
	let aabbMin = objManifest.aabb.min
	aabbMin = new Vector3(aabbMin.x, aabbMin.y, aabbMin.z)

	let midPoint = new Vector3()
	midPoint.copy(aabbMax).add(aabbMin).multiplyScalar(0.5)

	let initialPosition = objManifest.camera.position
	let initialDirection = objManifest.camera.direction

	let thumbnailCameraPosition = new Vector3(initialPosition.x, initialPosition.y, initialPosition.z)
	let thumbnailCameraDirection = new Vector3(
		initialDirection.x,
		initialDirection.y,
		initialDirection.z
	)

	let pointToLookat = new Vector3()
	pointToLookat.copy(thumbnailCameraPosition)
	pointToLookat.sub(thumbnailCameraDirection)

	const { invalidate } = useThrelte()
	const el = document.getElementById('int-target')
	const component = forwardEventHandlers()
</script>

<T.PerspectiveCamera
	fov={70}
	position={[thumbnailCameraPosition.x, thumbnailCameraPosition.y, thumbnailCameraPosition.z]}
	makeDefault
	on:create={({ ref }) => {
		ref.lookAt(pointToLookat)
		ref.position.set(
			thumbnailCameraPosition.x,
			thumbnailCameraPosition.y,
			thumbnailCameraPosition.z
		)
	}}
	let:ref
>
	<OrbitControls
		bind:this={$component}
		args={[ref, el]}
		on:change={invalidate}
		enableZoom={true}
		zoomSpeed={1.0}
		rotateSpeed={1.0}
		minDistance={1.0}
		dynamicDampingFactor={0.3}
		autoRotate={true}
		fullRotation={true}
		maxDistance={Infinity}
		autoRotateSpeed={2.0}
		minZoom={1}
		on:create={({ ref }) => {
			ref.target.copy(midPoint)
		}}
	/>
</T.PerspectiveCamera>
