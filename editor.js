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
        let comment = `/**\n * Zdefiniowano ${accessModifier ? accessModifier + ' ' : ''}${otherModifier ? otherModifier + ' ' : ''}${returnType} funkcję o nazwie ${functionName}\n`;

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

        return comment;
    } else {
        return null;
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

    if (code.includes("Zdefiniowano")) {
        return;
    }

    let comments = "";
    code = code.replace(/^\n+/, "");
    let blocks = code.split("\n\n").filter(block => block.trim() !== "");

    for (let block of blocks) {
        let funcComment = generateCommentForFuncs(block);
        let varComment = generateCommentForVars(block, types);
        if (funcComment) {
            comments += funcComment;
        } else if (varComment) {
            comments += varComment;
        }
    }

    aceEditor.setValue(comments);
});