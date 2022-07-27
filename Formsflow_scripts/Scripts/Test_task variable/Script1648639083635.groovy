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

WebUI.openBrowser('')

WebUI.openBrowser('')

WebUI.closeBrowser()

WebUI.openBrowser('')

WebUI.navigateToUrl('https://app3.aot-technologies.com/')

WebUI.setText(findTestObject('Object Repository/testtask/Page_Log in to formsflow-ai-maple/input_Username or email_username'), 
    'john.honai')

WebUI.setEncryptedText(findTestObject('Object Repository/testtask/Page_Log in to formsflow-ai-maple/input_Password_password'), 
    '76bZg6XXmfs=')

WebUI.sendKeys(findTestObject('Object Repository/testtask/Page_Log in to formsflow-ai-maple/input_Password_password'), Keys.chord(
        Keys.ENTER))

WebUI.click(findTestObject('Object Repository/testtask/Page_formsflow.ai/a_Forms'))

WebUI.click(findTestObject('Object Repository/testtask/Page_formsflow.ai/span_ViewEdit Form'))

WebUI.click(findTestObject('Object Repository/testtask/Page_formsflow.ai/button_Next'))

WebUI.click(findTestObject('Object Repository/testtask/Page_formsflow.ai/button_Edit'))

WebUI.click(findTestObject('Object Repository/testtask/Page_formsflow.ai/span_Task variable'))

WebUI.click(findTestObject('Object Repository/testtask/Page_formsflow.ai/div_Add form fields to display in task list_c880e8'))

WebUI.click(findTestObject('Object Repository/testtask/Page_formsflow.ai/button_Add'))

WebUI.click(findTestObject('Object Repository/testtask/Page_formsflow.ai/div_Select form field'))

WebUI.setText(findTestObject('Object Repository/testtask/Page_formsflow.ai/input_Form field_react-select-2-input'), 'name')

WebUI.sendKeys(findTestObject('Object Repository/testtask/Page_formsflow.ai/input_Form field_react-select-2-input'), Keys.chord(
        Keys.ENTER))

WebUI.click(findTestObject('Object Repository/testtask/Page_formsflow.ai/span_Add'))

WebUI.click(findTestObject('Object Repository/testtask/Page_formsflow.ai/button_Add'))

WebUI.click(findTestObject('Object Repository/testtask/Page_formsflow.ai/div_Select form field'))

WebUI.setText(findTestObject('Object Repository/testtask/Page_formsflow.ai/input_Form field_react-select-3-input'), 'number')

WebUI.sendKeys(findTestObject('Object Repository/testtask/Page_formsflow.ai/input_Form field_react-select-3-input'), Keys.chord(
        Keys.ENTER))

WebUI.click(findTestObject('Object Repository/testtask/Page_formsflow.ai/span_Add'))

WebUI.click(findTestObject('Object Repository/testtask/Page_formsflow.ai/span_Add'))

WebUI.click(findTestObject('Object Repository/testtask/Page_formsflow.ai/div_Select form field'))

WebUI.setText(findTestObject('Object Repository/testtask/Page_formsflow.ai/input_Form field_react-select-4-input'), 'applicationid')

WebUI.sendKeys(findTestObject('Object Repository/testtask/Page_formsflow.ai/input_Form field_react-select-4-input'), Keys.chord(
        Keys.ENTER))

WebUI.click(findTestObject('Object Repository/testtask/Page_formsflow.ai/span_Add'))

WebUI.click(findTestObject('Object Repository/testtask/Page_formsflow.ai/span_Add'))

WebUI.click(findTestObject('Object Repository/testtask/Page_formsflow.ai/div_Select form field'))

WebUI.setText(findTestObject('Object Repository/testtask/Page_formsflow.ai/input_Form field_react-select-5-input'), 'applicationstatus')

WebUI.sendKeys(findTestObject('Object Repository/testtask/Page_formsflow.ai/input_Form field_react-select-5-input'), Keys.chord(
        Keys.ENTER))

WebUI.click(findTestObject('Object Repository/testtask/Page_formsflow.ai/span_Add'))

