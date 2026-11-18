import { useLayoutEffect, useRef, useState } from 'react'

type RunicBorderProps = {
    text: string
    offset?: number     // max px outside the card edge
    radius?: number
    fontSize?: number
    duration?: number
    className?: string
}

const RunicBorder = ({
    text,
    offset = 8,
    radius = 16,
    fontSize = 11,
    duration = 80,
    className = 'text-amber-300',
}: RunicBorderProps) => {
    const ref = useRef<HTMLDivElement>(null)
    const [box, setBox] = useState({ w: 0, h: 0, l: 0, r: 0, t: 0, b: 0 })

    useLayoutEffect(() => {
        const el = ref.current
        if (!el) return

        const update = () => {
            const rect = el.getBoundingClientRect()
            const doc = document.documentElement
            // Room available on each side of the card, minus space for the glyphs
            const room = (margin: number) =>
                Math.min(offset, margin - fontSize * 1.3 - 4)

            setBox({
                w: el.offsetWidth,
                h: el.offsetHeight,
                l: room(rect.left),
                r: room(doc.clientWidth - rect.right),
                t: room(rect.top + window.scrollY),
                b: room(doc.scrollHeight - (rect.bottom + window.scrollY)),
            })
        }

        update()
        const ro = new ResizeObserver(update)
        ro.observe(el)
        window.addEventListener('resize', update)
        return () => {
            ro.disconnect()
            window.removeEventListener('resize', update)
        }
    }, [offset, fontSize])

    const { w, h, l, r: right, t, b } = box
    const x = -l
    const y = -t
    const pw = w + l + right
    const ph = h + t + b
    const r = Math.max(0, Math.min(radius, pw / 2, ph / 2))

    const d = [
        `M ${x + r} ${y}`,
        `H ${x + pw - r}`,
        `A ${r} ${r} 0 0 1 ${x + pw} ${y + r}`,
        `V ${y + ph - r}`,
        `A ${r} ${r} 0 0 1 ${x + pw - r} ${y + ph}`,
        `H ${x + r}`,
        `A ${r} ${r} 0 0 1 ${x} ${y + ph - r}`,
        `V ${y + r}`,
        `A ${r} ${r} 0 0 1 ${x + r} ${y}`,
        'Z',
    ].join(' ')

    const perimeter = 2 * (pw - 2 * r) + 2 * (ph - 2 * r) + 2 * Math.PI * r

    const unit = `${text} ᛫ `
    const repeats = Math.max(1, Math.ceil(perimeter / (unit.length * fontSize * 0.7)))
    const full = unit.repeat(repeats)

    return (
        <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0">
            {w > 0 && (
                <svg
                    width={w}
                    height={h}
                    className={`absolute left-0 top-0 overflow-visible font-runic ${className}`}
                    style={{ fontSize }}
                >
                    <defs>
                        <path id="runic-border-path" d={d} />
                    </defs>

                    <text fill="currentColor">
                        <textPath href="#runic-border-path" textLength={perimeter} lengthAdjust="spacing" startOffset={0}>
                            {full}
                            <animate attributeName="startOffset" from={0} to={perimeter} dur={`${duration}s`} repeatCount="indefinite" />
                        </textPath>
                    </text>
                    <text fill="currentColor">
                        <textPath href="#runic-border-path" textLength={perimeter} lengthAdjust="spacing" startOffset={-perimeter}>
                            {full}
                            <animate attributeName="startOffset" from={-perimeter} to={0} dur={`${duration}s`} repeatCount="indefinite" />
                        </textPath>
                    </text>
                </svg>
            )}
        </div>
    )
}

export default RunicBorder