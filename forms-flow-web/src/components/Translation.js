// import React from 'react';
// import { useTranslation } from 'react-i18next';

// export function Translation() {
//   const { t, i18n } = useTranslation();
//   // or const [t, i18n] = useTranslation();

//   return <p>{t('my translated text')}</p>
// }
import { withTranslation } from 'react-i18next';
   const  {t,i18n} =this.props

  {t('hello2')}
export default withTranslation();