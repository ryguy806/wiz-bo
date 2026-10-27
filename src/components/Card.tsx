import cardBack from "../assets/images/wizard-card-back.jpg"

type CardType = {
    value: number | string;
    faceDown: boolean;
}

const Card = ({value, faceDown}: CardType) => {
    return (
        <div className="border border-black w-10 h-20 flex text-xl items-center justify-center">
            {faceDown ? (
                <img src={cardBack} alt="card-back" className="size-full"/>
            ) : 
            (
                <div className="isolate text-blue-500 size-full flex justify-center items-center">
                    {typeof(value) == typeof(1) ? value : (
                            <span className="motion-safe:animate-spin">
                                <img src={value.toString()} className="animate-pulse"/>
                            </span>
                        )}
                </div>
            )}
        </div>
    )
}

export default Card