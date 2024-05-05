function generateCommentsForVariables(line) {
	const pattern = /^(int|String|double|float|boolean|char|byte|short|long)(\[\])?\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(=\s*({[^}]*}|.*));$/;
	const match = line.match(pattern);

	if (match) {
		const [, type, isArray, name, , value] = match;

		if (isArray) {
			if (value) {
				return `/**\n * Zdefiniowano tablicę ${type} ${name} z wartościami ${value}\n */`;
			} else {
				return `/**\n * Zdefiniowano pustą tablicę ${type} ${name}\n */`;
			}
		} else {
			if (value === undefined) {
				return `/**\n * Zdefiniowano zmienną ${type} ${name}\n */`;
			} else {
				if (validateVariable(type, value)) {
					if (list[type].includes(name)) {
						return `<span class="error">ERROR: Zmienna ${name} została już zainicjowana</span>`;
					}
					list[type].push(name);
					return `/**\n * Zdefiniowano zmienną ${type} ${name} o wartości ${value}\n */`;
				} else {
					return `<span class="error">ERROR: Niepoprawna definicja zmiennej: ${name}</span>`;
				}
			}
		}
	}


}
