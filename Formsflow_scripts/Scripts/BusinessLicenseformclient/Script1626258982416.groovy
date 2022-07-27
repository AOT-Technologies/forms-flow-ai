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

WebUI.delay(3)

WebUI.selectOptionByValue(findTestObject('business/Page_formsflow.ai/select_102550100All'), '999999', true)

WebUI.click(findTestObject('business/Page_formsflow.ai/span_Submit New'))

WebUI.setText(findTestObject('Object Repository/FOI_client_submitform/Page_formsflow.ai/input_Business Operating Name_databusinessO_c3a9d7'), 
    findTestData('data for other fields').getValue(1, 2))

WebUI.click(findTestObject('business1/Page_formsflow.ai/i_Proposed Business Start Date_fa fa-calendar'))

WebUI.setText(findTestObject('Businesslicensecreateform/Page_formsflow.ai/input_date'), '04/29/2022')

WebUI.sendKeys(findTestObject('Businesslicensecreateform/Page_formsflow.ai/input_date'), Keys.chord(Keys.ENTER))

WebUI.setText(findTestObject('business/Page_formsflow.ai/input_Business E-Mail_dataeMail'), findTestData('data for other fields').getValue(
        3, 2))

WebUI.setText(findTestObject('FOI_client_submitform/Page_formsflow.ai/input_Nature of Business_datanatureOfBusiness'), findTestData(
        'data for other fields').getValue(2, 2))

WebUI.setText(findTestObject('FOI_client_submitform/Page_formsflow.ai/input_Number of Employees_datanumberOfEmployees'), 
    findTestData('data for other fields').getValue(4, 2))

WebUI.click(findTestObject('Object Repository/business test/Page_formsflow.ai/span_Sole Proprietor'))

WebUI.click(findTestObject('business/Page_formsflow.ai/label_No'))

WebUI.click(findTestObject('FOI_client_submitform/Page_formsflow.ai/intermuncipal_license'))

WebUI.click(findTestObject('FOI_client_submitform/Page_formsflow.ai/BuildingPermitRequired'))

WebUI.scrollToElement(findTestObject('business/Page_formsflow.ai/button_Submit'), 3)

WebUI.click(findTestObject('business/Page_formsflow.ai/button_Submit'))

WebUI.verifyTextPresent('Submission Saved', false)

WebUI.delay(3)

WebUI.click(findTestObject('BusinessLicense/a_Applications'))

WebUI.click(findTestObject('Object Repository/Reviewer_task/Page_formsflow.ai/a_23'))

WebUI.click(findTestObject('Object Repository/Reviewer_task/Page_formsflow.ai/a_Form'))

WebUI.click(findTestObject('Object Repository/Reviewer_task/Page_formsflow.ai/a_History'))

//WebUI.switchToWindowIndex(1)
//WebUI.executeJavaScript('window.scrollTo(0, document.body.scrollHeight)', null)
//WebUI.delay(3)
//WebUI.closeWindowIndex(1)
//WebUI.switchToWindowIndex(0)
WebUI.click(findTestObject('Reviewer_task/Page_formsflow.ai/a_Process Diagram'))

