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
        comment += ` */\n${accessModifier ? accessModifier + ' ' : ''}${otherModifier ? otherModifier + ' ' : ''}${returnType} ${functionName}(${params}) {${body}}\n`;
		console.log(comment);
        return comment;
    } else {
        return null;
    }
}

function generateCommentForConstructors(lines, classNames) {
    let constructorPattern = new RegExp(`(public|protected|private)?\\s*(${classNames.join("|")})\\s*\\((.*?)\\)\\s*\\{([^}]*)\\}`, 'g');
    let match;
	let comment;
    while ((match = constructorPattern.exec(lines)) !== null) {
        let accessModifier = match[1] ? match[1].trim() : null;
        let constructorName = match[2];
        let params = match[3];
        let body = match[4];

        comment = `/**\n * Konstruktor dla klasy ${constructorName}\n`;

        if (params) {
            let parameters = params.split(',');
            parameters.forEach((param) => {
                let [type, name] = param.trim().split(' ');
                comment += ` * @param ${type} ${name}\n`;
            });
        }

        comment += ` */\n${accessModifier ? accessModifier + ' ' : ''}${constructorName}(${params}) {${body}}\n`;

        console.log(comment);
    }
	return comment;
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

    if (code.includes("Zdefiniowano")) {
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

        let constructorComment = generateCommentForConstructors(block, classNames);
        if (constructorComment) {
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

    aceEditor.setValue(comments);
});