const NUM = -1;
const ADD = 0;
const SUB = 1;
const MULT = 2;
const DIV = 3;
const EX = 4;
const PARENTH = 5;

class ProblemCreator{
    constructor(opSpecs){
        this.opSpecs = opSpecs; // Details on the problems
        this.opNum = opSpecs.opNum; // Number of operators
        this.size = this.opNum + 1; // Number of operands
        this.problem = {}; // The actual problems in dictionary form

        this.availableOps = [] // List of operations being used, in ascending order
        if (this.opSpecs.add.is) this.availableOps.push(ADD);
        if (this.opSpecs.sub.is) this.availableOps.push(SUB);
        if (this.opSpecs.mult.is) this.availableOps.push(MULT);
        if (this.opSpecs.div.is) this.availableOps.push(DIV);
        if (this.opSpecs.ex.is) this.availableOps.push(EX);
        if (this.opSpecs.parenth.is) this.availableOps.push(PARENTH);
    }


    run(){
        this.create();
        let final = this.problem;
        this.problem = {};
        return final;
    }

    // Makes list of operations and call recurse Helper
    create(){
        // List of operations [-, x, ÷, x]
        let opList = [];
        // If there's add/sub and mult/div
        if ((this.opSpecs.add.is || this.opSpecs.sub.is) && (this.opSpecs.mult.is || this.opSpecs.div.is)){
            let tier1 = [];
            let tier2 = [];
            // Fill tier 1 and 2 with available corresponding operations
            for(let i = 0; i < this.availableOps.length; i++){
                if (this.availableOps[i] < 2){
                    tier1.push(this.availableOps[i]);
                } else if (this.availableOps[i] < 4){
                    tier2.push(this.availableOps[i]);
                }
            }
            // If there's only one operation, do a random one
            if (this.opNum == 1){
                opList.push(this.randOp(this.availableOps));
            }
            // If there's more than one operation, do a tier 1 and the head and a tier 2 at the tail
            // and do random in between as long as it's higher precedence 
            else if (this.opNum > 1){
                opList.push(this.randOp(tier1));
                for(let i = 2; i < this.opNum; i++){
                    if (opList[opList.length - 1] < 2){
                        opList.push(this.randOp(this.availableOps));
                    } else {
                        opList.push(this.randOp(tier2));
                    }
                }
                opList.push(this.randOp(tier2));
            }
        }
        // If only one tier has available
        else {
            for(let i = 0; i < this.opNum; i++){
                opList.push(this.randOp(this.availableOps));
            }
        }

        // Eliminate double divs
        if (this.opSpecs.add.is || this.opSpecs.sub.is || this.opSpecs.mult.is){
            let div = -1;
            for (let i = 0; i < opList.length; i++){
                if (opList[i] == DIV){
                    if (div != -1){
                        opList[i] = MULT;
                    } else {
                        div = i;
                    }
                }
            }
        }
        this.createHelper(opList);
        return opList;
    }

    // Recursively creates problems using operation, aValue, and a random integer
    createHelper(opList, aVal = null, prevOp = -1){
        // Base case
        if (opList.length == 0) return;
        
        // Operator for this problem
        let operator = opList[opList.length - 1];
        let base = false; // If it's the first time it's being called
        if (aVal == null){
            aVal = 0;
            base = true;
        }

        // original problem
        this.problem = {
            val1: aVal,
            val2: 0,
            op: opList[opList.length - 1],
            ans: 0,
            string: "",
            base: base
        }
        // helpful dictionary
        let help = {
            val1: 0,
            val2: 0,
            str1: "",
            str2: "",
            switch: false,
            base: base
        }
        if (!base) help.val1 = this.problem.val1.ans;

        if (operator <= SUB && prevOp >= MULT){
            let aRand = Math.floor(Math.random() * 10);
            help.switch = aRand > 3;
        }
        
        // Get values in help
        this.randProb(operator, help, prevOp);
        
        // Filling out dictionary based on help
        this.problem.val2 = help.val2;
        if (base) this.problem.val1 = help.val1;

        help.str2 = this.problem.val2.toString();
        if (base){
            help.str1 = this.problem.val1.toString();
        } else {
            help.str1 = this.problem.val1.string;
        }

        // Possibly switch val1 and val2
        if (help.switch){
            let temp = help.val2;
            this.problem.val2 = this.problem.val1;
            this.problem.val1 = temp;
            
            help.val2 = help.val1;
            help.val1 = temp;

            let strTemp = help.str2;
            help.str2 = help.str1;
            help.str1 = strTemp;
        }

        // Get ans
        this.problem.ans = this.solve(help.val1, help.val2, operator)

        // Get string
        this.problem.string = this.makeText(help.str1, help.str2, operator)

        // Recursive step
        opList.pop();
        this.createHelper(opList, this.problem, operator);
    }

    solve(val1, val2, operator){
        let ans = 0;
        switch(operator){
            case ADD:
                ans = val1 + val2;
                break;
            case SUB:
                ans = val1 - val2;
                break;
            case MULT:
                ans = val1 * val2;
                break;
            case DIV:
                ans = val1 / val2;
                break;
        }
        return ans;
    }

    makeText(val1, val2, op){ // val1 and val2 are strings
        let operation = "";
        switch (op){
            case ADD:
                operation = " + ";
                break;
                case SUB:
                    operation = " - ";
                    break;
                    case MULT:
                operation = " x ";
                break;
            case DIV:
                operation = " ÷ ";
                break;
            case EX:
                operation = " ^ ";
                break;
            case PARENTH:
                operation = "()";
                break;
        }
        return val1 + operation + val2;
    }

    randProb(operator, help){
        // Simple, if add or subtract
        if (operator == ADD || operator == MULT){
            if (help.base){
                help.val1 = this.randNum(operator);
                help.val2 = this.randNum(operator);
            } else {
                help.val2 = this.randNum(operator);
            }
        }
        // If subtraction, avoid negatives
        else if (operator == SUB){
            if (help.base){
                help.val1 = this.randNum(operator);
                help.val2 = this.randNum(operator);
                help.switch = help.val1 < help.val2;
            } else {
                if (!help.switch){
                    help.val2 = this.randNum(operator, -1000, help.val1);
                }
                // if number's too big, don't switch, else make sure to pick a large enough number for no negatives 
                else {
                    if (help.val1 > this.opSpecs.add.max){
                        help.switch = false;
                        help.val2 = this.randNum(operator);
                    } else {
                        help.val2 = this.randNum(operator, help.val1, 1000);
                    }
                }
            }
        }
        // If division, make sure it only uses integers
        else if (operator == DIV){
            help.switch = false;
            if (help.base){
                let ans = this.randNum(operator);
                help.val2 = this.randNum(operator);
                help.val1 = ans * help.val2;
            } else {
                help.val2 = this.randFactor(help.val1);
                // need parenthesis for anything more complicated
            }
        }
        return;
    }

    randOp(opList){
        let rand = Math.floor(Math.random() * opList.length);
        return opList[rand];
    }

    randNum(operator, userMin = -1000, userMax = 1000){ // Random number allowed by opSpecs for the operation
        let aMax = -1;
        let aMin = -1;
        if (operator <= SUB){
            aMin = this.opSpecs.add.min;
            aMax = this.opSpecs.add.max;
        } else if (operator <= DIV){
            aMin = this.opSpecs.mult.min;
            aMax = this.opSpecs.mult.max;
        }
        if (operator == DIV && aMin < 1) aMin = 1;

        aMax = (userMax < aMax) ? userMax : aMax;
        aMin = (userMin > aMin) ? userMin : aMin;

        return Math.floor(Math.random() * (aMax - aMin + 1) + aMin);
    }

    
    randFactor(num){
        let factors = [];
        for(let i = 0; i < num / 2 + 1; i++){
            if (num % i == 0) factors.push(i);
        }
        factors.push(num);
        return factors[Math.floor(Math.random() * factors.length)];
    }

}

// class randomProb{
//     constructor(opSpecs){
//         this.opSpecs = opSpecs;
//     }
//     add(){

//     }
//     sub(){

//     }
//     mult(){

//     }
//     div(problem, operation){    
//         let min = this.opSpecs.div.min;
//         let max = this.opSpecs.div.max;
//         let val1 = problem.val1;
//         let int1 = val1
//         if (!problem.base) int1 = problem.val1.ans;

//         let ans = this.randNum(mult);
//     }
//     randNum(operator){ // Random number allowed by opSpecs for the operation
//         let max = -1;
//         let min = -1;
//         if (operator <= SUB){
//             min = this.opSpecs.add.min;
//             max = this.opSpecs.add.max;
//         } else if (operator <= DIV){
//             min = this.opSpecs.mult.min;
//             max = this.opSpecs.mult.max;
//         }
//         return Math.floor(Math.random() * (max - min) + min + 1); // inclusive
//     }
// }