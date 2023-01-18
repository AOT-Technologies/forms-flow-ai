const pattern = new RegExp("[^0-9]", "g");

const isValiResourceId = function(input) {
    return input.match(pattern) ? false : true;
};

export default isValiResourceId;