import SparkleEffect from "../MagicEffects/SparkleEffect"

type GameWinProps = {
    winner: string | null
    onNewGame: () => void

}

const GameWin = ({winner, onNewGame}: GameWinProps) => {
    return (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/70">
                    <SparkleEffect />
                    <div className="flex flex-col items-center gap-2 rounded-lg bg-white p-8 text-black">
                        <h2 className="text-3xl font-bold text-black!">{winner} wins!</h2>
                        <button
                            type="button"
                            onClick={onNewGame}
                            className="rounded bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-600"
                        >
                            Play again
                        </button>
                    </div>
                </div>
    )
}

export default GameWin