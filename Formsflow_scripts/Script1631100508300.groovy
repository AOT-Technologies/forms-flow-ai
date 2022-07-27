

WebUI.navigateToUrl('')

WebUI.navigateToUrl(GlobalVariable.url)

WebUI.maximizeWindow()

WebUI.setText(findTestObject('Object Repository/Page_Log in to forms-flow-ai-app3/input_Username or email_username'), findTestData(
        'login').getValue(1, 4))

WebUI.setEncryptedText(findTestObject('Object Repository/Page_Log in to forms-flow-ai-app3/input_Password_password'), findTestData(
        'login').getValue(2, 1))

WebUI.click(findTestObject('Object Repository/Page_Log in to forms-flow-ai-app3/input_Password_login'))

WebUI.delay(5)

WebUI.click(findTestObject('Businesslicensecreateform/Page_formsflow.ai/a_Forms'))

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

WebUI.setText(findTestObject('FOI_client_submitform/Page_formsflow.ai/Details Of Requested Information'), findTestData('Data_FOI_businessLIcense').getValue(
        9, 1))

WebUI.scrollToElement(findTestObject('FOI_client_submitform/Page_formsflow.ai/preferred_method to access records'), 3)

WebUI.click(findTestObject('FOI_client_submitform/Page_formsflow.ai/preferred_method to access records'))

WebUI.scrollToElement(findTestObject('FOI_client_submitform/Page_formsflow.ai/button_submit_FOI'), 3)

WebUI.click(findTestObject('FOI_client_submitform/Page_formsflow.ai/button_Submit form'))

