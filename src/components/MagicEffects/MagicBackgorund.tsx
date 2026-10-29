import {useEffect, useRef} from 'react'
import * as THREE from 'three'

type BackgroundProps = {
    count?: number
}

const MagicBackground = ({count = 1500}: BackgroundProps) => {
    
    const mountRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        const mount = mountRef.current
        if(!mount) return

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 1000)

        camera.position.z = 50

        const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true})
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.setSize(mount.clientWidth, mount.clientHeight)
        mount.appendChild(renderer.domElement)

        const positions = new Float32Array(count * 3)
        const velocities = new Float32Array(count)
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 120
            positions[i * 3 + 1] = (Math.random() - 0.5) * 80
            positions[i * 3 + 2] = (Math.random() - 0.5) * 60
            velocities[i] = 0.01 * Math.random() * 0.03
        }

        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))

        const material = new THREE.PointsMaterial({
            color: 0x88ccff,
            size: 0.35,
            transparent: true,
            opacity: 0.8,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        })

        const points = new THREE.Points(geometry, material)
        scene.add(points)

        const onResize = () => {
            camera.aspect = mount.clientWidth / mount.clientHeight
            camera.updateProjectionMatrix()
            renderer.setSize(mount.clientWidth, mount.clientHeight)
        }
        window.addEventListener("resize", onResize)

        let frameId = 0
        const animate = () => {
            frameId = requestAnimationFrame(animate)

            const pos = geometry.attributes.position as THREE.BufferAttribute
            for(let i = 0; i < count; i++) {
                let y = pos.getY(i) + velocities[i]
                if (y > 40) y = -40
                pos.setY(i, y)
            }
            pos.needsUpdate = true

            points.rotation.y += 0.0007
            camera.lookAt(scene.position)

            renderer.render(scene, camera)
        }
        animate()

        return () => {
            cancelAnimationFrame(frameId)
            window.removeEventListener("resize", onResize)
            geometry.dispose()
            material.dispose()
            renderer.dispose()
            mount.removeChild(renderer.domElement)
        }

    }, [count])

    return (
        <div
            ref={mountRef}
            className='fixed inset-0 -z-10 pointer-events-none'
            aria-hidden="true"
        />
    )
}

export default MagicBackground