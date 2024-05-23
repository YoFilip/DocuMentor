let editor = document.querySelector("#editor");
let generateButton = document.querySelector("#generateButton");

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
	let comments = "";

	// Split the code into lines
	let lines = code.split("\n");

	// Process each line
	for (let line of lines) {
		let varComment = generateCommentForVars(line, types);
		let funcComment = generateCommentForFuncs(line);
		if (varComment) {
			comments += varComment;
		} else if (funcComment) {
			comments += funcComment;
		}
	}

	aceEditor.setValue(comments);
});
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
	let pattern =
		/^(public|private|protected)?\s*(static | abstract)?\s*(int|String|double|float|boolean|char|byte|short|long|void)\s+([a-zA-Z_][a-zA-Z0-9_]*)\((.*?)\)\s*\{([\s\S]*?)return\s+(.*?);?\s*\}$/;
	if (pattern.test(lines)) {
		let arr = lines.match(pattern);
		let [
			,
			visibility,
			modifier,
			returnType,
			functionName,
			params,
			returnValue,
		] = arr;
		if (params) {
			let paramsArray = params
				.split(",")
				.map((param) => param.trim().split(" "));
			var paramsComment = paramsArray
				.map((param) => ` * @param ${param[0]} ${param[1]}`)
				.join("\n");
		}
		let returnComment =
			returnType === "void" ? "" : `\n * @return ${returnValue}`;
		return `/**\n * Zdefiniowano ${visibility ? visibility + "" : ""} ${
			modifier ? modifier : ""
		} funkcję typu: ${returnType} o nazwie ${functionName}\n${paramsComment}${returnComment}\n */\n${lines}\n`;
	} else {
		return null;
	}
}
