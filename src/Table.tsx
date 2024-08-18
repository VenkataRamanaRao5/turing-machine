import { memo, useState } from "react";


const Row = ({ arrSetter, index, arr }: { arrSetter: React.Dispatch<React.SetStateAction<any[][]>>, index: number, arr: string[] }) => {
    const set2dArray = (rowI: number, colI: number, newVal: string, setter: React.Dispatch<React.SetStateAction<any[][]>>) => setter(e => e.map((row, rI) => rI === rowI ? row.map((val, cI) => cI === colI ? newVal : val) : row))
    //console.log(arr, index)
    return (
        <tr>
            {arr.map((val, colIndex) =>
                <td contentEditable="true" onBlur={(e) => set2dArray(index, colIndex, e.currentTarget.textContent as string, arrSetter)}>{val}</td>
            )}
            <td>
                <button type="button" className="add" onClick={(e) => arrSetter(array => array.flatMap((row1, i) => i === index ? [row1, row1.map(() => '')] : [row1]))}>+</button>
                <button type="button" className="append" onClick={(e) => arrSetter(array => array.flatMap((row1, i) => i === index ? [row1, row1] : [row1]))}>+=</button>
                <button type="button" className="delete" onClick={(e) => arrSetter(array => array.flatMap((row1, i) => i === index ? [] : [row1]))}>-</button>
            </td>
        </tr>
    )
}

interface tableProps{
    header: string[];
    tableElems: string[][];
    setTableElems: (e: string[][]) => void;
}

const Table = ({header, tableElems, setTableElems}: tableProps) => {
    const [tableArray, setTableArray] = useState(tableElems)
    return (
        <div>
            <table className="table table-bordered">
                <tbody>
                    <tr>
                        {header.map(e => <th>{e}</th>)}
                    </tr>
                    {tableArray.map((r, i) =>
                        <Row
                            arrSetter={setTableArray}
                            index={i}
                            arr={r}
                        />
                    )}
                </tbody>
            </table>
            <button type="button" onClick={() => setTableElems(tableArray)}>Set</button>
            <button type="button" onClick={() => { setTableArray([Array(tableElems[0].length).fill('')]); setTableElems([Array(tableElems[0].length).fill('')])}}>Clear</button>
        </div>
    )
}

export default Table;