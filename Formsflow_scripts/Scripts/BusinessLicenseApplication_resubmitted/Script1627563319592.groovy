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

WebUI.click(findTestObject('business1/Page_formsflow.ai/a_Applications'))

WebUI.click(findTestObject('Object Repository/businessform_clerk-reviewer/Page_formsflow.ai/span_Edit'))

WebUI.switchToWindowIndex(1)

WebUI.executeJavaScript('window.scrollTo(0, document.body.scrollHeight)', null)

WebUI.delay(3)

WebUI.scrollToElement(findTestObject('businessform_clerk-reviewer/Page_formsflow.ai/input_Business E-Mail_dataeMail'), 3)

WebUI.setText(findTestObject('Object Repository/businessform_clerk-reviewer/Page_formsflow.ai/input_Business E-Mail_dataeMail'), 
    findTestData('data for other fields').getValue(3, 2))

WebUI.click(findTestObject('Object Repository/businessform_clerk-reviewer/Page_formsflow.ai/button_Submit_1'))

WebUI.verifyTextPresent('Submission Saved', false)

WebUI.delay(2)

WebUI.click(findTestObject('business1/Page_formsflow.ai/a_Applications'))

WebUI.click(findTestObject('businessform_clerk-reviewer/Page_formsflow.ai/application_id'))

WebUI.click(findTestObject('Object Repository/businessform_clerk-reviewer/Page_formsflow.ai/a_History'))

WebUI.click(findTestObject('Object Repository/businessform_clerk-reviewer/Page_formsflow.ai/a_Process Diagram'))

