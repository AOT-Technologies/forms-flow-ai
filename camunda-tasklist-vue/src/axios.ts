import axios from 'axios';

export function bpmAxios (bearerToken) {
    
  return (
    axios.create({
      baseURL: 'http://192.168.0.16:8000/camunda/engine-rest/',
      withCredentials: false,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearerToken}`
      }
    })
  )
}  

