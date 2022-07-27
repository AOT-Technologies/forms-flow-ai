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

WebUI.maximizeWindow()

for (int i = 0; i < 3; i++) {
    WebUI.setText(findTestObject('Object Repository/Page_Log in to forms-flow-ai-app3/input_Username or email_username'), 
        findTestData('login').getValue(1, 1))

    WebUI.setEncryptedText(findTestObject('Object Repository/Page_Log in to forms-flow-ai-app3/input_Password_password'), 
        findTestData('login').getValue(2, 1))

    WebUI.click(findTestObject('Object Repository/Page_Log in to forms-flow-ai-app3/input_Password_login'))

    WebUI.click(findTestObject('Businesslicensecreateform/Page_formsflow.ai/span_Submit New'))

    WebUI.setText(findTestObject('Object Repository/FOI_client_submitform/Page_formsflow.ai/input_Business Operating Name_databusinessO_c3a9d7'), 
        findTestData('Data_FOI_businessLIcense').getValue(10, 1))

    WebUI.scrollToElement(findTestObject('FOI_client_submitform/Page_formsflow.ai/Business_Start_Date'), 3)

    WebUI.click(findTestObject('FOI_client_submitform/Page_formsflow.ai/span_Proposed Business Start Date'))

    WebUI.click(findTestObject('Businesslicensecreateform/Page_formsflow.ai/span_date'))

    WebUI.setText(findTestObject('Object Repository/FOI_client_submitform/Page_formsflow.ai/input_Business E-Mail_dataeMail'), 
        findTestData('Data_FOI_businessLIcense').getValue(12, 1))

    WebUI.setText(findTestObject('Object Repository/FOI_client_submitform/Page_formsflow.ai/input_Nature of Business_datanatureOfBusiness'), 
        findTestData('Data_FOI_businessLIcense').getValue(11, 1))

    WebUI.setText(findTestObject('Object Repository/FOI_client_submitform/Page_formsflow.ai/input_Number of Employees_datanumberOfEmployees'), 
        findTestData('Data_FOI_businessLIcense').getValue(13, 1))

    WebUI.setText(findTestObject('Object Repository/FOI_client_submitform/Page_formsflow.ai/input_Business Phone_databusinessPhone'), 
        findTestData('Data_FOI_businessLIcense').getValue(14, 1))

    WebUI.scrollToElement(findTestObject('FOI_client_submitform/Page_formsflow.ai/soleproprietor'), 3)

    WebUI.click(findTestObject('FOI_client_submitform/Page_formsflow.ai/soleproprietor'))

    WebUI.setText(findTestObject('Object Repository/FOI_client_submitform/Page_formsflow.ai/input_Corporation_datasoleProprietorsNameIf_7df650'), 
        findTestData('Data_FOI_businessLIcense').getValue(15, 1))

    WebUI.click(findTestObject('FOI_client_submitform/Page_formsflow.ai/homebasedbusiness'))

    WebUI.click(findTestObject('FOI_client_submitform/Page_formsflow.ai/intermuncipal_license'))

    WebUI.click(findTestObject('FOI_client_submitform/Page_formsflow.ai/BuildingPermitRequired'))

    WebUI.scrollToElement(findTestObject('FOI_client_submitform/Page_formsflow.ai/button_Submit_business'), 3)

    WebUI.click(findTestObject('FOI_client_submitform/Page_formsflow.ai/button_Submit_business'))

    WebUI.delay(15)

    WebUI.scrollToElement(findTestObject('Businesslicensecreateform/Page_formsflow.ai/div_logout'), 3)

    WebUI.click(findTestObject('Businesslicensecreateform/Page_formsflow.ai/div_logout'))

    WebUI.click(findTestObject('Object Repository/Businesslicensecreateform/Page_formsflow.ai/a_Logout'))

    WebUI.setText(findTestObject('Object Repository/Page_Log in to forms-flow-ai-app3/input_Username or email_username'), 
        findTestData('login').getValue(1, 3))

    WebUI.setEncryptedText(findTestObject('Object Repository/Page_Log in to forms-flow-ai-app3/input_Password_password'), 
        findTestData('login').getValue(2, 3))

    WebUI.click(findTestObject('Object Repository/Page_Log in to forms-flow-ai-app3/input_Password_login'))

    WebUI.delay(10)

    if (WebUI.verifyElementText(findTestObject('Object Repository/Reviewer_task/Page_formsflow.ai/div_One Step Approval'), 
        'Two Step Approval', FailureHandling.OPTIONAL) == true) {
        WebUI.click(findTestObject('Object Repository/businessform_clerk-reviewer/Page_formsflow.ai/div_Two Step Approval_if'))
    }
    
    if (WebUI.verifyElementText(findTestObject('Object Repository/Reviewer_task/Page_formsflow.ai/div_One Step Approval'), 
        'One Step Approval', FailureHandling.OPTIONAL) == true) {
        WebUI.click(findTestObject('Object Repository/businessform_clerk-reviewerk/Page_formsflow.ai/div_select_Two Step Approval_else'))
    }
    
    WebUI.click(findTestObject('Object Repository/businessform_clerk-reviewer/Page_formsflow.ai/span_Claim'))

    WebUI.scrollToElement(findTestObject('businessform_clerk-reviewer/Page_formsflow.ai/div_Select Clerk Action_dropdown'), 
        3)

    WebUI.click(findTestObject('businessform_clerk-reviewer/Page_formsflow.ai/div_Select Clerk Action_dropdown'))

    WebUI.click(findTestObject('businessform_clerk-reviewer/Page_formsflow.ai/div_Reviewed'))

    WebUI.setText(findTestObject('businessform_clerk-reviewer/Page_formsflow.ai/textarea_reviewed_comments'), 'reviewed')

    WebUI.scrollToElement(findTestObject('businessform_clerk-reviewer/Page_formsflow.ai/button_Submit'), 0)

    WebUI.click(findTestObject('Object Repository/businessform_clerk-reviewer/Page_formsflow.ai/button_Submit'))

    WebUI.delay(5)

    WebUI.click(findTestObject('Businesslicensecreateform/Page_formsflow.ai/div_logout'))

    WebUI.click(findTestObject('Businesslicensecreateform/Page_formsflow.ai/a_Logout'))

    WebUI.setText(findTestObject('Object Repository/Page_Log in to forms-flow-ai-app3/input_Username or email_username'), 
        findTestData('login').getValue(1, 4))

    WebUI.setEncryptedText(findTestObject('Object Repository/Page_Log in to forms-flow-ai-app3/input_Password_password'), 
        findTestData('login').getValue(2, 4))

    WebUI.click(findTestObject('Object Repository/Page_Log in to forms-flow-ai-app3/input_Password_login'))

    WebUI.delay(10)

    if (WebUI.verifyElementText(findTestObject('Object Repository/Reviewer_task/Page_formsflow.ai/div_One Step Approval'), 
        'Two Step Approval', FailureHandling.OPTIONAL) == true) {
        WebUI.click(findTestObject('Object Repository/businessform_clerk-reviewer/Page_formsflow.ai/div_Two Step Approval_if'))
    }
    
    if (WebUI.verifyElementText(findTestObject('Object Repository/Reviewer_task/Page_formsflow.ai/div_One Step Approval'), 
        'One Step Approval', FailureHandling.OPTIONAL) == true) {
        WebUI.click(findTestObject('Object Repository/businessform_clerk-reviewerk/Page_formsflow.ai/div_select_Two Step Approval_else'))
    }
    
    WebUI.click(findTestObject('Object Repository/businessform_clerk-reviewer/Page_formsflow.ai/span_Claim'))

    WebUI.scrollToElement(findTestObject('businessform_clerk-reviewer/Page_formsflow.ai/div_Select Clerk Action_dropdown'), 
        3)

    WebUI.click(findTestObject('businessform_clerk-reviewer/Page_formsflow.ai/div_Select Clerk Action_dropdown'))

    WebUI.click(findTestObject('businessform_clerk-reviewer/Page_formsflow.ai/div_Approved_businesslicense'))

    WebUI.setText(findTestObject('businessform_clerk-reviewer/Page_formsflow.ai/textarea_Approver Comments_dataapproverComments'), 
        'reviewed')

    WebUI.scrollToElement(findTestObject('businessform_clerk-reviewer/Page_formsflow.ai/button_Submit_approver'), 3)

    WebUI.click(findTestObject('businessform_clerk-reviewer/Page_formsflow.ai/button_Submit_approver'))

    WebUI.delay(5)

    WebUI.scrollToElement(findTestObject('Businesslicensecreateform/Page_formsflow.ai/div_logout'), 3)

    WebUI.click(findTestObject('Businesslicensecreateform/Page_formsflow.ai/div_logout'))

    WebUI.click(findTestObject('Object Repository/Businesslicensecreateform/Page_formsflow.ai/a_Logout'))
}

