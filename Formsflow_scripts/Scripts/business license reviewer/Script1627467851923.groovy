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

WebUI.click(findTestObject('Object Repository/task filter/Page_formsflow.ai/a_Tasks'))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/input_Created_filter'))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/div_Process Variables'))

WebUI.click(findTestObject('task variable/Page_formsflow.ai/div_type'))

WebUI.click(findTestObject('task variable/Page_formsflow.ai/span_property'))

WebUI.click(findTestObject('task variable/Page_formsflow.ai/span_applicationStatus  (applicationStatus)'))

WebUI.click(findTestObject('Object Repository/task variable/Page_formsflow.ai/span__1'))

WebUI.setText(findTestObject('Object Repository/task variable/Page_formsflow.ai/input_applicationStatus_filters'), findTestData(
        'Search_values').getValue(5, 4))

WebUI.click(findTestObject('task variable/Page_formsflow.ai/check_Status'))

WebUI.click(findTestObject('task variable/Page_formsflow.ai/Expand_icon_Task'))

WebUI.click(findTestObject('Object Repository/businessform_clerk-reviewer/Page_formsflow.ai/div_Two Step Approval'))

WebUI.click(findTestObject('Object Repository/businessform_clerk-reviewer/Page_formsflow.ai/span_Claim'))

WebUI.scrollToElement(findTestObject('businessform_clerk-reviewer/Page_formsflow.ai/div_Select Approver Action_dropdown'), 
    3)

WebUI.click(findTestObject('businessform_clerk-reviewer/Page_formsflow.ai/div_Select Approver Action_dropdown'))

WebUI.setText(findTestObject('Businesslicensecreateform/Page_formsflow.ai/input_Select Approver_Action_choices'), 'Approved')

WebUI.sendKeys(findTestObject('Businesslicensecreateform/Page_formsflow.ai/input_Select Approver_Action_choices'), Keys.chord(
        Keys.ENTER))

WebUI.click(findTestObject('businessform_clerk-reviewer/Page_formsflow.ai/select_Approved_reviewer'))

WebUI.scrollToElement(findTestObject('businessform_clerk-reviewer/Page_formsflow.ai/textarea_Approver Comments_dataapproverComments'), 
    3)

WebUI.setText(findTestObject('Object Repository/businessform_clerk-reviewer/Page_formsflow.ai/textarea_Approver Comments_dataapproverComments'), 
    'approved')

WebUI.click(findTestObject('businessform_clerk-reviewer/Page_formsflow.ai/button_Submit_approver'))

WebUI.delay(3)

WebUI.click(findTestObject('businessform_clerk-reviewer/Page_formsflow.ai/a_Applications'))

WebUI.click(findTestObject('businessform_clerk-reviewer/Page_formsflow.ai/application_id'))

WebUI.click(findTestObject('Object Repository/businessform_clerk-reviewer/Page_formsflow.ai/a_Form'))

WebUI.click(findTestObject('Object Repository/businessform_clerk-reviewer/Page_formsflow.ai/a_History'))

WebUI.click(findTestObject('businessform_clerk-reviewer/Page_formsflow.ai/a_history_nextpage'))

WebUI.click(findTestObject('Object Repository/businessform_clerk-reviewer/Page_formsflow.ai/a_Process Diagram'))

