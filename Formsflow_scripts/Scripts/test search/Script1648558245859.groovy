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

WebUI.setText(findTestObject('Object Repository/test search/Page_Log in to forms-flow-mahagony/input_Username or email_username'), 
    'john-smith')

WebUI.setEncryptedText(findTestObject('Object Repository/test search/Page_Log in to forms-flow-mahagony/input_Password_password'), 
    '76bZg6XXmfs=')

WebUI.sendKeys(findTestObject('Object Repository/test search/Page_Log in to forms-flow-mahagony/input_Password_password'), 
    Keys.chord(Keys.ENTER))

WebUI.click(findTestObject('Object Repository/test search/Page_formsflow.ai/a_Applications'))

WebUI.setText(findTestObject('Object Repository/test search/Page_formsflow.ai/input_Filter byApplication ID_text-filter-c_bf4979'), 
    '')

WebUI.setText(findTestObject('Object Repository/test search/Page_formsflow.ai/input_Filter byApplication Name_text-filter_64d9c4'), 
    '')

WebUI.selectOptionByValue(findTestObject('Object Repository/test search/Page_formsflow.ai/select_AllApprovedNewRejectedResubmitResubm_a67f9f'), 
    'Rejected', true)

//WebUI.selectOptionByValue(findTestObject('Object Repository/test search/Page_formsflow.ai/select_AllApprovedNewRejectedResubmitResubm_a67f9f'),'Resubmit', true)
WebUI.selectOptionByValue(findTestObject('Object Repository/test search/Page_formsflow.ai/select_AllApprovedNewRejectedResubmitResubm_a67f9f'), 
    'All', true)

WebUI.click(findTestObject('Object Repository/test search/Page_formsflow.ai/span_'))

WebUI.doubleClick(findTestObject('Object Repository/test search/Page_formsflow.ai/span_'))

WebUI.click(findTestObject('Object Repository/test search/Page_formsflow.ai/abbr_29'))

WebUI.click(findTestObject('Object Repository/test search/Page_formsflow.ai/abbr_29'))

WebUI.click(findTestObject('Object Repository/test search/Page_formsflow.ai/svg__react-daterange-picker__clear-button___53c7b4'))

WebUI.click(findTestObject('Object Repository/test search/Page_formsflow.ai/span_Application ID_caret-4-desc'))

WebUI.click(findTestObject('Object Repository/test search/Page_formsflow.ai/span_Application ID_caret-4-asc'))

WebUI.click(findTestObject('Object Repository/test search/Page_formsflow.ai/span_Application Name_order-4'))

WebUI.click(findTestObject('Object Repository/test search/Page_formsflow.ai/span_Application Name_caret-4-desc'))

WebUI.click(findTestObject('Object Repository/test search/Page_formsflow.ai/span_Application Status_order-4'))

WebUI.click(findTestObject('Object Repository/test search/Page_formsflow.ai/span_Application Status_caret-4-desc'))

WebUI.click(findTestObject('Object Repository/test search/Page_formsflow.ai/span_Application Status_order-4'))

WebUI.click(findTestObject('Object Repository/test search/Page_formsflow.ai/span_Application Status_caret-4-desc'))

