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

WebUI.click(findTestObject('Object Repository/search/Page_formsflow.ai/a_Applications'))

WebUI.setText(findTestObject('search/Page_formsflow.ai/input_Application ID'), findTestData('Search_values').getValue(1, 
        2))

WebUI.delay(3)

WebUI.refresh()

WebUI.setText(findTestObject('search/Page_formsflow.ai/input_Filter byApplication Name'), findTestData('Search_values').getValue(
        2, 2))

WebUI.delay(3)

WebUI.refresh()

WebUI.selectOptionByValue(findTestObject('search/Page_formsflow.ai/select_Application status_filter'), 'Rejected', true)

//WebUI.selectOptionByValue(findTestObject('search/Page_formsflow.ai/select_Application status_filter'), 'Resubmit', true)

WebUI.click(findTestObject('Object Repository/search/Page_formsflow.ai/div_'))

WebUI.click(findTestObject('search/Page_formsflow.ai/choose starting range_17'))

WebUI.click(findTestObject('search/Page_formsflow.ai/End date_23'))

WebUI.click(findTestObject('search/Page_formsflow.ai/daterange-picker__clear-button'))

WebUI.click(findTestObject('search/Page_formsflow.ai/sort_Application ID_desc'))

WebUI.click(findTestObject('search/Page_formsflow.ai/sort_Application ID_asc'))

WebUI.click(findTestObject('search/Page_formsflow.ai/sort_Application Name_asc'))

WebUI.click(findTestObject('search/Page_formsflow.ai/sort_Application Name_desc'))

WebUI.click(findTestObject('search/Page_formsflow.ai/sort_Application Status_desc'))

WebUI.click(findTestObject('search/Page_formsflow.ai/th_Application Status_asc'))

WebUI.click(findTestObject('search/Page_formsflow.ai/sort_Application Status_desc'))

WebUI.click(findTestObject('search/Page_formsflow.ai/span_Last Modified_desc'))

