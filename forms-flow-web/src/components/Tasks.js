import React from 'react'
import { connect } from 'react-redux'

import { getUserToken } from '../apiManager/services/bpmServices'
import { BPM_USER_DETAILS } from '../apiManager/constants/apiConstants'
import { fetchTaskList } from '../apiManager/services/taskServices'

const Tasks = (props) =>{
    console.log('jsd',props)
    return <h3 className="text-center">Tasks</h3>
}

const mapStateToProps=(state)=>{
    return{
        tasks:state.tasks.tasksList
    }
}
const mapDispatchToProps=(dispatch)=>{
    return{
        getTasks:dispatch(
            getUserToken(BPM_USER_DETAILS,(err,res)=>{
                if(!err){
                    dispatch(fetchTaskList(res.data.access_token))
                }
            })
        )
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(Tasks);