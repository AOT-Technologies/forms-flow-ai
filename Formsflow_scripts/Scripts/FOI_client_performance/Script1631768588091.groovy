import static com.kms.katalon.core.checkpoint.CheckpointFactory.findCheckpoint
import static com.kms.katalon.core.testcase.TestCaseFactory.findTestCase
import static com.kms.katalon.core.testdata.TestDataFactory.findTestData
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import static com.kms.katalon.core.testobject.ObjectRepository.findWindowsObject
import com.kms.katalon.core.checkpoint.Checkpoint as Checkpoint
import com.kms.katalon.core.cucumber.keyword.CucumberBuiltinKeywords as CucumberKW
import com.kms.katalon.core.mobile.keyword.MobileBuiltInKeywords as Mobile
import com.kms.katalon.core.model.FailureHandling as FailureHandling
import com.kms.katalon.core.testcase.TestCase as TestCase
import com.kms.katalon.core.testdata.TestData as TestData
import com.kms.katalon.core.testng.keyword.TestNGBuiltinKeywords as TestNGKW
import com.kms.katalon.core.testobject.TestObject as TestObject
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WS
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import com.kms.katalon.core.windows.keyword.WindowsBuiltinKeywords as Windows
import internal.GlobalVariable as GlobalVariable
import org.openqa.selenium.Keys as Keys

for (int i = 0; i <= 2000; i++) {
    WebUI.delay(5)

    //for (int i = 0; i < 5; i++) {
    WebUI.click(findTestObject('FOI_client_submitform/Page_formsflow.ai/span_foi'))

    WebUI.click(findTestObject('FOI_client_submitform/Page_formsflow.ai/div_Name of Public Body'))

    WebUI.click(findTestObject('FOI_client_submitform/Page_formsflow.ai/publicbody_dropdown'))

    WebUI.setText(findTestObject('Object Repository/FOI_client_submitform/Page_formsflow.ai/input_First Name_datafirstName'), 
        findTestData('Data_FOI_businessLIcense').getValue(1, 1))

    WebUI.setText(findTestObject('Object Repository/FOI_client_submitform/Page_formsflow.ai/input_Last Name_datalastName'), 
        findTestData('Data_FOI_businessLIcense').getValue(2, 1))

    WebUI.setText(findTestObject('FOI_client_submitform/Page_formsflow.ai/input_Street, Apartment No'), findTestData('Data_FOI_businessLIcense').getValue(
            3, 1))

    WebUI.setText(findTestObject('FOI_client_submitform/Page_formsflow.ai/input_City Town'), findTestData('Data_FOI_businessLIcense').getValue(
            4, 1))

    WebUI.setText(findTestObject('FOI_client_submitform/Page_formsflow.ai/input_Province Country'), findTestData('Data_FOI_businessLIcense').getValue(
            5, 1))

    WebUI.setText(findTestObject('FOI_client_submitform/Page_formsflow.ai/input_Postal Code'), findTestData('Data_FOI_businessLIcense').getValue(
            6, 1))

    WebUI.setText(findTestObject('Object Repository/FOI_client_submitform/Page_formsflow.ai/input_Day Phone No_datadayPhoneNo'), 
        findTestData('Data_FOI_businessLIcense').getValue(7, 1))

    WebUI.setText(findTestObject('Object Repository/FOI_client_submitform/Page_formsflow.ai/input_E-mail Address_dataeMailAddress'), 
        findTestData('Data_FOI_businessLIcense').getValue(8, 1))

    WebUI.setText(findTestObject('FOI_client_submitform/Page_formsflow.ai/Details Of Requested Information'), findTestData(
            'Data_FOI_businessLIcense').getValue(9, 1))

    WebUI.scrollToElement(findTestObject('FOI_client_submitform/Page_formsflow.ai/preferred_method to access records'), 
        3)

    WebUI.click(findTestObject('FOI_client_submitform/Page_formsflow.ai/preferred_method to access records'))

    WebUI.scrollToElement(findTestObject('FOI_client_submitform/Page_formsflow.ai/button_submit_FOI'), 3)

    WebUI.click(findTestObject('FOI_client_submitform/Page_formsflow.ai/button_Submit form'))
}

