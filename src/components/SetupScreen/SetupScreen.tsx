import { useState, type SubmitEvent } from "react"
import { MAX_PLAYERS, MIN_PLAYERS, getStockSize } from "../../helpers/gameStateHelper"
import Title from "../Layout/Title"
import MagicBackground from "../MagicEffects/MagicBackgorund"
import MistBackground from "../MagicEffects/MistBackground"
import RunicBorder from "../Layout/RuneBorder"

type SetupScreenProps = {
    onStart: (playerNames: string[], computerCount: number) => void
}

const range = (from: number, to: number) => Array.from({length: Math.max(to - from + 1, 0)}, (_, i) => from + i)

const SetupScreen = ({onStart}: SetupScreenProps) => {
    const [names, setNames] = useState<string[]>(["Player 1", "Player 2"])
    const [computerCount, setComputerCount] = useState(0)

    const humanCount = names.length
    const totalPlayers = humanCount + computerCount

    const minComputers = Math.max(0, MIN_PLAYERS - humanCount)
    const maxComputers = MAX_PLAYERS - humanCount

    const setName = (index: number, value: string) =>
        setNames((prev) => prev.map((n, i) => (i === index ? value : n)))

    const setHumanCount = (count: number) => {
        setNames((prev) =>
            count > prev.length
                ? [...prev, ...Array.from({length: count - prev.length}, (_, i) => `Player ${prev.length + i + 1}`)]
                 : prev.slice(0, count
        ))
        setComputerCount((prev) => Math.min(Math.max(prev, Math.max(0, MIN_PLAYERS - count)), MAX_PLAYERS - count))
    }

    const handleSubmit = (e: SubmitEvent) => {
        e.preventDefault()
        onStart(names.map((n, i) => n.trim() || `Player ${i + 1}`), computerCount)
    }

    return (
        <>
            <MistBackground/>
            <MagicBackground/>
            <div className="flex min-h-screen items-center justify-center p-10">
                <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4 rounded-lg text-black bg-taupe-300 p-6 shadow-lg">
                    <RunicBorder text="ᛏᚺᛁᛊ ᚷᚨᛗᛖ ᛁᛊ ᛃᚢᛊᛏ ᛊᚲᛁᛈᛒᛟ ᛒᚢᛏ ᚹᛁᚦ ᚹᛁᛉᚨᚱᛞᛊ" />
                    <Title>Wiz-Bo</Title>
                    <div  className="flex flex-col gap-2 border border-gray-500 p-2 rounded">
                        <label className="flex flex-col gap-1">
                            <span className="font-semibold">Human Players</span>
                            <select
                                value={humanCount}
                                onChange={(e) => setHumanCount(parseInt(e.target.value))}
                                className="rounded border p-2"
                            >
                                {range(1, MAX_PLAYERS).map((n) => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                        </label>

                        <label className="flex flex-col gap-1 pb-2">
                            <span className="font-semibold">Computer Players</span>
                            <select
                                value={computerCount}
                                onChange={(e) => setComputerCount(parseInt(e.target.value))}
                                className="rounded border p-2"
                            >
                                {range(minComputers, maxComputers).map((n) => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                    <div className="flex flex-col gap-2 border border-gray-500 p-2 rounded">
                        <div className="font-semibold">
                            Enter Player Names:
                        </div>
                        <div>
                            {names.map((name, i) => (
                                <label key={i} className="flex flex-col gap-1 pb-2">
                                    <input
                                        alt={name}
                                        onChange={(e) => setName(i, e.target.value)}
                                        maxLength={20}
                                        placeholder={`Player ${i + 1}`}
                                        defaultValue={`Player ${i + 1}`}
                                        className="rounded border p-2"
                                    />
                                </label>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="rounded bg-rose-900 py-2 font-semibold text-white hover:bg-emerald-600"
                    >
                        New Game
                    </button>
                </form>
            </div>
        </>
    )
}

export default SetupScreen