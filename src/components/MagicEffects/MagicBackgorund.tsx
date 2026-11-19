import {useEffect, useRef} from 'react'
import * as THREE from 'three'

type BackgroundProps = {
    count?: number
}

const vertexShader = /* glsl */ `
  attribute vec3 aColor;
  attribute float aSpeed;
  attribute float aPhase;

  uniform float uTime;
  uniform float uSize;

  varying vec3 vColor;
  varying float vAngle;

  void main() {
    vColor = aColor;
    vAngle = aPhase + uTime * aSpeed;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * (150.0 / -mvPosition.z); // size attenuation
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAngle;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;

    // rotate the coordinates by this point's angle
    float s = sin(vAngle);
    float c = cos(vAngle);
    uv = mat2(c, -s, s, c) * uv;

    // plus-sign shape
    float bar = 0.08;
    float shape = max(
      step(abs(uv.x), bar) * step(abs(uv.y), 0.5),
      step(abs(uv.y), bar) * step(abs(uv.x), 0.5)
    );

    gl_FragColor = vec4(vColor, 1.0);
  }
`;

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
        const colors = new Float32Array(count * 3)
        const color = new THREE.Color()
        const speeds = new Float32Array(count)
        const phases = new Float32Array(count)
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 120
            positions[i * 3 + 1] = (Math.random() - 0.5) * 80
            positions[i * 3 + 2] = (Math.random() - 0.5) * 60
            velocities[i] = 0.01 + Math.random() * 0.03

            color.setHSL(Math.random(), 0.8, 0.4)
            colors[i * 3] = color.r
            colors[i * 3 + 1] = color.g
            colors[i * 3 + 2] = color.b

            speeds[i] = (Math.random() - 0.5) * 6
            phases[i] = Math.random() * Math.PI * 2
        }

        const geometry = new THREE.BufferGeometry()
        const positionAttr = new THREE.BufferAttribute(positions, 3)
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
        geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3))
        geometry.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1))
        geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1))

        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uSize: { value: 2 },
            },
        })

        const points = new THREE.Points(geometry, material)
        scene.add(points)

        const start = performance.now()
        renderer.setAnimationLoop(() => {
            material.uniforms.uTime.value = (performance.now() - start) / 1000

            // drift points upward, wrapping at the top
            for (let i = 0; i < count; i++) {
                let y = positionAttr.getY(i) + velocities[i]
                if (y > 40) y = -40
                positionAttr.setY(i, y)
            }
            positionAttr.needsUpdate = true

            points.rotation.y += 0.0007
            renderer.render(scene, camera)
        })

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
            renderer.setAnimationLoop(null)
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
            className='fixed inset-0 -z-5 pointer-events-none'
            aria-hidden="true"
        />
    )
}

export default MagicBackground
