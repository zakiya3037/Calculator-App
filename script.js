
const currentDisplay = document.querySelector("#current-display");
const previousDisplay = document.querySelector("#previous-display");
const buttons = document.querySelectorAll("button");

let currentNumber = "0";
let firstNumber = null;
let operator = null;
let waitingForNumber = false;
let resultDisplayed = false;

// Basic math functions

function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  if (b === 0) {
    return null;
  }

  return a / b;
}

// Choose the math operation

function operate(operator, a, b) {
  if (operator === "+") {
    return add(a, b);
  } else if (operator === "-") {
    return subtract(a, b);
  } else if (operator === "*") {
    return multiply(a, b);
  } else if (operator === "/") {
    return divide(a, b);
  }
}

// Update the calculator display

function updateDisplay() {
  currentDisplay.textContent = currentNumber;

  if (firstNumber !== null && operator !== null) {
    previousDisplay.textContent =
      firstNumber + " " + getOperatorSymbol(operator);
  } else {
    previousDisplay.textContent = "";
  }

  buttons.forEach(function(button) {
    if (button.dataset.operator) {
      button.classList.toggle(
        "selected",
        button.dataset.operator === operator
      );
    }
  });
}

function getOperatorSymbol(operator) {
  if (operator === "*") return "×";
  if (operator === "/") return "÷";
  if (operator === "-") return "−";
  return operator;
}

// Round long decimal answers

function formatNumber(number) {
  return String(Number(number.toPrecision(10)));
}

// Enter a number

function inputNumber(number) {
  if (currentNumber === "Error") {
    clearCalculator();
  }

  if (resultDisplayed) {
    currentNumber = number;
    firstNumber = null;
    operator = null;
    resultDisplayed = false;
    waitingForNumber = false;
  } else if (waitingForNumber) {
    currentNumber = number;
    waitingForNumber = false;
  } else if (currentNumber === "0") {
    currentNumber = number;
  } else if (currentNumber === "-0") {
    currentNumber = "-" + number;
  } else if (currentNumber.length < 15) {
    currentNumber += number;
  }

  updateDisplay();
}

// Enter a decimal point

function inputDecimal() {
  if (currentNumber === "Error") {
    clearCalculator();
  }

  if (resultDisplayed) {
    currentNumber = "0.";
    resultDisplayed = false;
    firstNumber = null;
    operator = null;
    waitingForNumber = false;
  } else if (waitingForNumber) {
    currentNumber = "0.";
    waitingForNumber = false;
  } else if (!currentNumber.includes(".")) {
    currentNumber += ".";
  }

  updateDisplay();
}

// Choose an operator

function chooseOperator(nextOperator) {
  if (currentNumber === "Error") {
    return;
  }

  const inputValue = Number(currentNumber);

  if (operator !== null && !waitingForNumber) {
    const result = operate(operator, firstNumber, inputValue);

    if (result === null) {
      showError();
      return;
    }

    if (!Number.isFinite(result)) {
      showError();
      return;
    }

    currentNumber = formatNumber(result);
    firstNumber = result;
  } else if (firstNumber === null || resultDisplayed) {
    firstNumber = inputValue;
  }

  operator = nextOperator;
  waitingForNumber = true;
  resultDisplayed = false;

  updateDisplay();
}

// Calculate the result

function calculateResult() {
  if (
    operator === null ||
    firstNumber === null ||
    waitingForNumber ||
    currentNumber === "Error"
  ) {
    return;
  }

  const secondNumber = Number(currentNumber);
  const result = operate(operator, firstNumber, secondNumber);

  if (result === null || !Number.isFinite(result)) {
    showError();
    return;
  }

  previousDisplay.textContent =
    firstNumber + " " + getOperatorSymbol(operator) +
    " " + secondNumber + " =";

  currentNumber = formatNumber(result);
  firstNumber = null;
  operator = null;
  waitingForNumber = false;
  resultDisplayed = true;

  updateDisplay();
}

// Show an error

function showError() {
  currentNumber = "Error";
  firstNumber = null;
  operator = null;
  waitingForNumber = true;
  resultDisplayed = false;

  updateDisplay();
  previousDisplay.textContent = "Cannot divide by zero";
}

// Clear everything

function clearCalculator() {
  currentNumber = "0";
  firstNumber = null;
  operator = null;
  waitingForNumber = false;
  resultDisplayed = false;

  updateDisplay();
}

// Remove the last digit

function backspace() {
  if (resultDisplayed || currentNumber === "Error") {
    clearCalculator();
    return;
  }

  if (waitingForNumber) {
    return;
  }

  if (
    currentNumber.length === 1 ||
    (currentNumber.length === 2 && currentNumber.startsWith("-"))
  ) {
    currentNumber = "0";
  } else {
    currentNumber = currentNumber.slice(0, -1);
  }

  updateDisplay();
}

// Change positive to negative or negative to positive

function changeSign() {
  if (currentNumber === "Error") {
    return;
  }

  if (resultDisplayed) {
    resultDisplayed = false;
  }

  if (waitingForNumber) {
    currentNumber = "-0";
    waitingForNumber = false;
  } else if (currentNumber.startsWith("-")) {
    currentNumber = currentNumber.slice(1);
  } else {
    currentNumber = "-" + currentNumber;
  }

  updateDisplay();
}

// Convert the current number to a percentage

function calculatePercent() {
  if (currentNumber === "Error" || waitingForNumber) {
    return;
  }

  currentNumber = formatNumber(Number(currentNumber) / 100);
  resultDisplayed = false;

  updateDisplay();
}

// Make the buttons work

buttons.forEach(function(button) {
  button.addEventListener("click", function() {
    if (button.dataset.number !== undefined) {
      inputNumber(button.dataset.number);
    } else if (button.dataset.operator) {
      chooseOperator(button.dataset.operator);
    } else if (button.dataset.action === "clear") {
      clearCalculator();
    } else if (button.dataset.action === "backspace") {
      backspace();
    } else if (button.dataset.action === "decimal") {
      inputDecimal();
    } else if (button.dataset.action === "equals") {
      calculateResult();
    } else if (button.dataset.action === "sign") {
      changeSign();
    } else if (button.dataset.action === "percent") {
      calculatePercent();
    }
  });
});

// Support keyboard input

document.addEventListener("keydown", function(event) {
  if (event.key >= "0" && event.key <= "9") {
    inputNumber(event.key);
  } else if (event.key === ".") {
    inputDecimal();
  } else if (["+", "-", "*", "/"].includes(event.key)) {
    chooseOperator(event.key);
  } else if (event.key === "Enter" || event.key === "=") {
    event.preventDefault();
    calculateResult();
  } else if (event.key === "Backspace") {
    backspace();
  } else if (event.key === "Escape" || event.key === "Delete") {
    clearCalculator();
  } else if (event.key === "%") {
    calculatePercent();
  }
});

updateDisplay();
