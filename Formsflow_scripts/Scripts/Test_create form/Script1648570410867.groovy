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

WebUI.navigateToUrl('https://app3.aot-technologies.com/')

WebUI.setText(findTestObject('Object Repository/task variable/Page_Log in to formsflow-ai-maple/input_Username or email_username'), 
    'peter-watts')

WebUI.setEncryptedText(findTestObject('Object Repository/task variable/Page_Log in to formsflow-ai-maple/input_Password_password'), 
    '76bZg6XXmfs=')

WebUI.sendKeys(findTestObject('Object Repository/task variable/Page_Log in to formsflow-ai-maple/input_Password_password'), 
    Keys.chord(Keys.ENTER))

WebUI.setText(findTestObject('task variable/Page_formsflow.ai/input_Form_to search'), 'Automation Test')

WebUI.click(findTestObject('task variable/Page_formsflow.ai/search_form icon'))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/span_ViewEdit Form'))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/button_Edit Form'))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/span_Save Form'))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/button_Next'))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/button_Edit'))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/span_One Step Approval'))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/span_One Step Approval task listener'))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/span_Task variable'))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/span_Add'))

WebUI.click(findTestObject('task variable/Page_formsflow.ai/Select form field'))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/div_name (Name)'))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/span_Add'))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/span_Add'))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/div_Select form field'))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/div_number (Number)'))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/span_Add'))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/span_Add'))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/div_Select form field_css-1gtu0rj-indicator_3594c9'))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/div_applicationId (applicationId)'))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/span_Add'))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/span_Add'))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/div_Select form field_css-1gtu0rj-indicator_3594c9'))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/div_applicationStatus (applicationStatus)'))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/span_Add'))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/span_Next'))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/span_Save'))

WebUI.doubleClick(findTestObject('Object Repository/task variable/Page_formsflow.ai/div_Form Workflow Association Saved'))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/span_Peter Watts'))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/a_Logout'))

WebUI.setText(findTestObject('Object Repository/task variable/Page_Log in to formsflow-ai-maple/input_Username or email_username'), 
    'john.honai')

WebUI.setEncryptedText(findTestObject('Object Repository/task variable/Page_Log in to formsflow-ai-maple/input_Password_password'), 
    '76bZg6XXmfs=')

WebUI.sendKeys(findTestObject('Object Repository/task variable/Page_Log in to formsflow-ai-maple/input_Password_password'), 
    Keys.chord(Keys.ENTER))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/a_Forms'))

WebUI.setText(findTestObject('task variable/Page_formsflow.ai/input_Form_to search'), 'Automation Test')

WebUI.click(findTestObject('task variable/Page_formsflow.ai/search_form icon'))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/span_Submit New'))

WebUI.setText(findTestObject('Object Repository/task variable/Page_formsflow.ai/input_Name_dataname'), 'John smith')

WebUI.setText(findTestObject('Object Repository/task variable/Page_formsflow.ai/input_, numeric only,_datanumber'), '3231')

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/input_, numeric only,_dataagree'))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/button_Submit'))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/a_Applications'))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/a_Tasks'))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/i_New_fa fa-angle-down'))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/div_Select a task in the list'))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/div_One Step Approval task listener'))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/input_Created_filter'))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/div_Process Variables'))

WebUI.click(findTestObject('task variable/Page_formsflow.ai/div_type'))

WebUI.click(findTestObject('task variable/Page_formsflow.ai/span_property'))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/span_applicationStatus  (applicationStatus)'))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/span__1'))

WebUI.setText(findTestObject('Object Repository/task variable/Page_formsflow.ai/input_applicationStatus_filters'), 'New')

WebUI.click(findTestObject('task variable/Page_formsflow.ai/check_Status'))

WebUI.click(findTestObject('task variable/Page_formsflow.ai/Expand_icon_Task'))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/span_New'))

