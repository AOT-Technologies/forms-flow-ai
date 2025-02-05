export const  RequestService = {
    "httpGETRequest": ()=>Promise.resolve({data: {}})
}

export const StorageService = {
    "get": ()=>Promise.resolve({data: {}}),
    "User":{
    AUTH_TOKEN : "AUTH_TOKEN",
    USER_DETAILS : "USER_DETAILS",
    USER_ROLE : "USER_ROLE"
    }
}


export const StyleServices = {
    "getCSSVariable": (e)=> {return '#000'},

}