import { useEffect, useRef } from "react";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    // Skip the camera entirely: the quad always covers the screen
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uIntensity;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  // Value noise
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  // Fractal Brownian Motion: layered noise at increasing frequency
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = rot * p * 2.0 + 100.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    uv.x *= uResolution.x / uResolution.y; // keep the mist from stretching
    float t = uTime * 0.05;

    // Domain warping: feed noise into noise to get the swirling look
    vec2 q = vec2(
      fbm(uv * 2.0 + t),
      fbm(uv * 2.0 + vec2(5.2, 1.3) - t)
    );
    vec2 r = vec2(
      fbm(uv * 2.0 + 4.0 * q + vec2(1.7, 9.2) + 2.0 * t),
      fbm(uv * 2.0 + 4.0 * q + vec2(8.3, 2.8) - 2.0 * t)
    );
    float f = fbm(uv * 2.0 + 4.0 * r);

    vec3 col = mix(uColorA, uColorB, clamp(f * f * 2.0, 0.0, 1.0));
    float alpha = smoothstep(0.2, 0.9, f) * uIntensity;

    gl_FragColor = vec4(col, alpha);
  }
`;

type MistBackgroundProps = {
    colorA?: string
    colorB?: string
    intensity?: number
}

const MistBackground = ({colorA = "#1a2a6c", colorB = "#7b4fbf", intensity = 0.35}: MistBackgroundProps) => {

    const mountRef = useRef<HTMLDivElement>(null)
    
    useEffect(() => {
        const mount = mountRef.current
        if(!mount) return

        const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true})
        renderer.setPixelRatio(0.5);
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene()
        const camera = new THREE.Camera()

        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            transparent: true,
            depthTest: false,
            depthWrite: false,
            uniforms: {
                uTime: { value: 0 },
                uResolution: {
                value: new THREE.Vector2(mount.clientWidth, mount.clientHeight),
                },
                uColorA: { value: new THREE.Color(colorA) },
                uColorB: { value: new THREE.Color(colorB) },
                uIntensity: { value: intensity },
            },
        });

        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
        mesh.frustumCulled = false;
        scene.add(mesh);

        const onResize = () => {
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        material.uniforms.uResolution.value.set(
            mount.clientWidth,
            mount.clientHeight
        );
        };
        window.addEventListener("resize", onResize);

        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        const clock = new THREE.Clock();
        let frameId = 0;
        const animate = () => {
            material.uniforms.uTime.value = clock.getElapsedTime();
            renderer.render(scene, camera);
            if (!reduceMotion) frameId = requestAnimationFrame(animate);
        };
        animate();

        const onVisibility = () => {
            if (reduceMotion) return;
            if (document.hidden) cancelAnimationFrame(frameId);
            else animate();
        };
        document.addEventListener("visibilitychange", onVisibility);

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener("resize", onResize);
            document.removeEventListener("visibilitychange", onVisibility);
            mesh.geometry.dispose();
            material.dispose();
            renderer.dispose();
            mount.removeChild(renderer.domElement);
        };
    }, [colorA, colorB, intensity])

    return (
        <div 
            ref={mountRef}
            className="fixed inset-0 -z-20 pointer-events-non"
            aria-hidden="true"
        />
    )
}

export default MistBackground