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

WebUI.navigateToUrl(GlobalVariable.url)

WebUI.setText(findTestObject('RPA/Page_Log in to formsflow-ai-willow/input_Username or email_username'), findTestData('login').getValue(
        1, 1))

WebUI.setEncryptedText(findTestObject('Object Repository/RPA/Page_Log in to formsflow-ai-willow/input_Password_password'), 
    findTestData('login').getValue(2, 1))

WebUI.sendKeys(findTestObject('Object Repository/RPA/Page_Log in to formsflow-ai-willow/input_Password_password'), Keys.chord(
        Keys.ENTER))

WebUI.maximizeWindow()

WebUI.selectOptionByValue(findTestObject('RPA/Page_formsflow.ai/select_All'), '999999', true)

for(int i=0;i<3;i++) {
WebUI.click(findTestObject('Object Repository/RPA/Page_formsflow.ai/span_Submit New'))

WebUI.setText(findTestObject('Object Repository/RPA/Page_formsflow.ai/input_Business Operating Name_databusinessO_c3a9d7'), 
    findTestData('Data_FOI_businessLIcense').getValue(1, 4))

WebUI.click(findTestObject('Object Repository/RPA/Page_formsflow.ai/span_Proposed Business Start Date_input-group-text'))

WebUI.click(findTestObject('Object Repository/RPA/Page_formsflow.ai/span_25'))

WebUI.setText(findTestObject('Object Repository/RPA/Page_formsflow.ai/input_Nature of Business_datanatureOfBusiness'), findTestData(
        'Data_FOI_businessLIcense').getValue(2, 4))

WebUI.setText(findTestObject('Object Repository/RPA/Page_formsflow.ai/input_Business Website_databusinessWebsite'), findTestData(
        'Data_FOI_businessLIcense').getValue(3, 4))

WebUI.setText(findTestObject('Object Repository/RPA/Page_formsflow.ai/input_Business E-Mail_dataeMail'), findTestData('Data_FOI_businessLIcense').getValue(
        5, 4))

WebUI.setText(findTestObject('Object Repository/RPA/Page_formsflow.ai/input_, numeric only,_datanumberOfEmployees'), findTestData(
        'Data_FOI_businessLIcense').getValue(4, 4))

WebUI.click(findTestObject('Object Repository/RPA/Page_formsflow.ai/span_Partnership'))

WebUI.doubleClick(findTestObject('Object Repository/RPA/Page_formsflow.ai/input_Corporation_datapartnershipNameSIfYou_fd82e8'))

WebUI.setText(findTestObject('Object Repository/RPA/Page_formsflow.ai/input_Corporation_datapartnershipNameSIfYou_fd82e8'), 
    'john')

WebUI.click(findTestObject('RPA/Page_formsflow.ai/Is this a Home based business'))

WebUI.click(findTestObject('Object Repository/RPA/Page_formsflow.ai/label_No'))

WebUI.click(findTestObject('RPA/Page_formsflow.ai/span_permit'))

WebUI.click(findTestObject('Object Repository/RPA/Page_formsflow.ai/button_Submit'))
}
WebUI.click(findTestObject('Object Repository/RPA/Page_formsflow.ai/a_Applications'))

