type exampleMachine = {machType: number, noOfCanvases: number, transitions: string, varibles: string}
let examples: Map<string, exampleMachine> = new Map()
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
        d;[B,B];f;L`,
    varibles: ';'
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
        e;B;f;B,R`,
    varibles: `;`
    }
)

examples.set("move right", {
    machType: 1,
    noOfCanvases: 1,
    transitions:
        `q0;X;q0;R`,
    varibles: `X;0,1`
}
)

examples.set("collatz", {
    machType: 1,
    noOfCanvases: 1,
    transitions:
        `r;X;r;R
        r;B;s;L
        s;0;r;B, L
        s;1;o1;1, L
        z;0;z;0, L
        z;1;o1;1, L
        o1;E;z1;1, L
        o1;1;o2;0, L
        z1;1;o1;1, L
        z1;0;z;0, L
        z1;B;pr;R
        o2;1;o3;1, L
        o2;E;o1;0, L
        o3;1;o3;1, L
        o3;E;o1;0, L
        pr;X;pr;R
        pr;B;p;L
        p;E;r;1, R
        p;1;p;0, L`,
    varibles: 
        `X;0, 1
        E;0, B`
}
)
export default examples;
