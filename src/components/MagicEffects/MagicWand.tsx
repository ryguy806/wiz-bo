import { useEffect, useRef } from "react"
import * as THREE from 'three'

type MagicWandProps = {
    size?: number
    angle?: number
    colors?: string[]
    intensity?: number
    flip?: boolean
    interactive?: boolean
    particles?: number
    speed?: number
    className?: string
}

const DEFAULT_COLORS = ["#fff6c7", "#ffd86b", "#ffb3f0", "#b8e0ff"]
const MAX_PARTICLES = 360

const VERT = `
  attribute float aSize;
  attribute float aAlpha;
  attribute float aRot;
  attribute vec3 aColor;
  uniform float uPR;
  varying float vAlpha;
  varying float vRot;
  varying vec3 vColor;
  void main() {
    vAlpha = aAlpha;
    vRot = aRot;
    vColor = aColor;
    gl_PointSize = aSize * uPR;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = `
  uniform sampler2D uMap;
  varying float vAlpha;
  varying float vRot;
  varying vec3 vColor;
  void main() {
    vec2 p = gl_PointCoord - 0.5;
    float cs = cos(vRot);
    float sn = sin(vRot);
    vec2 uv = vec2(cs * p.x - sn * p.y, sn * p.x + cs * p.y) + 0.5;
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) discard;
    vec4 t = texture2D(uMap, uv);
    gl_FragColor = vec4(vColor * t.rgb, t.a * vAlpha);
  }
`;

const makeSparkleTexture = (): THREE.CanvasTexture => {
  const s = 128
  const c = document.createElement("canvas")
  c.width = c.height = s
  const ctx = c.getContext("2d")!
  ctx.translate(s / 2, s / 2)

  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, s / 2)
  glow.addColorStop(0, "rgba(255,255,255,0.85)")
  glow.addColorStop(0.25, "rgba(255,255,255,0.25)")
  glow.addColorStop(1, "rgba(255,255,255,0)")
  ctx.fillStyle = glow
  ctx.fillRect(-s / 2, -s / 2, s, s)

  const r = s * 0.48
  const k = s * 0.035
  ctx.fillStyle = "#fff"
  ctx.beginPath()
  ctx.moveTo(0, -r)
  ctx.quadraticCurveTo(k, -k, r, 0)
  ctx.quadraticCurveTo(k, k, 0, r)
  ctx.quadraticCurveTo(-k, k, -r, 0)
  ctx.quadraticCurveTo(-k, -k, 0, -r)
  ctx.fill()

  const tex = new THREE.CanvasTexture(c)
  tex.needsUpdate = true
  return tex
}

const MagicWand = ({
        size = 240,
        angle = 40,
        colors = DEFAULT_COLORS,
        intensity = 1,
        flip = false,
        interactive = false,
        particles = MAX_PARTICLES,
        speed = 1,
        className = ""
    }: MagicWandProps) => {
    const mountRef = useRef<HTMLDivElement>(null)

    const live = useRef({angle, colors, intensity, speed, hover: false})
    live.current.speed = speed
    live.current.angle = angle
    live.current.colors = colors
    live.current.intensity = intensity

    const burstRef = useRef<() => void>(() => {})

    useEffect(() => {
        const mount = mountRef.current!
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
        const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true})

        renderer.setPixelRatio(pixelRatio)
        renderer.setSize(size, size)
        renderer.setClearColor(0x000000, 0)
        renderer.domElement.style.display = "block"
        mount.appendChild(renderer.domElement)

        const half = size/2
        const camera = new THREE.OrthographicCamera(-half, half, half, -half)
        camera.position.z = 500

        const scene = new THREE.Scene()
        scene.add(new THREE.AmbientLight(0xffffff, 1.1))
        const key = new THREE.DirectionalLight(0xfff0d0, 2.4)
        key.position.set(-200, 300, 300)
        scene.add(key)

        const length = size * 0.62
        const wand = new THREE.Group()
        scene.add(wand)

        const wood = new THREE.MeshStandardMaterial({color: 0x4a2c1a, roughness: 0.55})
        const leather = new THREE.MeshStandardMaterial({ color: 0x2b1810, roughness: 0.8 })
        const gold = new THREE.MeshStandardMaterial({
            color: 0xf2c14e,
            roughness: 0.3,
            metalness: 0.5,
            emissive: 0x3a2a00,
        })
        const magic = new THREE.MeshBasicMaterial({ color: 0xfff4c2 })
        
        const sparkleTexture = makeSparkleTexture()
        const glow = new THREE.Sprite(
            new THREE.SpriteMaterial({
                map: sparkleTexture,
                color: 0xffe08a,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                transparent: true,
            })
        )

        const shaft = new THREE.Mesh(
            new THREE.CylinderGeometry(length * 0.012, length * 0.026, length * 0.74, 24),
            wood
        )
        shaft.position.y = length * 0.13
        wand.add(shaft)

        const grip = new THREE.Mesh(
            new THREE.CylinderGeometry(length * 0.034, length * 0.034, length * 0.26, 24),
            leather
        
        )
        grip.position.y = -length * 0.37
        wand.add(grip)

        const pommel = new THREE.Mesh(
            new THREE.SphereGeometry(length * 0.042, 24),
            gold
        )
        pommel.position.y = -length * 0.5
        wand.add(pommel)

        for (const y of [-0.24, -0.3, -0.42]) {
            const band = new THREE.Mesh(
                new THREE.TorusGeometry(length * 0.036, length * 0.008, 12, 32),
                gold
            )
            band.rotation.x = Math.PI / 2
            band.position.y = length * y
            wand.add(band)
        }

        const orb = new THREE.Mesh(
            new THREE.SphereGeometry(length * 0.016, 16, 12),
            magic
        )
        orb.position.y = length * 0.5
        wand.add(orb)

        glow.position.y = length * 0.5
        wand.add(glow)

        const pos = new Float32Array(particles * 3);
        const vel = new Float32Array(particles * 2);
        const age = new Float32Array(particles);
        const life = new Float32Array(particles);
        const size0 = new Float32Array(particles);
        const spin = new Float32Array(particles);
        const seed = new Float32Array(particles);
        const aSize = new Float32Array(particles);
        const aAlpha = new Float32Array(particles);
        const aRot = new Float32Array(particles);
        const aColor = new Float32Array(particles * 3);

        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute("position", new THREE.BufferAttribute(pos, 3))
        geometry.setAttribute("aSize", new THREE.BufferAttribute(aSize, 1))
        geometry.setAttribute("aAlpha", new THREE.BufferAttribute(aAlpha, 1))
        geometry.setAttribute("aRot", new THREE.BufferAttribute(aRot, 1))
        geometry.setAttribute("aColor", new THREE.BufferAttribute(aColor, 3))

        const material = new THREE.ShaderMaterial({
            uniforms: {uMap: {value: sparkleTexture}, uPR: {value: pixelRatio}},
            vertexShader: VERT,
            fragmentShader: FRAG,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        })

        const points = new THREE.Points(geometry, material)
        points.frustumCulled = false
        points.position.z = 10
        scene.add(points)

        const tempColor = new THREE.Color()
        let cursor = 0

        const spawn = (
            tip: THREE.Vector3,
            dir: THREE.Vector2,
            tipVel: THREE.Vector2,
            number: number,
            burst = false
        ) => {
            const palette = live.current.colors.length ? live.current.colors : DEFAULT_COLORS
            for (let i = 0; i < number; i++) {
                const j = cursor++ % particles;
                const theta = Math.random() * Math.PI * 2
                const speed = size * (burst ? 0.15 + Math.random() * 0.4 : 0.04 + Math.random() * 0.22)

                pos[j * 3] = tip.x + (Math.random() - 0.5) * length * 0.03
                pos[j * 3 + 1] = tip.y + (Math.random() - 0.5) * length * 0.03
                pos[j * 3 + 2] = 0
                vel[j * 2] = dir.x * speed * 0.5 + Math.cos(theta) * speed * 0.7 + tipVel.x * 0.25
                vel[j * 2 + 1] = dir.y * speed * 0.5 + Math.sin(theta) * speed * 0.7 + tipVel.y * 0.25
                age[j] = 0
                life[j] = 0.8 + Math.random() * 1.1
                size0[j] = size * (0.035 + Math.random() * 0.07)
                spin[j] = (Math.random() - 0.5) * 3
                seed[j] = Math.random()
                aRot[j] = Math.random() * Math.PI
                tempColor.set(palette[Math.floor(Math.random() * palette.length)])
                aColor[j * 3] = tempColor.r
                aColor[j * 3 + 1] = tempColor.g
                aColor[j * 3 + 2] = tempColor.b
            }
        }

        let time = 0
        let spawnAcc = 0
        const tip = new THREE.Vector3()
        const previousTip = new THREE.Vector3()
        let hasPrevious = false
        const tipVel = new THREE.Vector2()
        const dir = new THREE.Vector2();
        const gravity = size * 0.12
        const tipLocal = new THREE.Vector3(0, length * 0.5, 0)

        const updateWand = () =>{
            const base = (-live.current.angle * Math.PI) / 180
            const rotationZ = base + Math.sin(time * 1.7) * 0.07 + Math.sin(time * 0.6) * 0.03

            wand.rotation.z = rotationZ
            dir.set(-Math.sin(rotationZ), Math.cos(rotationZ))
            wand.position.set(
                -dir.x * length * 0.1,
                -dir.y * length * 0.1 + Math.sin(time * 1.3) * size * 0.01,
                0
            )
            wand.updateMatrixWorld(true)
            tip.copy(tipLocal)
            wand.localToWorld(tip)
        }

        const frame = (delta: number) => {
            time += delta
            updateWand()

            if (hasPrevious && delta > 0) {
                tipVel.set((tip.x - previousTip.x) / delta, (tip.y - previousTip.y) / delta)
            }
            previousTip.copy(tip)
            hasPrevious = true

            const swish = 1 + Math.min(3, tipVel.length() / (size * 0.5))
            const hover = live.current.hover ? 2.5 : 1
            const rate = live.current.intensity * swish * hover * 55
            spawnAcc += delta * rate
            const count = Math.floor(spawnAcc)
            if (count > 0) {
                spawnAcc -= count
                spawn(tip, dir, tipVel, count)
            }

            const pulse = 1 + Math.sin(time * 6) * 0.15
            glow.scale.setScalar(length * 0.3 * pulse * (live.current.hover ? 1.4 : 1))

            for (let i = 0; i < particles; i++) {
                if (life[i] <= 0) {
                    aAlpha[i] = 0
                    continue
                }

                age[i] += delta
                if (age[i] >= life[i]) {
                    life[i] = 0
                    aAlpha[i] = 0
                    continue
                }

                const t = age[i] / life[i]
                vel[i * 2] *= 1 - 0.9 * delta;
                vel[i * 2 + 1] = vel[i * 2 + 1] * (1 - 0.9 * delta) - gravity * delta;
                pos[i * 3] += vel[i * 2] * delta;
                pos[i * 3 + 1] += vel[i * 2 + 1] * delta;
                aRot[i] += spin[i] * delta;

                const twinkle = 0.65 + 0.35 * Math.sin(age[i] * 14 + seed[i] * 6.283)
                const environment = Math.min(1, age[i] * 10) * Math.pow(1 - t, 1.2)
                aAlpha[i] = environment * twinkle * 1.4
                aSize[i] = size0[i] * (0.4 + 0.6 * (1 - t)) * (0.8 + 0.4 * twinkle)
            }

            (geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
            (geometry.attributes.aSize as THREE.BufferAttribute).needsUpdate = true;
            (geometry.attributes.aAlpha as THREE.BufferAttribute).needsUpdate = true;
            (geometry.attributes.aRot as THREE.BufferAttribute).needsUpdate = true;
            (geometry.attributes.aColor as THREE.BufferAttribute).needsUpdate = true

            renderer.render(scene, camera)
        }

        burstRef.current = () => spawn(tip, dir, tipVel, 45, true)

        let animationFrame = 0
        let visible = true
        let observer: IntersectionObserver | null = null

        if (reduceMotion) {
            for (let i = 0; i < 40; i++) frame(1 / 30)
        } else {
            let last = performance.now()
            const tick = (now: number) => {
                animationFrame = requestAnimationFrame(tick)
                if (!visible) {
                    last = now
                    return
                }

                const delta = Math.min((now - last) / 1000, 0.05)
                last = now
                frame(delta * live.current.speed);
            }
            animationFrame = requestAnimationFrame(tick)

            observer = new IntersectionObserver(
                ([entry]) => (visible = entry.isIntersecting),
                {threshold: 0}
            )
            observer.observe(mount)
        }

        return () => {
            cancelAnimationFrame(animationFrame);
            observer?.disconnect();
            scene.traverse((obj) => {
                const m = obj as THREE.Mesh;
                m.geometry?.dispose?.();
                const mm = m.material as THREE.Material | THREE.Material[] | undefined;
                if (Array.isArray(mm)) mm.forEach((x) => x.dispose());
                else mm?.dispose?.();
            });
            sparkleTexture.dispose();
            renderer.dispose();
            renderer.domElement.remove();
        }
    }, [size, particles])

    return (
        <div 
            ref={mountRef} 
            className={`${interactive ? "" : "pointer-events-none"} 
            select-none ${className}`} 
            style={{
                    width: size,
                    height: size,
                    transform: flip ? "scaleX(-1)" : undefined,
                }}
            onPointerEnter={interactive ? () => (live.current.hover = true) : undefined}
            onPointerLeave={interactive ? () => (live.current.hover = false) : undefined}
            onPointerDown={interactive ? () => (burstRef.current()) : undefined}
            aria-hidden="true"
        />
    )
}

export default MagicWand
