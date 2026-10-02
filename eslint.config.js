// ESlint is a linter. Linters read through your code files and ensure that you are following best practices.
// In this case this ESLint is set up to check that you aren't leaving unused variables around.
// To see it in action:
    // define a variable
    // don't use it
    // save the file
    // run npm test or npm run lint
    // ESLint will find the unused var and notify you in the console.
    // Later we will use this to remove unused console.log which shouldn't remain on the server

// This file is the settings file for our ESLint. 
// We could add additional rules to check for by installing the right packages with those rules
const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
    {
        languageOptions: {
            globals: globals.node
        },
    },
    {
        // Files in public/ run in the browser, not in Node
        files: ["public/**/*.js"],
        languageOptions: {
            globals: globals.browser
        },
    },
    js.configs.recommended
];