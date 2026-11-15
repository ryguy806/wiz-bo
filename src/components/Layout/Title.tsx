import type {ReactNode} from 'react'
import MagicWand from '../MagicEffects/MagicWand'

type TitleProps = {
    children: ReactNode
}

const Title = ({children}: TitleProps) => {

    return(
        <div className='relative inline-block px-28 py-10'>
            <MagicWand
                className="absolute -left-6 top-1/2 -translate-y-1/2"
                angle={50}
                size={240}
                flip
                colors={["#ff3d81", "#ffd60a", "#00e5ff", "#7Cff4d"]}
            />
            <span className='text-2xl'>{children}</span>
            <MagicWand
                className="absolute -right-6 top-1/2 -translate-y-1/2"
                angle={50}
                size={240}
                colors={["#ff3d81", "#ffd60a", "#00e5ff", "#7Cff4d"]}
            />
        </div>
    )
}

export default Title