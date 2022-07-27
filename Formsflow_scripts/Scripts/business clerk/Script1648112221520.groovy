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

WebUI.navigateToUrl('https://app2.aot-technologies.com/')

WebUI.setText(findTestObject('Object Repository/clerk/Page_Log in to forms-flow-mahagony/input_Username or email_username'), 
    'john.doe')

WebUI.setEncryptedText(findTestObject('Object Repository/clerk/Page_Log in to forms-flow-mahagony/input_Password_password'), 
    '76bZg6XXmfs=')

WebUI.sendKeys(findTestObject('Object Repository/clerk/Page_Log in to forms-flow-mahagony/input_Password_password'), Keys.chord(
        Keys.ENTER))

WebUI.click(findTestObject('Object Repository/clerk/Page_formsflow.ai/div_Two Step Approval-listener'))

WebUI.click(findTestObject('Object Repository/clerk/Page_formsflow.ai/div_Select Clerk Action_form-control ui flu_224690'))

WebUI.setText(findTestObject('clerk/Page_formsflow.ai/input_Select Clerk Action_choices'), 
    'Retu')

WebUI.selectOptionByValue(findTestObject('Object Repository/clerk/Page_formsflow.ai/select_spanReturnedspan'), 'Returned', 
    true)

WebUI.setText(findTestObject('Object Repository/clerk/Page_formsflow.ai/textarea_Clerk Comments_dataclerkComments'), 'erew')

WebUI.click(findTestObject('Object Repository/clerk/Page_formsflow.ai/button_Submit'))

WebUI.click(findTestObject('Object Repository/clerk/Page_formsflow.ai/div_One Step Approval_col-6 pr-0 text-right'))

WebUI.click(findTestObject('clerk/Page_formsflow.ai/Tasks'))

WebUI.click(findTestObject('clerk/Page_formsflow.ai/click_Clerk Tasks'))

WebUI.click(findTestObject('clerk/Page_formsflow.ai/click first_task'))

WebUI.click(findTestObject('Object Repository/clerk/Page_formsflow.ai/span_Claim'))

WebUI.click(findTestObject('Object Repository/clerk/Page_formsflow.ai/div_Select Clerk Action_form-control ui flu_224690'))

WebUI.setText(findTestObject('clerk/Page_formsflow.ai/input_Select Clerk Action_choices'), 
    'Reviewed')

WebUI.sendKeys(findTestObject('clerk/Page_formsflow.ai/input_Select Clerk Action_choices'), 
    Keys.chord(Keys.ENTER))

WebUI.selectOptionByValue(findTestObject('Object Repository/clerk/Page_formsflow.ai/select_spanReviewedspan'), 'Reviewed', 
    true)

WebUI.setText(findTestObject('Object Repository/clerk/Page_formsflow.ai/textarea_Clerk Comments_dataclerkComments'), '3ewewrew')

WebUI.click(findTestObject('Object Repository/clerk/Page_formsflow.ai/div_ReviewedRemove item'))

WebUI.setText(findTestObject('clerk/Page_formsflow.ai/input_Select Clerk Action_choices'), 
    'Returned')

WebUI.sendKeys(findTestObject('clerk/Page_formsflow.ai/input_Select Clerk Action_choices'), 
    Keys.chord(Keys.ENTER))

WebUI.selectOptionByValue(findTestObject('Object Repository/clerk/Page_formsflow.ai/select_spanReturnedspan'), 'Returned', 
    true)

