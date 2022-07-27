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

WebUI.click(findTestObject('TC3/Page_formsflow.ai/a_Forms'))

WebUI.click(findTestObject('Object Repository/Page_formsflow.ai/a_Create Form'))

WebUI.setText(findTestObject('Object Repository/TC2/Page_formsflow.ai/input_Title_title'), findTestData('login').getValue(
        3, 2))

WebUI.setText(findTestObject('TC3/Page_formsflow.ai/input_Name_name'), findTestData('login').getValue(3, 3))

//WebUI.click(findTestObject('Object Repository/Page_formsflow.ai/button_Submit'))
//Thread.sleep(10000)
//WebUI.scrollToElement(findTestObject('Object Repository/Page_formsflow.ai/button_Layout'), 3)
//WebUI.click(findTestObject('Object Repository/Page_formsflow.ai/button_Layout'))
//WebUI.click(findTestObject('drag and drop/Page_formsflow.ai/source'))
//WebUI.dragAndDropToObject(findTestObject('drag and drop/Page_formsflow.ai/source'), findTestObject('TC3/Page_formsflow.ai/div_Drag and Drop a form component'))
//WebUI.setText(findTestObject('Object Repository/Login/Page_formsflow.ai/input_Number of Rows_datanumRows'), '1')
//WebUI.setText(findTestObject('Object Repository/Login/Page_formsflow.ai/input_Number of Columns_datanumCols'), '2')
//WebUI.click(findTestObject('Object Repository/Login/Page_formsflow.ai/button_Save'))
WebUI.click(findTestObject('TC3/Page_formsflow.ai/button_Basic'))

WebUI.scrollToElement(findTestObject('drag and drop/Page_formsflow.ai/Page_formsflow.ai/source text field'), 3)

WebUI.click(findTestObject('drag and drop/Page_formsflow.ai/Page_formsflow.ai/source text field'))

WebUI.dragAndDropToObject(findTestObject('drag and drop/Page_formsflow.ai/Page_formsflow.ai/source text field'), findTestObject(
        'TC3/Page_formsflow.ai/div_Drag and Drop a form component'))

WebUI.waitForElementPresent(findTestObject('TC3/Page_formsflow.ai/input_Label_datalabel'), 3)

WebUI.setText(findTestObject('TC3/Page_formsflow.ai/input_Label_datalabel'), findTestData('login').getValue(4, 2))

WebUI.click(findTestObject('TC3/Page_formsflow.ai/button_Save'))

WebUI.scrollToElement(findTestObject('TC3/Page_formsflow.ai/source text field'), 3)

WebUI.click(findTestObject('TC3/Page_formsflow.ai/source text field'))

WebUI.dragAndDropToObject(findTestObject('TC3/Page_formsflow.ai/source text field'), findTestObject('Businesslicensecreateform/Page_formsflow.ai/div_Submit'))

WebUI.waitForElementPresent(findTestObject('TC3/Page_formsflow.ai/input_Label_datalabel'), 3)

WebUI.setText(findTestObject('TC3/Page_formsflow.ai/input_Label_datalabel'), findTestData('login').getValue(4, 3))

WebUI.click(findTestObject('TC3/Page_formsflow.ai/button_Save'))

WebUI.scrollToElement(findTestObject('Businesslicensecreateform/Page_formsflow.ai/div_Submit'), 3)

WebUI.click(findTestObject('TC3/Page_formsflow.ai/source select'))

WebUI.dragAndDropToObject(findTestObject('TC3/Page_formsflow.ai/source select'), findTestObject('Businesslicensecreateform/Page_formsflow.ai/div_Submit'))

WebUI.setText(findTestObject('TC3/Page_formsflow.ai/input_Label_datalabel'), findTestData('login').getValue(5, 2))

WebUI.click(findTestObject('Object Repository/TC3/Page_formsflow.ai/a_Data'))

WebUI.scrollToElement(findTestObject('Businesslicensecreateform/Page_formsflow.ai/div_Submit'), 3)

WebUI.setText(findTestObject('Object Repository/TC3/Page_formsflow.ai/input_Value_datadata.values0label'), findTestData(
        'New Test Data').getValue(5, 3))

WebUI.click(findTestObject('Object Repository/TC3/Page_formsflow.ai/button_Add Another'))

WebUI.setText(findTestObject('Object Repository/TC3/Page_formsflow.ai/input_Value_datadata.values1label'), findTestData(
        'New Test Data').getValue(5, 4))

WebUI.click(findTestObject('Object Repository/TC3/Page_formsflow.ai/button_Add Another'))

WebUI.setText(findTestObject('Object Repository/TC3/Page_formsflow.ai/input_Value_datadata.values2label'), findTestData(
        'New Test Data').getValue(5, 5))

WebUI.click(findTestObject('Object Repository/TC3/Page_formsflow.ai/button_Add Another'))

WebUI.setText(findTestObject('TC3/Page_formsflow.ai/input_Value_datadata.values3label'), findTestData('login').getValue(
        5, 6))

WebUI.click(findTestObject('Object Repository/TC3/Page_formsflow.ai/button_Save'))

WebUI.click(findTestObject('Object Repository/TC3/Page_formsflow.ai/button_Advanced'))

WebUI.waitForElementPresent(findTestObject('TC3/Page_formsflow.ai/source Survey'), 3)

WebUI.click(findTestObject('TC3/Page_formsflow.ai/source Survey'))

WebUI.dragAndDropToObject(findTestObject('TC3/Page_formsflow.ai/source Survey'), findTestObject('Businesslicensecreateform/Page_formsflow.ai/div_Submit'))

WebUI.setText(findTestObject('TC3/Page_formsflow.ai/input_Label_datalabel'), findTestData('login').getValue(6, 2))

WebUI.click(findTestObject('TC3/Page_formsflow.ai/a_Data'))

WebUI.setText(findTestObject('TC3/Page_formsflow.ai/input_Value_dataquestions0label'), findTestData('login').getValue(6, 
        2))

WebUI.click(findTestObject('TC3/Page_formsflow.ai/button_Add Another'))

WebUI.setText(findTestObject('TC3/Page_formsflow.ai/input_Value_dataquestions1label'), findTestData('login').getValue(6, 
        3))

WebUI.click(findTestObject('Object Repository/TC3/Page_formsflow.ai/button_Add Another'))

WebUI.setText(findTestObject('Object Repository/TC3/Page_formsflow.ai/input_Value_dataquestions2label'), findTestData('login').getValue(
        6, 4))

WebUI.click(findTestObject('Object Repository/TC3/Page_formsflow.ai/button_Add Another'))

WebUI.setText(findTestObject('Object Repository/TC3/Page_formsflow.ai/input_Value_dataquestions3label'), findTestData('login').getValue(
        6, 5))

WebUI.click(findTestObject('TC3/Page_formsflow.ai/input_Value_datavalues0label'))

WebUI.setText(findTestObject('Object Repository/TC3/Page_formsflow.ai/input_Value_datavalues0label'), findTestData('login').getValue(
        6, 6))

WebUI.click(findTestObject('Object Repository/TC3/Page_formsflow.ai/button_Add Another'))

WebUI.setText(findTestObject('Object Repository/TC3/Page_formsflow.ai/input_Value_datavalues1label'), findTestData('login').getValue(
        6, 7))

WebUI.click(findTestObject('Object Repository/TC3/Page_formsflow.ai/button_Add Another'))

WebUI.setText(findTestObject('Object Repository/TC3/Page_formsflow.ai/input_Value_datavalues2label'), findTestData('login').getValue(
        6, 8))

WebUI.click(findTestObject('Object Repository/TC3/Page_formsflow.ai/button_Add Another'))

WebUI.setText(findTestObject('Object Repository/TC3/Page_formsflow.ai/input_Value_datavalues3label'), findTestData('login').getValue(
        6, 9))

WebUI.click(findTestObject('Object Repository/TC3/Page_formsflow.ai/button_Save'))

WebUI.click(findTestObject('TC3/Page_formsflow.ai/source Email'))

WebUI.dragAndDropToObject(findTestObject('TC3/Page_formsflow.ai/source Email'), findTestObject('Businesslicensecreateform/Page_formsflow.ai/div_Submit'))

WebUI.setText(findTestObject('TC3/Page_formsflow.ai/input_Label_datalabel'), findTestData('login').getValue(4, 4))

WebUI.click(findTestObject('Object Repository/TC3/Page_formsflow.ai/button_Save'))

WebUI.click(findTestObject('TC3/Page_formsflow.ai/source Number'))

WebUI.dragAndDropToObject(findTestObject('TC3/Page_formsflow.ai/source Number'), findTestObject('Businesslicensecreateform/Page_formsflow.ai/div_Submit'))

WebUI.setText(findTestObject('TC3/Page_formsflow.ai/input_Label_datalabel'), findTestData('login').getValue(4, 5))

WebUI.click(findTestObject('Object Repository/TC3/Page_formsflow.ai/button_Save'))

WebUI.click(findTestObject('TC3/Page_formsflow.ai/button_Basic'))

WebUI.dragAndDropToObject(findTestObject('TC3/Page_formsflow.ai/source Text Area With Analytics'), findTestObject('Businesslicensecreateform/Page_formsflow.ai/div_Submit'))

WebUI.setText(findTestObject('TC3/Page_formsflow.ai/input_Label_datalabel'), 'Any suggestion/feedback')

WebUI.click(findTestObject('Object Repository/TC3/Page_formsflow.ai/button_Save'))

WebUI.click(findTestObject('Object Repository/TC3/Page_formsflow.ai/span_Save  Preview'))

