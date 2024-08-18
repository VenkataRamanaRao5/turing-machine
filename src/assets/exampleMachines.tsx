type exampleMachine = {machType: number, noOfCanvases: number, transitions: string}
let examples: Map<String, exampleMachine> = new Map()
examples.set("Add 1 (2 tracks)", {
    machType: 3,
    noOfCanvases: 2,
    transitions:
        `b;[0,B];b;R
        b;[1,B];b;R
        b;[B,B];c;L
        c;[0,B];d;[0,1],L
        c;[1,B];e;[1,0],L
        e;[1,B];e;[1,0],L
        e;[0,B];d;[0,1],L
        e;[B,B];d;[B,1],L
        d;[1,B];d;[1,1],L
        d;[0,B];d;[0,0],L
        d;[B,B];f;L`
})

examples.set("0^n1^n", {
    machType: 1,
    noOfCanvases: 1,
    transitions:
        `b;0;c;X,R
        b;Y;e;Y,R
        c;0;c;0,R
        c;1;d;Y,L
        c;Y;c;Y,R
        d;0;d;0,L
        d;X;b;X,R
        d;Y;d;Y,L
        e;Y;e;Y,R
        e;B;f;B,R`
    }
)
export default examples;