import axios from 'axios';

export function bpmAxios (bearerToken) {
    
    return (
      axios.create({
        baseURL: 'https://bpm3.aot-technologies.com/camunda/engine-rest/',
        withCredentials: false,
        headers: {
          'Access-Control-Allow-Origin': 'https://bpm3.aot-technologies.com',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bearerToken}`
        }
      })
    )
  }  