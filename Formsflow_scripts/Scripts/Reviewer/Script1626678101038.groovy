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
import com.kms.katalon.core.logging.KeywordLogger as KeywordLogger

WebUI.delay(3)

WebUI.click(findTestObject('Object Repository/Reviewer_task/Page_formsflow.ai/div_One Step Approval'))

WebUI.click(findTestObject('Reviewer_task/Page_formsflow.ai/span_Claim'))

WebUI.scrollToElement(findTestObject('Reviewer_task/Page_formsflow.ai/input_Request No_datarequestNo'), 3)

WebUI.setText(findTestObject('Object Repository/Reviewer_task/Page_formsflow.ai/input_Request No_datarequestNo'), findTestData(
        'Data_FOI_businessLIcense').getValue(10, 2))

WebUI.setText(findTestObject('Object Repository/Reviewer_task/Page_formsflow.ai/input_Request Code_datarequestCode'), findTestData(
        'Data_FOI_businessLIcense').getValue(11, 2))

//WebUI.waitForElementClickable(findTestObject('Reviewer_task/Page_formsflow.ai/select_Date_from calendar'), 3)
//WebUI.click(findTestObject('Reviewer_task/Page_formsflow.ai/select_Date_from calendar'))
WebUI.click(findTestObject('Reviewer_task/Page_formsflow.ai/Select Review Actions dropdown'))

WebUI.setText(findTestObject('Businesslicensecreateform/test/Page_formsflow.ai/Enter value to select from Dropdown'), 'Approved')

WebUI.sendKeys(findTestObject('Businesslicensecreateform/test/Page_formsflow.ai/Enter value to select from Dropdown'), Keys.chord(
        Keys.ENTER))

WebUI.scrollToElement(findTestObject('Reviewer_task/Page_formsflow.ai/button_Submit Action'), 3)

WebUI.click(findTestObject('Object Repository/Reviewer_task/Page_formsflow.ai/button_Submit Action'))

WebUI.click(findTestObject('Reviewer_task/Page_formsflow.ai/a_Applications'))

WebUI.click(findTestObject('Reviewer_task/Page_formsflow.ai/reviewer_applicationstatus'))

WebUI.click(findTestObject('Object Repository/Reviewer_task/Page_formsflow.ai/a_Form'))

WebUI.click(findTestObject('Object Repository/Reviewer_task/Page_formsflow.ai/a_History'))

WebUI.click(findTestObject('Object Repository/Reviewer_task/Page_formsflow.ai/a_Process Diagram'))

WebUI.delay(2)

KeywordLogger log = new KeywordLogger()

log.logInfo('Submission complete')

