
const searchValidator = (searchText) => {
var char = '';
let a = searchText;
if(searchText !== ''){
for(var i = 0;i < a.length;i++)
{
	char = a.charCodeAt(i);
		//alert(t);
	if((( char > 32) && (char < 48)) || ((char > 57) && (char < 65)) 
    || ((char > 90) && (char < 97)) || (char > 122))
	{
				return false;
	}
}
}
};
export default searchValidator;