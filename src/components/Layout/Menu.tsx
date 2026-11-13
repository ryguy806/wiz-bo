import { useState } from "react"
import { Squash } from "hamburger-react"

type MenuProps = {
    onNewGame: () => void
}

const Menu = ({onNewGame}: MenuProps) => {

    const [open, setOpen] = useState(false)

    return (
        <div className="relative flex flex-col gap-2">
            <div className="absolute top-1 right-1">
                <Squash toggle={setOpen} toggled={open}/>
            </div>
            <div className="absolute top-15 right-3 w-36">
                {open && 
                    <>
                        <button
                            type="button"
                            onClick={onNewGame}
                            className="rounded bg-white/20 px-3 py-1 hover:bg-blue-500/30 w-full"
                        >
                            New game
                        </button>
                    </>
                }
            </div>
        </div>)
}

export default Menu