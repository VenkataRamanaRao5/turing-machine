
interface Props{
    index: number;
    symbol: string;
    state: string;
    blank: string;
    shouldShowHead: number
}

const Square = function ({index, symbol, state, blank, shouldShowHead}: Props){
    //console.log("F", index, symbol)
    const headOption = (n: number) => {
        if(n == 0)  return ""
        else if(n == 1) return " head-top head-side"
        else if(n == 2) return " head-side"
        else if(n == 3) return " head-bottom head-side"
        else return " head-top head-bottom head-side"
    }
    return (
        <span key={index} className={"square" + headOption(shouldShowHead)} onClick={() => {symbol = 'K'; console.log(symbol)}}>
            <span className="symbol">{symbol === blank ? ' ' : symbol}</span>
            {(shouldShowHead >= 3) && <span>{state}</span>}
        </span>
    );
}

export default Square;