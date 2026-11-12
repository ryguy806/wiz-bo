import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { div } from 'three/tsl'

type SparkleProps = {
    count?: number,
    duration?: number,
    className?: string
    onComplete?: () => void
}

const SHADER = /*glsl*/ `
    attribute float aSize;
    attribute float aAlpha;
    attribute vec3 aColor;
    uniform float uPixelRatio;
    varying float vAlpha;
    varying vec3 vColor;
    
    void main() {
        vAlpha = aAlpha;
        vColor = aColor;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * uPixelRatio;
    }
`

const FRAGMENT_SHADER = /* glsl */ `
  varying float vAlpha;
  varying vec3 vColor;
 
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
 
    float glow = exp(-d * d * 22.0);
    float starH = exp(-abs(uv.x) * 14.0) * exp(-abs(uv.y) * 3.0);
    float starV = exp(-abs(uv.y) * 14.0) * exp(-abs(uv.x) * 3.0);
    float intensity = glow + (starH + starV) * 0.9;
 
    // Hot white core, neon edges
    vec3 col = mix(vColor, vec3(1.0), glow * 0.55);
    gl_FragColor = vec4(col * intensity, intensity * vAlpha);
  }
`

const SparkleEffect = ({
    count = 300,
    duration = 7,
    className = "",
    onComplete,
}: SparkleProps) => {

    const mountRef = useRef<HTMLDivElement>(null)
    const onCompleteRef = useRef(onComplete)
    onCompleteRef.current = onComplete
    const [done, setDone] = useState(false)

    useEffect(() => {
        const container = mountRef.current
        if(!container) return

        if(window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setDone(true)
            onCompleteRef.current?.()
            return
        }

        let width = container.clientWidth
        let height = container.clientHeight

        const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true})
        const pixelRatio = Math.min(window.devicePixelRatio, 2)
        renderer.setPixelRatio(pixelRatio)
        renderer.setSize(width, height)
        renderer.setClearColor(0x000000, 0)
        container.appendChild(renderer.domElement)

        const scene = new THREE.Scene()
        const camera = new THREE.OrthographicCamera(
            -width / 2,
            width / 2,
            height / 2,
            -height / 2,
            -10,
            10
        )

        const positions = new Float32Array(count * 3)
        const colors = new Float32Array(count * 3)
        const sizes = new Float32Array(count)
        const alphas = new Float32Array(count)
    
        const delay = new Float32Array(count)
        const vx = new Float32Array(count)
        const vy = new Float32Array(count)
        const swayAmp = new Float32Array(count)
        const swayFreq = new Float32Array(count)
        const phase = new Float32Array(count)
        const twinkleFreq = new Float32Array(count)
        const baseSize = new Float32Array(count)
        const baseX = new Float32Array(count)
        const life = new Float32Array(count)

        const color = new THREE.Color()

        for (let index = 0; index < count; index++) {
            color.setHSL(Math.random(), 1, 0.5 + Math.random() * 0.12)
            colors.set([color.r, color.g, color.b], index * 3)

            baseX[index] = (Math.random() - 0.5) * width
            positions[index * 3] = baseX[index]
            positions[index * 3 + 1] = height / 2 + 40
            positions[index * 3 + 2] = 0

            delay[index] = Math.random() * 1.6
            vx[index] = (Math.random() - 0.5) * 40
            vy[index] = -(70 + Math.random() * 130)
            swayAmp[index] = 15  + Math.random() * 40
            swayFreq[index] = 1 + Math.random() * 2.5
            phase[index] = Math.random() * Math.PI * 2
            twinkleFreq[index] = 4 + Math.random() * 8
            baseSize[index] = 10 + Math.random() * 22
            life[index] = Math.min(duration, (height + 80) / -vy[index] + 0.5)
            alphas[index] = 0
            sizes[index] = baseSize[index]
        }

        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
        geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3))
        geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1))
        geometry.setAttribute("aAlpha", new THREE.BufferAttribute(alphas, 1))

        const material = new THREE.ShaderMaterial({
            vertexShader: SHADER,
            fragmentShader: FRAGMENT_SHADER,
            uniforms: { uPixelRatio: { value: pixelRatio } },
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        })

        const points = new THREE.Points(geometry, material)
        points.frustumCulled = false
        scene.add(points)

        const timer = new THREE.Timer()
        let elapsed = 0
        let rafId = 0
        let finished = false

        const tick = () => {
            timer.update()
            const dt = Math.min(timer.getDelta(), 0.05)
            elapsed += dt

            let alive = 0

            for (let index = 0; index < count; index++) {
                const t = elapsed - delay[index]
                if (t < 0) {
                    alive++
                    alphas[index] = 0
                    continue
                }
                if (t > life[index]) {
                    alphas[index] = 0
                    continue
                }
                alive++

                baseX[index] += vx[index] * dt
                positions[index * 3] = baseX[index] + Math.sin(t * swayFreq[index] + phase[index]) * swayAmp[index]
                positions[index * 3 + 1] += vy[index] * dt

                const fadeIn = Math.min(t / 0.3, 1)
                const fadeOut = Math.min((life[index] - t) / (life[index] * 0.3), 1)
                const twinkle = 0.65 + 0.35 * Math.sin(t * twinkleFreq[index] + phase[index])

                alphas[index] = Math.max(0, fadeIn * fadeOut * twinkle)
                sizes[index] = baseSize[index] * (0.8 + 0.2 * twinkle)
            }

            geometry.attributes.position.needsUpdate = true
            geometry.attributes.aAlpha.needsUpdate = true
            geometry.attributes.aSize.needsUpdate = true

            renderer.render(scene, camera)

            if (alive === 0 || elapsed > duration + 2) {
                if (!finished) {
                    finished = true
                    setDone(true)
                    onCompleteRef.current?.()
                }
                return
            }

            rafId = requestAnimationFrame(tick)
        }

        const onResize = () => {
            width = container.clientWidth
            height = container.clientHeight
            renderer.setSize(width, height)
            camera.left = -width / 2
            camera.right = width / 2
            camera.top = height / 2
            camera.bottom = -height / 2
            camera.updateProjectionMatrix()
        }
        window.addEventListener("resize", onResize)

        rafId = requestAnimationFrame(tick)

        return () => {
            cancelAnimationFrame(rafId)
            window.removeEventListener("resize", onResize)
            geometry.dispose()
            material.dispose()
            renderer.dispose()
            renderer.domElement.remove()
        }
    }, [])

    if (done) return null

    return (
        <div
            ref={mountRef}
            aria-hidden="true"
            className={`pointer-events-none fixed inset-0 z-5 overflow-hidden ${className}`}
        />
    )
}

export default SparkleEffect