import { memo, useRef, useState } from "react";


const Rows = () => {

}

const Table = memo(() => {
    const [machType, setMachType] = useState("1")
    const handleRadioChange = (e: React.FormEvent<HTMLInputElement>) => setMachType(e.currentTarget.value)
    return (
        <div>
                <label className="radio-inline">
                    <input type="radio" name="machineType" value="1" checked={machType === "1"} onChange={handleRadioChange} /> Primitive
                </label>
                <label className="radio-inline">
                    <input type="radio" name="machineType" value="2" checked={machType === "2"} onChange={handleRadioChange} /> Multi-Tape
                </label>
                <label className="radio-inline">
                    <input type="radio" name="machineType" value="3" checked={machType === "3"} onChange={handleRadioChange} /> Multi-Track
                </label>
        <table className="table table-bordered">
            <tbody>
            <tr>
                <th>State</th>
                <th>Symbol</th>
                <th>Next State</th>
                <th>Actions</th>
            </tr>
            </tbody>
            

        </table>
        </div>
    )
})

export default Table;