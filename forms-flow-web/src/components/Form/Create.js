
import React from "react";
import { connect } from "react-redux";
import { saveForm, selectError, FormEdit, Errors } from "react-formio";
import { push } from "connected-react-router";
import { Translation } from "react-i18next";
import { SUBMISSION_ACCESS } from "../../constants/constants";
import { addHiddenApplicationComponent } from "../../constants/applicationComponent";

const Create = React.memo((props) => {
  return (
    <div>
      <h2><Translation>{(t)=>t("create_form")}</Translation></h2>
      <hr />
      <Errors errors={props.errors} />
      <FormEdit options={{
							language: 'ch',
							i18n: {
							  en: {
                'Text Field':'Text Field',
                'Text Area':'Text Area',
                'Number':'Number',
                'Password':'Password',
                'Checkbox':'Checkbox',
                'Select Boxes':'Select Boxes',
                'Select':'Select',
                'Radio':'Radio',
                'Button':'Button',
                'Text Area With Analytics':'Text Area With Analytics',
                'Data':'Data',
                'Display':'Display',
								'Submit': 'Submit',
                'Email':'Email',
                'Url':'Url',
                'Phone Number':'Phone Number',
                'Tags':'Tags',
                'Address':'Address',
                'Date / Time':'Date / Time',
                'Day':'Day',
                'Time':'Time',
                'Currency':'Currency',
                'Survey':'Survey',
                'Signature':'Signature',
                'HTML':'HTML',
                'Content':'Content',
                'Columns':'Columns',
                'Field Set':'Field Set',
                'Panel':'Panel',
                'Table':'Table',
                'Tabs':'Tabs',
                'Well':'Well',
                'Hidden':'Hidden',
                'Container':'Container',
                'Data Map':'Data Map',
                'Data Grid':'Data Grid',
                'Edit Grid':'Edit Grid',
                'Tree':'Tree',
                'reCAPTCHA':'reCAPTCHA',
                'Resource':'Resource',
                'File':'File',
                'Nested':'Nested',
                'Custom':'Custom'
							  },
							  ch: {
                  'Text Field':'文本域',
                  'Text Area':'文本区',
                  'Number':'数字',
                  'Password':'密码',
                  'Checkbox':'复选框',
                  'Select Boxes':'选择框',
                  'Select':'选择',
                  'Radio':'收音机',
                  'Button':'按钮',
                  'Text Area With Analytics':'带有分析的文本区域',
                  'Data':'数据',
                  'Display':'展示',
                  'Submit': '提交',
                  'Email':'电子邮件',
                  'Url':'网址',
                  'Phone Number':'电话号码',
                  'Tags':'标签',
                  'Address':'地址',
                  'Date / Time':'约会时间',
                  'Day':'日',
                  'Time':'时间',
                  'Currency':'货币',
                  'Survey':'民意调查',
                  'Signature':'签名',
                  'HTML':'HTML',
                  'Content':'内容',
                  'Columns':'列',
                  'Field Set':'字段集',
                  'Panel':'控制板',
                  'Table':'桌子',
                  'Tabs':'标签',
                  'Well':'好',
                  'Hidden':'隐',
                  'Container':'容器',
                  'Data Map':'数据地图',
                  'Data Grid':'数据网格',
                  'Edit Grid':'编辑网格',
                  'Tree':'树',
                  'reCAPTCHA':'验证码',
                  'Resource':'资源',
                  'File':'文件',
                  'Nested':'嵌套',
                  'Custom':'风俗',
                  'Basic':'基本的',
                  'Advanced':'先进的',
                  'Layout':'布局',
                  'Premium':'优质的',
                  'Drag and Drop a form component':'拖放表单组件',
                  'Preview':'预览',
                  'The minimum length requirement this field must meet.':'此字段必须满足的最小长度要求',
                  'Label':'标签',
                  'The label for this field that will appear next to it.':'此字段旁边将显示的标签。',
                  'Label Position':'标签位置',
                  'Position for the label for this field.':'此字段的标签位置。',
                  'Placeholder':'占位符',
                  'The placeholder text that will appear when this field is empty.':'此字段为空时将显示的占位符文本。',
                  'Description':'描述',
                  'The description is text that will appear below the input field.':'描述是将出现在输入字段下方的文本。',
							  }
							}}}{...props} />
    </div>
  );
});

const mapStateToProps = (state) => {
  return {
    form: { display: "form" },
    saveText: <Translation>{(t)=>t("save_preview")}</Translation>,
    errors: selectError("form", state),
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    saveForm: (form) => {
      form = addHiddenApplicationComponent(form);
      const newForm = {
        ...form,
        tags: ["common"],
      };
      newForm.submissionAccess = SUBMISSION_ACCESS;
      dispatch(
        saveForm("form", newForm, (err, form) => {
          if (!err) {
            // ownProps.setPreviewMode(true);
            dispatch(push(`/formflow/${form._id}/view-edit/`));
          }
        })
      );
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Create);
