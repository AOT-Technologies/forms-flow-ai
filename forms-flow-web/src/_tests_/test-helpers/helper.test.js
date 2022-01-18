import { replaceUrl } from "../../helper/helper";
import '@testing-library/jest-dom/extend-expect';

test('replace the second param in the first param with the third param ',()=>{
    expect(replaceUrl('this is a string to replace', 'to replace','after replace')).toBe('this is a string after replace')
})
