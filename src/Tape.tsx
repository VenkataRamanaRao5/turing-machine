import Square from "./Square";

interface Prop{
    tape: string[];
    headPos: number;
    state: string;
    blank: string;
    isMultiTrack: boolean;
    shouldShowHead: number;
};

function Tape({tape, headPos, state, blank, isMultiTrack, shouldShowHead}: Prop){
    //console.log("Rerender", tape)

    return (
    <div className={isMultiTrack ? "track" : "tape"}>
        {tape.map((sq, sqind) =>
            <Square
                index={sqind}
                symbol={sq}
                state={state}
                blank={blank}
                shouldShowHead={(sqind === headPos) ? shouldShowHead : 0}
            />)}
    </div>
    )
}

export default Tape;