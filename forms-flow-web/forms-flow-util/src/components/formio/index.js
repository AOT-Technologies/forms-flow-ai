import TextFieldComponent from './textfield';
import TextAreaComponent from './textarea';
import EmailComponent from './email';
import PasswordComponent from './password';
import PhoneNumberComponent from './phonenumber';

import NumberComponent from './number';
import CurrencyComponent from './currency';

import DateTimeComponent from './datetime';
import DayComponent from './day';
import TimeComponent from './time';
import AddressComponent from './address';

import CheckBoxComponent from './checkbox';
import RadioComponent from './radio';
import SelectBoxesComponent from './selectboxes';
import SelectComponent from './select';
import ResourceComponent from './resource';

import SurveyComponent from './survey';
import FileComponent from './file';
import SignatureComponent from './signature';

import ContainerComponent from './container';
import DataGridComponent from './datagrid';
import EditGridComponent from './editgrid';

import FormComponent from './form';
import HtmlComponent from './html';
import ContentComponent from './content';

import ColumnsComponent from './columns';
import PanelComponent from './panel';
import FieldSetComponent from './fieldset';
import WellComponent from './well';

import UnknownComponent from './unknown';

const FormioComponent = {
  textfield: TextFieldComponent,
  textarea: TextAreaComponent,
  email: EmailComponent,
  password: PasswordComponent,
  phoneNumber: PhoneNumberComponent,
  number: NumberComponent,
  currency: CurrencyComponent,
  datetime: DateTimeComponent,
  day: DayComponent,
  time: TimeComponent,
  address: AddressComponent,
  checkbox: CheckBoxComponent,
  radio: RadioComponent,
  selectboxes: SelectBoxesComponent,
  select: SelectComponent,
  resource: ResourceComponent,
  survey: SurveyComponent,
  file: FileComponent,
  signature: SignatureComponent,
  container: ContainerComponent,
  datagrid: DataGridComponent,
  editgrid: EditGridComponent,
  columns: ColumnsComponent,
  panel: PanelComponent,
  fieldset: FieldSetComponent,
  unknown: UnknownComponent,
  well: WellComponent,
  form: FormComponent,
  content: ContentComponent,
  html: HtmlComponent,

  create: (component, data, options) => {
    let c = null;

    if (!component) {
      return null;
    } else if (FormioComponent.hasOwnProperty(component.type)) {
      c = new FormioComponent[component.type](component, data, options);
    } else {
      c = new UnknownComponent(component, data, options);
    }

    if (data != null && component.type !== 'form' &&
        component.conditional !== undefined && component.conditional.when !== null) {
      let componentToCheck = component.conditional.when;
      let componentValue = data[componentToCheck];
      let componentShouldBe = component.conditional.eq;

      switch (c.type) {
        case 'columns':
          for (let i in c.columns) {
            for (let j in c.columns[i].components) {
              let hidden = !(component.conditional.show === 'true' && componentValue === componentShouldBe);

              c.columns[i].components[j].hidden = hidden;
            }
          }
          break;
        case 'well':
          for (let i in c.components) {
            let hidden = !(component.conditional.show === 'true' && componentValue === componentShouldBe);

            c.components[i].hidden = hidden;
          }
          break;
        case 'container':
          for (let i in c.components) {

            let hidden = !(component.conditional.show === 'true' && componentValue === componentShouldBe);

            c.components[i].hidden = hidden;
          }
          break;
        default:
          c.hidden = !(component.conditional.show === 'true' && componentValue === componentShouldBe);
          break;
      }
    }

    return c;
  }
};

export default FormioComponent;
