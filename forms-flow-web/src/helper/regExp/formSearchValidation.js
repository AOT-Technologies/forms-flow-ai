const searchValidator = (searchText) => {
    let char = '';
    const a = searchText;
    if (searchText !== '') {
        for (var i = 0; i < a?.length; i++) {
            char = a.charCodeAt(i);
            if (((char > 32) && (char < 45)) || ((char > 45) && (char < 48))
                || ((char > 57) && (char < 65)) || ((char > 90) && (char < 95))
                || ((char > 95) && (char < 97)) || (char > 122)) {
                return false;
            }
        }
    }
    return true;
};
export default searchValidator;
