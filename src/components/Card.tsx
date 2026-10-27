type CardType = {
    value: number | string;
    faceDown: boolean;
}

const Card = ({value, faceDown}: CardType) => {
    return (
        <div className="border border-black w-10 h-20">
            {faceDown ? (
                <div>
                    Card Back will be here.
                </div>
            ) : 
            (
                <div>
                    {value}
                </div>
            )}
        </div>
    )
}

export default Card