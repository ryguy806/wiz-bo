import { useState, type SubmitEvent } from "react"
import { MIN_PLAYERS } from "../../helpers/gameStateHelper"
import Title from "../Layout/Title"
import RunicBorder from "../Layout/RuneBorder"
import Background from "../Layout/Background"

type SetupScreenProps = {
    onStart: (playerNames: string[], computerCount: number) => void
}

const range = (from: number, to: number) => Array.from({length: Math.max(to - from + 1, 0)}, (_, i) => from + i)

const SetupScreen = ({onStart}: SetupScreenProps) => {
    const [names, setNames] = useState<string[]>(["Player 1"])
    const [computerCount, setComputerCount] = useState(1)

    const humanCount = names.length

    const minComputers = Math.max(1, MIN_PLAYERS - humanCount)
    const maxComputers = 3

    const setName = (index: number, value: string) =>
        setNames((prev) => prev.map((n, i) => (i === index ? value : n)))

    const handleSubmit = (e: SubmitEvent) => {
        e.preventDefault()
        onStart(names.map((n, i) => n.trim() || `Player ${i + 1}`), computerCount)
    }

    return (
        <>
            <Background/>
            <div className="flex min-h-screen items-center justify-center p-10">
                <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4 rounded-lg text-black bg-[#e8d8bd] p-6 shadow-lg">
                    <RunicBorder text="ᛏᚺᛁᛊ ᚷᚨᛗᛖ ᛁᛊ ᛃᚢᛊᛏ ᛊᚲᛁᛈᛒᛟ ᛒᚢᛏ ᚹᛁᚦ ᚹᛁᛉᚨᚱᛞᛊ" />
                    <Title title="Wiz-Bo"/>
                    <div className="flex flex-col gap-2 border border-gray-500 p-2 rounded">
                        <div className="font-semibold">
                            Enter Player Name:
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
                    <div  className="flex flex-col gap-2 border border-gray-500 p-2 rounded">
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