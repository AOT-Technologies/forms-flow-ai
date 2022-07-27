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

for (int i = 0; i < 5; i++) {
    WebUI.setText(findTestObject('Object Repository/Page_Log in to forms-flow-ai-app3/input_Username or email_username'), 
        findTestData('login').getValue(1, 1))

    WebUI.setEncryptedText(findTestObject('Object Repository/Page_Log in to forms-flow-ai-app3/input_Password_password'), 
        findTestData('login').getValue(2, 1))

    WebUI.click(findTestObject('Object Repository/Page_Log in to forms-flow-ai-app3/input_Password_login'))

    WebUI.delay(5)

    //for (int i = 0; i < 5; i++) {
    WebUI.click(findTestObject('FOI_client_submitform/Page_formsflow.ai/span_foi'))

    WebUI.click(findTestObject('FOI_client_submitform/Page_formsflow.ai/div_Name of Public Body'))

    WebUI.click(findTestObject('FOI_client_submitform/Page_formsflow.ai/publicbody_dropdown'))

    WebUI.setText(findTestObject('Object Repository/FOI_client_submitform/Page_formsflow.ai/input_First Name_datafirstName'), 
        findTestData('Data_FOI_businessLIcense').getValue(1, 1))

    WebUI.setText(findTestObject('Object Repository/FOI_client_submitform/Page_formsflow.ai/input_Last Name_datalastName'), 
        findTestData('Data_FOI_businessLIcense').getValue(2, 1))

    WebUI.setText(findTestObject('FOI_client_submitform/Page_formsflow.ai/input_Street, Apartment No'), findTestData('Data_FOI_businessLIcense').getValue(
            3, 1))

    WebUI.setText(findTestObject('FOI_client_submitform/Page_formsflow.ai/input_City Town'), findTestData('Data_FOI_businessLIcense').getValue(
            4, 1))

    WebUI.setText(findTestObject('FOI_client_submitform/Page_formsflow.ai/input_Province Country'), findTestData('Data_FOI_businessLIcense').getValue(
            5, 1))

    WebUI.setText(findTestObject('FOI_client_submitform/Page_formsflow.ai/input_Postal Code'), findTestData('Data_FOI_businessLIcense').getValue(
            6, 1))

    WebUI.setText(findTestObject('Object Repository/FOI_client_submitform/Page_formsflow.ai/input_Day Phone No_datadayPhoneNo'), 
        findTestData('Data_FOI_businessLIcense').getValue(7, 1))

    WebUI.setText(findTestObject('Object Repository/FOI_client_submitform/Page_formsflow.ai/input_E-mail Address_dataeMailAddress'), 
        findTestData('Data_FOI_businessLIcense').getValue(8, 1))

    WebUI.setText(findTestObject('FOI_client_submitform/Page_formsflow.ai/Details Of Requested Information'), findTestData(
            'Data_FOI_businessLIcense').getValue(9, 1))

    WebUI.scrollToElement(findTestObject('FOI_client_submitform/Page_formsflow.ai/preferred_method to access records'), 
        3)

    WebUI.click(findTestObject('FOI_client_submitform/Page_formsflow.ai/preferred_method to access records'))

    WebUI.scrollToElement(findTestObject('FOI_client_submitform/Page_formsflow.ai/button_submit_FOI'), 3)

    WebUI.click(findTestObject('FOI_client_submitform/Page_formsflow.ai/button_Submit form'))

    WebUI.delay(15)

    WebUI.click(findTestObject('Businesslicensecreateform/Page_formsflow.ai/div_logout'))

    WebUI.click(findTestObject('Businesslicensecreateform/Page_formsflow.ai/a_Logout'))

    WebUI.setText(findTestObject('Object Repository/Page_Log in to forms-flow-ai-app3/input_Username or email_username'), 
        findTestData('login').getValue(1, 4))

    WebUI.setEncryptedText(findTestObject('Object Repository/Page_Log in to forms-flow-ai-app3/input_Password_password'), 
        findTestData('login').getValue(2, 4))

    WebUI.click(findTestObject('Object Repository/Page_Log in to forms-flow-ai-app3/input_Password_login'))

    WebUI.delay(20)

    // identify elements with text()
    //WebUI.verifyElementText(findTestObject('Page_CuraHomepage/btn_MakeAppointment'), 'Make Appointment')
   // if (WebUI.verifyElementText(findTestObject('Object Repository/Reviewer_task/Page_formsflow.ai/h5_Review Submission'), 
   //     'Review Submission', FailureHandling.OPTIONAL)==true) {
  //      WebUI.click(findTestObject('Object Repository/Reviewer_task/Page_formsflow.ai/div_One Step Approval'))
        //WebUI.click(findTestObject('Reviewer_task/Page_formsflow.ai/div_Select a task in the list') //else  (WebUI.verifyElementText(findTestObject('Object Repository/Reviewer_task/Page_formsflow.ai/h5_Review Submission'),('Review Applications'))) {
            //WebUI.click(findTestObject('businessform_clerk-reviewer/Page_formsflow.ai/div_Select a task in the list'))
  //  }
    
    if (WebUI.verifyElementText(findTestObject('Object Repository/Reviewer_task/Page_formsflow.ai/div_One Step Approval'), 
        'Two Step Approval', FailureHandling.OPTIONAL)==true) {
        WebUI.click(findTestObject('Object Repository/Reviewer_task/Page_formsflow.ai/div_Select a task in the list'))
    }
	
	if (WebUI.verifyElementText(findTestObject('Object Repository/Reviewer_task/Page_formsflow.ai/div_One Step Approval'),
		'One Step Approval', FailureHandling.OPTIONAL)==true) {
		 WebUI.click(findTestObject('Object Repository/Reviewer_task/Page_formsflow.ai/div_One Step Approval'))
	}
    
    WebUI.click(findTestObject('Reviewer_task/Page_formsflow.ai/span_Claim'))

    WebUI.scrollToElement(findTestObject('Reviewer_task/Page_formsflow.ai/input_Request No_datarequestNo'), 3)

    WebUI.setText(findTestObject('Object Repository/Reviewer_task/Page_formsflow.ai/input_Request No_datarequestNo'), findTestData(
            'Data_FOI_businessLIcense').getValue(16, 1))

    WebUI.setText(findTestObject('Object Repository/Reviewer_task/Page_formsflow.ai/input_Request Code_datarequestCode'), 
        findTestData('Data_FOI_businessLIcense').getValue(17, 1))

    WebUI.click(findTestObject('Reviewer_task/Page_formsflow.ai/checkbox_input_Request Category_dataaccessToPersonal'))

    WebUI.click(findTestObject('Reviewer_task/Page_formsflow.ai/checkbox_input_Access to Personal Information(ARCS _1779c2'))

    // Select Approved " option'
    WebUI.click(findTestObject('Reviewer_task/Page_formsflow.ai/Select Review Actions dropdown'))

    WebUI.click(findTestObject('FOI_client_submitform/Page_formsflow.ai/span_Approved'))

    WebUI.scrollToElement(findTestObject('Reviewer_task/Page_formsflow.ai/button_Submit Action'), 3)

    WebUI.click(findTestObject('Object Repository/Reviewer_task/Page_formsflow.ai/button_Submit Action'))

    WebUI.delay(3)

    WebUI.scrollToElement(findTestObject('Businesslicensecreateform/Page_formsflow.ai/div_logout'), 3)

    WebUI.click(findTestObject('Businesslicensecreateform/Page_formsflow.ai/div_logout'))

    WebUI.click(findTestObject('Object Repository/Businesslicensecreateform/Page_formsflow.ai/a_Logout'))
}

