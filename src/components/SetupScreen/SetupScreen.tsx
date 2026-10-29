import { useState, type SubmitEvent } from "react"
import { MAX_PLAYERS, MIN_PLAYERS, getStockSize } from "../../helpers/gameStateHelper"

type SetupScreenProps = {
    onStart: (playerNames: string[]) => void
}

const SetupScreen = ({onStart}: SetupScreenProps) => {
    const [names, setNames] = useState<string[]>(["Player 1", "Player 2"])

    const setName = (index: number, value: string) =>
        setNames((prev) => prev.map((n, i) => (i === index ? value : n)))

    const setPlayerCount = (count: number) =>
        setNames((prev) =>
            count > prev.length
                ? [...prev, ...Array.from({length: count - prev.length}, (_, i) => `Player ${prev.length + i + 1}`)]
                : prev.slice(0, count)
        )

    const handleSubmit = (e: SubmitEvent) => {
        e.preventDefault()
        onStart(names.map((n, i) => n.trim() || `Player ${i + 1}`))
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-emerald-900 p-4">
            <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4 rounded-lg bg-white p-6 shadow-lg">
                <h1 className="text-center text-4xl font-bold">Wiz-Bo</h1>

                <label className="flex flex-col gap-1">
                    <span className="font-semibold">Number of players</span>
                    <select
                        value={names.length}
                        onChange={(e) => setPlayerCount(parseInt(e.target.value))}
                        className="rounded border p-2"
                    >
                        {Array.from({length: MAX_PLAYERS - MIN_PLAYERS + 1}, (_, i) => MIN_PLAYERS + i).map((n) => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                    <span className="text-sm text-gray-500">
                        Each player gets {getStockSize(names.length)} stock cards.
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
                    className="rounded bg-emerald-700 py-2 font-semibold text-white hover:bg-emerald-600"
                >
                    Start game
                </button>
            </form>
        </div>
    )
}

export default SetupScreen