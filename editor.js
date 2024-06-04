var functionPattern = /^(public|private|protected)?\s*(static|abstract)?\s*(\w+)\s+(\w+)\((.*?)\)\s*\{([^}]*)\}/g;

const getConstructorPattern = className =>{
return new RegExp(`(public|protected|private)?\\s*(${className})\\s*\\((.*?)\\)\\s*\\{([^}]*)\\}`, 'g');
}

function generateCommentForVars(line, types) {
    let regex = new RegExp(`(${types.join("|")})\\s+(\\w+)\\s*=\\s*(.*?);`, "g");
    let match = regex.exec(line);
    if (match) {
        let type = match[1];
        let variable = match[2];
        let value = match[3];
        if (type === "char" && !/^'.*'$/.test(value)) {
            return `Bład w definicji zmiennej ${variable};`;
        } else if (type === "String" && !/^".*"$/.test(value)) {
            return `Bład w definicji zmiennej "${variable}";`;
        } else if (
            type !== "char" &&
            type !== "String" &&
            /^['"].*['"]$/.test(value)
        ) {
            return `Bład w definicji zmiennej ${variable};`;
        }
        return `/**\n * Zdefiniowano zmienną ${variable} z wartością ${value}\n */\n${type} ${variable} = ${value};\n`;
    } else {
        return null;
    }
}

function generateCommentForFuncs(lines) {
    let pattern = /^(public|private|protected)?\s*(static|abstract)?\s*(\w+)\s+(\w+)\((.*?)\)\s*\{([^}]*)\}/g;
    let match = pattern.exec(lines);
    if (match) {
        let accessModifier = match[1];
        let otherModifier = match[2];
        let returnType = match[3];
        let functionName = match[4];
        let params = match[5];
        let body = match[6];
        let returnLine = body.split('\n').find(line => line.trim().startsWith('return'));
        let comment = `/**\n * Zdefiniowano funkcję o nazwie ${functionName}\n`;

        if (params) {
            let parameters = params.split(',');
            parameters.forEach((param) => {
                let [type, name] = param.trim().split(' ');
                comment += ` * @param ${type} ${name}\n`;
            });
        }

        if (returnLine) {
            comment += ` * @${returnLine.trim()}\n`;
        }
        comment += `*/\n${accessModifier ? accessModifier + ' ' : ''}${otherModifier ? otherModifier + ' ' : ''}${returnType} ${functionName}(${params}) {${body}}\n`;
        return comment;
    } else {
        return null;
    }
}

function generateCommentForConstructors(lines, classNames) {
    let constructorPattern = getConstructorPattern(classNames[0]);
    let match;
	let comment;
    while ((match = constructorPattern.exec(lines)) !== null) {
        let accessModifier = match[1] ? match[1].trim() : null;
        let constructorName = match[2];
        let params = match[3];
        let body = match[4];

        comment = `/**\n * Zdefiniowano ${getModifierM(accessModifier) != "" ? getModifierM(accessModifier) + " " : ""}Konstruktor dla klasy ${constructorName}\n`;
        if (params) {
            let parameters = params.split(',');
            parameters.forEach((param) => {
                let [type, name] = param.trim().split(' ');
                comment += ` * @param ${type} ${name}\n`;
            });
        }

        comment += `*/\n    ${accessModifier ? accessModifier + ' ' : ''}${constructorName}(${params}) {${body}}\n`;

    }
	return comment;
}

function generateCommentForClass(block) {
    let classPattern = /(public|protected|private|default|final|abstract|public abstract)?\s*class\s+(\w+)\s*\{([^}]*)}/g;
    let classMatch = classPattern.exec(block);
    if (classMatch) {
        let classMod = classMatch[1];
        let className = classMatch[2];
        let fields = classMatch[3].split('\n');
        let body = "";

        let iter = 0;
        while((fields[iter].charAt(fields[iter].length - 1) == ";") || (fields[iter].trim() === "")){
            if(!fields[iter].includes("abstract")){
                body += fields[iter] + '\n';
            }
            ++iter;
        }

        console.log(fields[1].charAt(fields[1].length - 2) === ';');
        console.log(fields);

        return `/**\n * Zdefiniowano ${getModifierF(classMod) !== "" ? getModifierF(classMod) + " " : ""}klasę o nazwie ${className}\n */\n${block.split("\n")[0]}\n${body}`;
    } else {
        return null;
    }
}
    
function getModifierF(mod){
    switch(mod){
        case "private":
            return "prywatną";
        case "public":
            return "publiczną";
        case "abstract":
            return "abstrakcyjną";
        case "final":
            return "finalną";
        case "protected":
            return "chronioną";
        case "default":
            return "podstawową";
        case "public abstract":
            return "publiczną abstrakcyjną";
        default:
            return "";
    }
}

function getModifierM(mod){
    switch(mod){
        case "private":
            return "prywatny";
        case "public":
            return "publiczny";
        case "abstract":
            return "abstrakcjyny";
        case "final":
            return "finalny";
        case "protected":
            return "chroniony";
        case "default":
            return "podstawowy";
        case "public abstract":
            return "publiczny abstrakcyjny";
        default:
            return "";
    }
}

let editor = document.querySelector("#editor");
let generateButton = document.querySelector("#generateButton");
let resetButton = document.querySelector("#resetButton");

resetButton.addEventListener("click", function () {
    aceEditor.setValue("");
});

let aceEditor = ace.edit(editor, {
    theme: "ace/theme/cobalt",
    mode: "ace/mode/java",
});

generateButton.addEventListener("click", function () {
    let code = aceEditor.getValue();
    let types = [
        "int",
        "double",
        "float",
        "byte",
        "short",
        "long",
        "String",
        "boolean",
        "char",
    ];

    if (code.includes("/**")) {
        return;
    }

    let comments = "";

    let blocks = code.split("\n\n");
    blocks.forEach((block) => {
        let classNames = [];
        let classPattern = /class\s+(\w+)/g;
        let classMatch;
        while ((classMatch = classPattern.exec(block)) !== null) {
            classNames.push(classMatch[1]);
        }
        let classComment = generateCommentForClass(block);
        console.log(classComment)
        if (classComment) {
            comments += classComment + "\n";
        }
        let constructorComment = generateCommentForConstructors(block, classNames);
        if (classNames.length !== 0) {
            comments += constructorComment;
        } else {
            let functionComment = generateCommentForFuncs(block);
            if (functionComment) {
                comments += functionComment;
            } else {
                let variableComment = generateCommentForVars(block, types);
                if (variableComment) {
                    comments += variableComment;
                }
            }
        }
    });

    comments += "\n}";

    aceEditor.setValue(comments);
});