import React from 'react'
import { connect } from 'react-redux'

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

export default connect(mapStateToProps)(Tasks);