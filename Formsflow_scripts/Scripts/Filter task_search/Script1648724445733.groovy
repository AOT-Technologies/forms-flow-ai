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

WebUI.setText(findTestObject('Object Repository/filter task1/Page_Log in to formsflow-ai-maple/input_Username or email_username'), 
    'john.honai')

WebUI.setEncryptedText(findTestObject('Object Repository/filter task1/Page_Log in to formsflow-ai-maple/input_Password_password'), 
    '76bZg6XXmfs=')

WebUI.sendKeys(findTestObject('Object Repository/filter task1/Page_Log in to formsflow-ai-maple/input_Password_password'), 
    Keys.chord(Keys.ENTER))

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/input_Created_filter'))

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/div_Process Variables'))

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/div_'))

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/span_'))

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/span_name  (Name)'))

WebUI.selectOptionByValue(findTestObject('Object Repository/filter task1/Page_formsflow.ai/select_like'), 'like', true)

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/span__1'))

WebUI.setText(findTestObject('Object Repository/filter task1/Page_formsflow.ai/input_name_filters'), 'john')

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/i_name_fa fa-check'))

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/i_of the criteria are met_fa fa-times'))

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/input_Created_filter'))

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/div_Assignee'))

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/span__1'))

WebUI.setText(findTestObject('Object Repository/filter task1/Page_formsflow.ai/input_name_filters'), 'nancy-smith')

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/i_name_fa fa-check'))

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/div_of the criteria are met_close-container_3e5fef'))

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/input_Created_filter'))

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/div_Candidate Group'))

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/span__1'))

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/input_name_filters'))

WebUI.setText(findTestObject('Object Repository/filter task1/Page_formsflow.ai/input_name_filters'), 'formsflow/formsflow-reviewer')

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/i_name_fa fa-check'))

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/i_of the criteria are met_fa fa-times'))

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/input_Created_filter'))

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/div_Name'))

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/span__1'))

WebUI.setText(findTestObject('Object Repository/filter task1/Page_formsflow.ai/input_name_filters'), 'Review submission')

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/i_name_fa fa-check'))

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/i_of the criteria are met_fa fa-times'))

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/input_Created_filter'))

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/div_Due Date'))

WebUI.selectOptionByValue(findTestObject('Object Repository/filter task1/Page_formsflow.ai/select_beforeafter'), 'after', 
    true)

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/span_beforeafter'))

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/span__1'))

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/i__fa fa-calendar'))

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/div_23'))

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/i_of the criteria are met_fa fa-times'))

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/input_Created_filter'))

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/div_Follow up Date'))

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/span__1'))

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/i__fa fa-calendar'))

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/div_30'))

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/ul_ALL of the criteria are met.Follow up Da_a74098'))

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/i_of the criteria are met_fa fa-times'))

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/input_Created_filter'))

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/div_Created'))

WebUI.selectOptionByValue(findTestObject('Object Repository/filter task1/Page_formsflow.ai/select_beforeafter'), 'after', 
    true)

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/span__1'))

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/i__fa fa-calendar'))

WebUI.click(findTestObject('Object Repository/filter task1/Page_formsflow.ai/div_30'))

