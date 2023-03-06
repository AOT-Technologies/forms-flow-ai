const inputValidator = (inputText) => {
    // Set a flag to indicate whether the input is valid or not
    let valid = true;
    // Iterate over each character in the inputText string using a for...of loop
    for (const char of inputText) {
        // Get the Unicode code point of the character
        const charCode = char.charCodeAt(0);
        console.log(charCode);
        // Check if the character is not within the valid range of ASCII characters
        if (((charCode > 32) && (charCode < 45))
            || ((charCode > 45) && (charCode < 48))
            || ((charCode > 57) && (charCode < 65))
            || ((charCode > 90) && (charCode < 95))
            || ((charCode > 95) && (charCode < 97))
            || (charCode > 122)) {
            // If an invalid character is found, set the valid flag to false and exit the loop
            valid = false;
            break;
        }
    }
    // Return the final value of the valid flag
    return valid;
};
// Export the inputValidater function as the default export of the module
export default inputValidator;
