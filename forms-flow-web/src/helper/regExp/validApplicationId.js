const pattern = new RegExp("[^0-9]", "g");

const isValidApplicationId = function(input) {
    return input.match(pattern) ? false : true;
};

export default isValidApplicationId;