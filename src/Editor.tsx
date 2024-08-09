import { useState } from "react";

interface Props {
    tableElems: string[][];
    setTableElems: (e: string) => void;
}

export default function Editor({tableElems, setTableElems}: Props){
    const [tableInput, setTableInput] = useState(tableElems.map(e => e.reduce((l, r) => `${l};${r}`)).reduce((l, r) => `${l}\n${r}`))
    return (
        <div className="output">
            <textarea 
                onChange={(e) => setTableInput(e.currentTarget.value)}
                value={tableInput}
            />
            <button type="button" onClick={() => setTableElems(tableInput)}>Set</button>
            <button type="button" onClick={() => setTableElems('')}>Clear</button>
        </div>
    )
} 