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

for (int i = 0; i <= 50; i++) {
    WebUI.delay(10)

    WebUI.click(findTestObject('Businesslicensecreateform/Page_formsflow.ai/span_Submit New'))

    WebUI.setText(findTestObject('Object Repository/FOI_client_submitform/Page_formsflow.ai/input_Business Operating Name_databusinessO_c3a9d7'), 
        findTestData('Data_FOI_businessLIcense').getValue(10, 1))

    WebUI.scrollToElement(findTestObject('FOI_client_submitform/Page_formsflow.ai/Business_Start_Date'), 3)

    WebUI.click(findTestObject('FOI_client_submitform/Page_formsflow.ai/span_Proposed Business Start Date'))

    WebUI.click(findTestObject('Businesslicensecreateform/Page_formsflow.ai/span_date'))

    WebUI.setText(findTestObject('Object Repository/FOI_client_submitform/Page_formsflow.ai/input_Business E-Mail_dataeMail'), 
        findTestData('Data_FOI_businessLIcense').getValue(12, 1))

    WebUI.setText(findTestObject('Object Repository/FOI_client_submitform/Page_formsflow.ai/input_Nature of Business_datanatureOfBusiness'), 
        findTestData('Data_FOI_businessLIcense').getValue(11, 1))

    WebUI.setText(findTestObject('Object Repository/FOI_client_submitform/Page_formsflow.ai/input_Number of Employees_datanumberOfEmployees'), 
        findTestData('Data_FOI_businessLIcense').getValue(13, 1))

    WebUI.setText(findTestObject('Object Repository/FOI_client_submitform/Page_formsflow.ai/input_Business Phone_databusinessPhone'), 
        findTestData('Data_FOI_businessLIcense').getValue(14, 1))

    WebUI.scrollToElement(findTestObject('FOI_client_submitform/Page_formsflow.ai/soleproprietor'), 3)

    WebUI.click(findTestObject('FOI_client_submitform/Page_formsflow.ai/soleproprietor'))

    WebUI.setText(findTestObject('Object Repository/FOI_client_submitform/Page_formsflow.ai/input_Corporation_datasoleProprietorsNameIf_7df650'), 
        findTestData('Data_FOI_businessLIcense').getValue(15, 1))

    WebUI.click(findTestObject('FOI_client_submitform/Page_formsflow.ai/homebasedbusiness'))

    WebUI.click(findTestObject('FOI_client_submitform/Page_formsflow.ai/intermuncipal_license'))

    WebUI.click(findTestObject('FOI_client_submitform/Page_formsflow.ai/BuildingPermitRequired'))

    WebUI.scrollToElement(findTestObject('FOI_client_submitform/Page_formsflow.ai/button_Submit_business'), 3)

    WebUI.click(findTestObject('FOI_client_submitform/Page_formsflow.ai/button_Submit_business'))
}

