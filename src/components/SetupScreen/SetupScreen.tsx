import { useState, type SubmitEvent } from "react"
import { MAX_PLAYERS, MIN_PLAYERS, getStockSize } from "../../helpers/gameStateHelper"

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
        <div className="flex min-h-screen items-center justify-center bg-olive-700 p-4">
            <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4 rounded-lg text-black bg-taupe-300 p-6 shadow-lg">
                <h1 className="text-center text-4xl font-bold"><span className="text-sky-900">Wiz-Bo</span></h1>

                <label className="flex flex-col gap-1">
                    <span className="font-semibold">Human players</span>
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

                <label className="flex flex-col gap-1">
                    <span className="font-semibold">Computer players</span>
                    <select
                        value={computerCount}
                        onChange={(e) => setComputerCount(parseInt(e.target.value))}
                        className="rounded border p-2"
                    >
                        {range(minComputers, maxComputers).map((n) => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                    <span className="text-sm text-gray-500">
                        {totalPlayers} players total. Each gets {getStockSize(totalPlayers)} stock cards.
                    </span>
                </label>

                {names.map((name, i) => (
                    <label key={i} className="flex flex-col gap-1">
                        <span className="text-sm font-semibold">Player {i + 1} name</span>
                        <input
                            value={name}
                            onChange={(e) => setName(i, e.target.value)}
                            maxLength={20}
                            className="rounded border p-2"
                        />
                    </label>
                ))}

                <button
                    type="submit"
                    className="rounded bg-rose-900 py-2 font-semibold text-white hover:bg-emerald-600"
                >
                    New Game
                </button>
            </form>
        </div>
    )
}

export default SetupScreen