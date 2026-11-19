import MagicWand from '../MagicEffects/MagicWand'
import TitleText from './TitleText'

type TitleProps = {
    title: string
}

const Title = ({title}: TitleProps) => {

    return(
        <div className='relative inline-block px-28 py-10'>
            <MagicWand
                className="absolute -left-6 top-1/2 -translate-y-1/2"
                angle={50}
                size={200}
                flip
                colors={["#ff3d81", "#ffd60a", "#00e5ff", "#7Cff4d"]}
            />
            <span className='text-6xl font-manufacturing absolute top-0 left-20'><TitleText text={title} /></span>
            <MagicWand
                className="absolute -right-6 top-1/2 -translate-y-1/2"
                angle={50}
                size={200}
                colors={["#ff3d81", "#ffd60a", "#00e5ff", "#7Cff4d"]}
            />
        </div>
    )
}

export default Title