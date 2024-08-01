import Square from "./Square";

interface Prop{
    tape: string[];
    headPos: number;
    state: string;
    blank: string;
    isMultiTrack: boolean;
    shouldShowHead: boolean;
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
                shouldShowHead={shouldShowHead && (sqind === headPos)}
            />)}
    </div>
    )
}

export default Tape;