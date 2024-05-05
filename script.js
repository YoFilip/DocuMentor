document
	.querySelector(".submit-input")
	.addEventListener("click", generateComments);

// Funkcja do generowania komentarzy
function generateComments() {
	const code = document.getElementById("sourceCode").value;
	const lines = code.split(/;\s*|\n/);
	let result = "";

	for (let line of lines) {
		const trimmedLine = line.trim();
		if (trimmedLine) {
			const note = generateCommentForVariable(trimmedLine + ";");
			if (note) {
				if (result) {
					result += "\n";
				}
				result += note;
			}
		}
	}
	document.getElementById("output").innerHTML = result;
}

// Funkcja do parsowania oraz do generowania komentarzy dla zmiennych
function generateCommentForVariable(line) {
	const pattern =
		/^(int|String|double|float|boolean|char|byte|short|long)\s+([a-z_][a-z0-9_]*)\s*(=\s*(.*))?;$/;
	const match = line.match(pattern);

	if (match) {
		const type = match[1];
		const name = match[2];
		const value = match[4];
		if (value === undefined) {
			return `/**\n * Zdefiniowano zmienną ${type} ${name}\n */`;
		} else {
			const isValid = validateVariable(type, value);
			if (isValid) {
				return `/**\n * Zdefiniowano zmienną ${type} ${name} o wartości ${value}\n */`;
			} else {
				return `<span class="error">ERROR: Niepoprawna definicja zmiennej: ${name}</span>`;
			}
		}
	}
	return null;
}

function generateCommentForClass(line){
	const pattern = 
		/^(class | abstract)\s+([a-z_][a-z0-9_]*)/;
}

// Funkcja do sprawdzania zmiennych
function validateVariable(type, value) {
	if (["int", "double", "float", "byte", "short", "long"].includes(type)) {
		return (
			/^-?\d+(\.\d+)?$/.test(value) &&
			!value.startsWith('"') &&
			!value.endsWith('"')
		);
	} else if (type === "String") {
		return value.startsWith('"') && value.endsWith('"');
	} else if (type === "boolean") {
		return value === "true" || value === "false";
	} else if (type === "char") {
		return value.startsWith("'") && value.endsWith("'") && value.length === 3;
	} else {
		return false;
	}
}
