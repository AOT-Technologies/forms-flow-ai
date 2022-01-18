import { getFormattedForm } from "../../../../../../../components/Form/constants/formListConstants";
import '@testing-library/jest-dom/extend-expect';
import { mockForm,expected } from "./constant";

// test cases for getFormattedForm

test("should return formatted form object",()=>{
    expect(Object.keys(getFormattedForm(mockForm)).sort()).toEqual(Object.keys(expected).sort())
})
