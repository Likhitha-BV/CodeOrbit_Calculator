"use strict";

/*
 * Calculator state
 */

let currentValue = "0";
let previousValue = null;
let operator = null;

let waitingForNewValue = false;
let lastExpression = "";

const display = document.getElementById("display");
const expressionDisplay = document.getElementById("expression");
const errorMessage = document.getElementById("errorMessage");
const historyContainer = document.getElementById("history");
const clearHistoryButton = document.getElementById("clearHistory");

const MAX_DIGITS = 15;
const MAX_RESULT = Number.MAX_SAFE_INTEGER;


/*
 * Display
 */

function updateDisplay() {

    display.value = currentValue;

    expressionDisplay.textContent = lastExpression || "";

}


/*
 * Error handling
 */

function showError(message) {

    errorMessage.textContent = message;

    setTimeout(() => {

        errorMessage.textContent = "";

    }, 2500);
}


/*
 * Clear calculator
 */

function clearCalculator() {

    currentValue = "0";

    previousValue = null;

    operator = null;

    waitingForNewValue = false;

    lastExpression = "";

    errorMessage.textContent = "";

    updateDisplay();
}


/*
 * Validate number input
 */

function isValidNumber(value) {

    if (typeof value !== "string") {
        return false;
    }

    if (value.trim() === "") {
        return false;
    }

    return !isNaN(Number(value));
}


/*
 * Check number size
 */

function isNumberTooLarge(value) {

    const number = Number(value);

    return !Number.isFinite(number);
}


/*
 * Add number
 */

function inputNumber(number) {

    clearError();

    if (!/^\d$/.test(number)) {
        showError("Invalid number");

        return;
    }

    if (waitingForNewValue) {

        currentValue = number;

        waitingForNewValue = false;

    } else {

        if (currentValue === "0") {

            currentValue = number;

        } else {

            const digitCount =
                currentValue.replace("-", "")
                    .replace(".", "")
                    .length;

            if (digitCount >= MAX_DIGITS) {

                showError("Maximum digits reached");

                return;
            }

            currentValue += number;
        }
    }

    updateDisplay();
}


/*
 * Add decimal
 */

function inputDecimal() {

    clearError();

    if (waitingForNewValue) {

        currentValue = "0.";

        waitingForNewValue = false;

        updateDisplay();

        return;
    }

    if (currentValue.includes(".")) {

        showError("Decimal already exists");

        return;
    }

    currentValue += ".";

    updateDisplay();
}


/*
 * Delete last character
 */

function deleteLastCharacter() {

    clearError();

    if (waitingForNewValue) {
        return;
    }

    if (currentValue.length <= 1) {

        currentValue = "0";

    } else {

        currentValue =
            currentValue.substring(
                0,
                currentValue.length - 1
            );

        if (
            currentValue === "-" ||
            currentValue === ""
        ) {

            currentValue = "0";
        }
    }

    updateDisplay();
}


/*
 * Operator
 */

function chooseOperator(selectedOperator) {

    clearError();

    if (!["+", "-", "*", "/"].includes(selectedOperator)) {

        showError("Invalid operator");

        return;
    }

    if (!isValidNumber(currentValue)) {

        showError("Invalid number");

        return;
    }

    const inputValue = Number(currentValue);

    if (!Number.isFinite(inputValue)) {

        showError("Invalid number");

        return;
    }

    /*
     * If there is already an operator,
     * calculate previous operation first.
     */

    if (operator !== null && previousValue !== null) {

        const result = performCalculation(
            previousValue,
            inputValue,
            operator
        );

        if (result === null) {
            return;
        }

        currentValue = formatResult(result);

        previousValue = result;

    } else {

        previousValue = inputValue;
    }

    operator = selectedOperator;

    waitingForNewValue = true;

    lastExpression =
        `${formatResult(previousValue)} ${getOperatorSymbol(selectedOperator)}`;

    updateDisplay();
}


/*
 * Calculate
 */

function calculate() {

    clearError();

    if (
        operator === null ||
        previousValue === null
    ) {

        showError("Enter a calculation");

        return;
    }

    if (!isValidNumber(currentValue)) {

        showError("Invalid number");

        return;
    }

    const secondValue = Number(currentValue);

    if (!Number.isFinite(secondValue)) {

        showError("Invalid number");

        return;
    }

    const result = performCalculation(
        previousValue,
        secondValue,
        operator
    );

    if (result === null) {
        return;
    }

    const expression =
        `${formatResult(previousValue)} ` +
        `${getOperatorSymbol(operator)} ` +
        `${formatResult(secondValue)}`;

    const formattedResult = formatResult(result);

    lastExpression = `${expression} =`;

    addHistory(
        expression,
        formattedResult
    );

    currentValue = formattedResult;

    previousValue = null;

    operator = null;

    waitingForNewValue = true;

    updateDisplay();
}


/*
 * Perform mathematical calculation
 */

function performCalculation(first, second, selectedOperator) {

    let result;

    switch (selectedOperator) {

        case "+":

            result = first + second;

            break;

        case "-":

            result = first - second;

            break;

        case "*":

            result = first * second;

            break;

        case "/":

            if (second === 0) {

                showError("Cannot divide by zero");

                return null;
            }

            result = first / second;

            break;

        default:

            showError("Invalid operator");

            return null;
    }

    /*
     * Prevent Infinity and NaN.
     */

    if (!Number.isFinite(result)) {

        showError("Result is too large");

        return null;
    }

    if (Math.abs(result) > MAX_RESULT) {

        showError("Result is too large");

        return null;
    }

    return result;
}


/*
 * Percentage
 */

function calculatePercentage() {

    clearError();

    if (!isValidNumber(currentValue)) {

        showError("Invalid number");

        return;
    }

    const number = Number(currentValue);

    if (!Number.isFinite(number)) {

        showError("Invalid number");

        return;
    }

    currentValue = formatResult(number / 100);

    updateDisplay();
}


/*
 * Format result
 */

function formatResult(value) {

    if (!Number.isFinite(value)) {

        return "0";
    }

    /*
     * Remove floating-point precision errors.
     *
     * Example:
     * 0.1 + 0.2
     * becomes 0.3 instead of
     * 0.30000000000000004
     */

    const rounded =
        Number.parseFloat(
            value.toPrecision(12)
        );

    return String(rounded);
}


/*
 * Operator symbols
 */

function getOperatorSymbol(value) {

    const symbols = {
        "+": "+",
        "-": "−",
        "*": "×",
        "/": "÷"
    };

    return symbols[value] || value;
}


/*
 * Clear error
 */

function clearError() {

    errorMessage.textContent = "";
}


/*
 * History
 */

function addHistory(expression, result) {

    const emptyMessage =
        historyContainer.querySelector(".empty-history");

    if (emptyMessage) {
        emptyMessage.remove();
    }

    const item =
        document.createElement("div");

    item.className = "history-item";

    const expressionElement =
        document.createElement("span");

    expressionElement.className =
        "history-expression";

    expressionElement.textContent =
        expression;

    const resultElement =
        document.createElement("span");

    resultElement.className =
        "history-result";

    resultElement.textContent =
        result;

    item.appendChild(expressionElement);

    item.appendChild(resultElement);

    historyContainer.prepend(item);
}


/*
 * Clear history
 */

function clearHistory() {

    historyContainer.innerHTML =
        `<p class="empty-history">
            No calculations yet
         </p>`;
}


/*
 * Button clicks
 */

document
    .querySelectorAll(".btn")
    .forEach(button => {

        button.addEventListener("click", () => {

            const value =
                button.dataset.value;

            const action =
                button.dataset.action;

            /*
             * Number
             */

            if (
                value !== undefined &&
                /^\d$/.test(value)
            ) {

                inputNumber(value);

                return;
            }

            /*
             * Decimal
             */

            if (value === ".") {

                inputDecimal();

                return;
            }

            /*
             * Operator
             */

            if (
                value !== undefined &&
                ["+", "-", "*", "/"].includes(value)
            ) {

                chooseOperator(value);

                return;
            }

            /*
             * Actions
             */

            switch (action) {

                case "clear":

                    clearCalculator();

                    break;

                case "delete":

                    deleteLastCharacter();

                    break;

                case "percent":

                    calculatePercentage();

                    break;

                case "calculate":

                    calculate();

                    break;

                default:

                    showError("Invalid action");
            }

        });

    });


/*
 * Clear history button
 */

clearHistoryButton.addEventListener(
    "click",
    clearHistory
);


/*
 * Keyboard support
 */

document.addEventListener(
    "keydown",
    event => {

        const key = event.key;

        /*
         * Numbers
         */

        if (/^\d$/.test(key)) {

            inputNumber(key);

            return;
        }

        /*
         * Decimal
         */

        if (key === ".") {

            inputDecimal();

            return;
        }

        /*
         * Operators
         */

        if (
            ["+", "-", "*", "/"].includes(key)
        ) {

            chooseOperator(key);

            return;
        }

        /*
         * Enter / =
         */

        if (
            key === "Enter" ||
            key === "="
        ) {

            event.preventDefault();

            calculate();

            return;
        }

        /*
         * Backspace
         */

        if (key === "Backspace") {

            deleteLastCharacter();

            return;
        }

        /*
         * Escape / Delete
         */

        if (
            key === "Escape" ||
            key === "Delete"
        ) {

            clearCalculator();

            return;
        }

        /*
         * Percentage
         */

        if (key === "%") {

            calculatePercentage();

            return;
        }
    }
);


/*
 * Initial state
 */

updateDisplay();