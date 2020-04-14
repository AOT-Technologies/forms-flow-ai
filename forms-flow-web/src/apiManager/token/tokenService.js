const getBpmToken = () => localStorage.getItem('bpmToken');

const setBpmToken = (token) => localStorage.setItem('bpmToken', token);

export default {
  getBpmToken,
  setBpmToken
}
