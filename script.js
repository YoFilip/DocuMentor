document.querySelector(".submit-input").addEventListener("click", generateComments);
//Potrzebujemy:
//Class
//Funckji
//Zmienne ✔
//Konstruktory

document.getElementById("sourceCode").value = "public static void nawa(int zmiennna){}";

var list = {
  int: [],
  double: [],
  float: [],
  byte: [],
  short: [],
  long: [],
  String: [],
  boolean: [],
  char: [],
};

function generateComments() {
  list = {
    int: [],
    double: [],
    float: [],
    byte: [],
    short: [],
    long: [],
    String: [],
    boolean: [],
    char: [],
  };
  const code = document.getElementById("sourceCode").value;
  const lines = code.split(/;\s*|\n/);
  let result = lines.map((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine) {
      const note = generateCommentForLine(trimmedLine + ";");
      return note ? note : "";
    }
    return "";
  }).join("\n");
  document.getElementById("output").innerHTML = result;
}

function generateCommentForLine(line) {

  // Modyfikacja wzorca, żeby dodawał komentarz Javadoc

  let pattern1 = /^(public|private|protected)?\s*(static | abstract)?\s*(int|String|double|float|boolean|char|byte|short|long|void)\s+([a-zA-Z_][a-zA-Z0-9_]*)\((.*?)\)\s*.*({|;|})$/;
  if (pattern1.test(line)) {
    let arr = line.match(pattern1);
    let [, visibility, modifier, returnType, functionName, params] = arr;
    if (params) {
      let paramsArray = params.split(',').map(param => param.trim().split(' '));
      arr.length - 1;
      var paramsComment = paramsArray.map(param => ` * @param ${param[0]} ${param[1]}`).join('\n');
    }
    return `/**\n * Zdefiniowano ${visibility ? visibility : ''} ${modifier ? modifier : ''} funkcję ${returnType} o nazwie ${functionName}\n${paramsComment}\n */`;
  }




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

  return null;
}

function validateVariable(type, value) {
  if (["int", "double", "float", "byte", "short", "long"].includes(type)) {
    return /^-?\d+(\.\d+)?$/.test(value) && !value.startsWith('"') && !value.endsWith('"');
  } else if (type === "String") {
    if (value.startsWith('"') && value.endsWith('"')) {
      return true;
    } else if (value.startsWith('["') && value.endsWith('"]')) {
      return true;
    }
    return false;
  } else if (type === "boolean") {
    return value === "true" || value === "false";
  } else if (type === "char") {
    return value.startsWith("'") && value.endsWith("'") && value.length === 3;
  } else {
    return false;
  }
}


