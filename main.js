// Format for worksheets
const docDefinition = {
    content: [
        {text:"Problem Sheet", style:"title", margin:[0,0,0,50]},
        // Problem Set
        {
            style: "problem",
            table: {
                headerRows: 0,
                widths: "*",
                heights: 90,
                body: []
            },
            layout: "noBorders"
        },
        {text:"Answer Key", style:"title", margin:[0,0,0,50]},
        // Answer Key
        {
            ol: [],
            style: "problem"
        }
    ],
    styles: {
        title: {
            fontSize: 25,
            bold: true,
            alignment: "center",
            color: "blue"
        },
        problem: {
            fontSize: 16,
        }
    }
}

// Flow to actually make the pdf
function makePDF(){
    docDefinition.content[1].table.body = [];
    docDefinition.content[3].ol = [];
    let aWorksheetMaker = new worksheetMaker();
    aWorksheetMaker.fillDict();
    aWorksheetMaker.makeProblems();
    aWorksheetMaker.insertProblems();
    pdfMake.createPdf(docDefinition).open();
}

let creator = document.getElementById('create');
creator.addEventListener("click", makePDF);


// This class goes through the worksheet making process
class worksheetMaker{
    constructor(){
        this.ops = {
            add: {is: true, min: 0, max: 0},
            sub: {is: true},
            mult: {is: true, min: 0, max: 0},
            div: {is: true},
            ex: {is: false},
            parenth: {is: false},
            opNum: 2
        };
        this.problemSet = {};
    }

    // Operation specs matches user input
    fillDict(){
        let isOperations = document.getElementsByClassName("opTypes");
        this.ops.add.is = isOperations[ADD].checked;
        this.ops.sub.is = isOperations[SUB].checked;
        this.ops.mult.is = isOperations[MULT].checked;
        this.ops.div.is = isOperations[DIV].checked;
        this.ops.ex.is = isOperations[EX].checked;
        this.ops.parenth.is = isOperations[PARENTH].checked;
        
        let addMin = document.getElementById("addMin").value;
        this.ops.add.min = parseInt(addMin);
        let addMax = document.getElementById("addMax").value;
        this.ops.add.max = parseInt(addMax);
        let multMin = document.getElementById("multMin").value;
        this.ops.mult.min = parseInt(multMin);
        let multMax = document.getElementById("multMax").value;
        this.ops.mult.max = parseInt(multMax);

        let operationNumbers = document.getElementsByClassName("opNumOptions");
        for(let i = 1; i <= 3; i++){
            if (operationNumbers[i - 1].checked) this.ops.opNum = i;
        }
        console.log(this.ops.mult.min, this.ops.mult.max)
    }

    // Uses ProblemCreator Class to create problems are put them in problemSet
    makeProblems(){
        this.problemSet = Array(21);
        let aProblemCreator = new ProblemCreator(this.ops) ;
        for(let i = 0; i < this.problemSet.length; i++){
            this.problemSet[i] = aProblemCreator.run();
        }
    }

    // Inserts problem strings into docDefinition
    insertProblems(){
        let index = 0
        for(let i = 0; i < this.problemSet.length; i=i){
            docDefinition.content[1].table.body.push([]);
            for(let j = 0; j < 3; j++){
                // if overflow
                if (i >= this.problemSet.length){
                    docDefinition.content[1].table.body[index].push(probFormat("", "problem"));
                } else{
                    let aProblem = probFormat(this.problemSet[i].string, (i + 1).toString(), "problem");
                    docDefinition.content[1].table.body[index].push(aProblem);
                    let anAnswer = ansFormat(this.problemSet[i].ans, (i + 1).toString(), "problem");
                    docDefinition.content[3].ol.push(anAnswer);
                    i++;
                }
            }
            index++;
        }
    }
}

// Puts problem into acceptable format
function probFormat(text, count, style){
    text = count + ") " + text;
    return {text: text, style: style};
}

function ansFormat(ans, style){
    text = ans
    return {text: text, style: style};
}