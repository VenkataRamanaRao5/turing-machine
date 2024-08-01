
interface Props{
    index: number;
    symbol: string;
    state: string;
    blank: string;
    shouldShowHead: boolean
}

const Square = function ({index, symbol, state, blank, shouldShowHead}: Props){
    //console.log("F", index, symbol)
    return (
        <div key={index} className={shouldShowHead ? "square head" : "square"} onClick={() => {symbol = 'K'; console.log(symbol)}}>
            <div className="symbol">{symbol === blank ? ' ' : symbol}</div>
            {(shouldShowHead) && <span>{state}</span>}
        </div>
    );
}

export default Square;