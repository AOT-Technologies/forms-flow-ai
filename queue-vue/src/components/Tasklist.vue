<template v-slot:button-content>

  <b-container>
    <b-row class="text-left" align-v="start">
      <b-col cols="4">
          <b-list-group  v-if="tasks && tasks.length" class="service-task-list">   
            <div class="filter-container">
                  <input type="text" class="filter" placeholder="Filter Tasks"/>
                  {{tasks.length}}
            </div>
            <b-list-group-item v-for="(task, idx) in tasks" v-bind:key="task"
                v-on:click="toggle(idx)"
                :class="{'selected': idx == activeIndex}">
                  <router-link :to="`/tasklist/${task.id}`">  
                  <b-row>
                    <div class="col-12">
                      <h5>
                        {{ task.name }}
                      </h5>
                      <br>
                    </div>
                  </b-row>

                  <b-row class="task-row-2">
                    <div class="col-6 pr-0">
                    {{ getProcessDataFromList(processDefinitionList, task.processDefinitionId, 'name') }}         
                    </div>
                    <div title="Task assignee" class="col-6 pr-0 text-right">
                      {{task.assignee}}
                    </div>
                  </b-row>

                  <b-row class="task-row-3">
                    <b-col lg=8 xs=8 class="pr-0" title="task.created">
                      Created on: {{ timeDifference(task.created) }}
                    </b-col>
                    <b-col lg=4 xs=4 sm=4 class="pr-0 text-right" title="priority">
                      {{ task.priority }}
                    </b-col>
                  </b-row>
                  </router-link>
            </b-list-group-item>
        </b-list-group>

      </b-col>

      <b-col cols="8" v-if="this.$route.params.taskId">
        <b-row class="ml-0 task-header"> {{taskName}}</b-row>
        <b-row class="ml-0 task-name">{{taskProcess}}</b-row>

        <TaskDetail></TaskDetail>
        
      </b-col>

      <b-col cols="8" v-else>
        <b-row class="not-selected mt-2 ml-1 row">
          <b-icon icon="exclamation-circle-fill" variant="secondary" scale="1"></b-icon>
       <p>Select a task in the list.</p>
        </b-row>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
  import CamundaRest from '../services/camunda-rest.js';
  import TaskDetail from './TaskDetails.vue'


  export default {
    data() {
      return {
        tasks: [],
        taskName: '',
        taskProcess: '',
        formId: '',
        submissionId: '',
        Url: '',
        processDefinitionList: [],
        activeIndex: null
      };
    },
    components: {
      TaskDetail,
    },
    watch: {
      '$route': 'fetchData',
    },
    methods: {
      toggle: function(index){
        this.activeIndex = index
      },
      fetchData() {
        CamundaRest.getTasks().then((result) => {
          this.tasks = result.data;
        });
        if (this.$route.params.taskId) {         
          CamundaRest.getTask(this.$route.params.taskId).then((result) => {
            this.taskName = result.data.name;
            }).catch(() => {});
          
          CamundaRest.getTask(this.$route.params.taskId)
          .then((result) => {CamundaRest.getProcessDefinitionById(result.data.processDefinitionId)
          .then((res) => {
            this.taskProcess = res.data.name;
          });
          })

          CamundaRest.getVariablesByTaskId(this.$route.params.taskId)
          .then((result)=> {
              this.Url = result.data["formUrl"].value;
              this.formId, this.submissionId = getFormIdSubmissionIdFromFormURL(this.url);
          }).catch(() => {});

          CamundaRest.getTask(this.$route.params.taskId)
          .then((result) => {CamundaRest.getProcessDefinitionById(result.data.processDefinitionId)
            .then((res) => {
              CamundaRest.getProcessXML(res.data.key).then((r) => {
                console.log(r.data.bpmn20Xml)
              })
            })
          })

        }

        const getFormIdSubmissionIdFromFormURL = (formUrl) => {
          const formArr = formUrl.split("/");
          const formId = formArr[4];
          const submissionId = formArr[6];
          return {formId,submissionId};
        }
      },
      timeDifference(givendate) {      
        var diff = Math.abs(new Date() - new Date(givendate));
        var msec = diff;
        var days = Math.floor(msec / 1000 / 60 / (60 * 24))
        var date_diff = new Date(msec);

        var hours = date_diff.getHours();
        var minutes = date_diff.getMinutes();
        var seconds = date_diff.getSeconds();

        if(days===0&&hours===0&&minutes===0){
          return seconds+ " seconds ago"
        }
        else if (days===0&&hours===0) {
          return minutes+ " minutes ago"
        }
        
        else if(days ===0){
          return hours+ " hours ago"
        }
        else {
          return days+ " days ago"
        }
      },
      getProcessDataFromList(processList,processId,dataKey){
        const process = processList.find(process=>process.id===processId);
        return process && process[dataKey] ;
      },
      getUserNamefromList(userList,userId){
        const user = userList.find(user=>user.id===userId);
        return user.firstName + " " + user.lastName;
      }
    },
    mounted() {
      CamundaRest.getTasks().then((result) => {
        this.tasks = result.data;
        console.log(result.data);
      });
      this.fetchData();

      CamundaRest.getProcessDefinition().then((response) => {
        this.processDefinitionList = response.data;
        });
  }
  };

</script>

<style>
  #ul_top_hypers li {
    display: inline;
}

.not-selected{
  border: 3px solid #b3b3b3;
  padding: 10px;
  color: #b3b3b3;
  width: 100%;
}

.filter-container{
  border: 1px solid #555;
  border-radius: 5px;
  width: 100%;
  padding: 0;
  margin: 0 5px 10px 5px;
  font-size: 13px;
}

.filter{
  width: 85%;
  margin: 5px;
  border: none;
  font-style: italic;
}
.filter:focus{
  outline: none;
}

.task-row-2 {
  font-size: 15px;
}
.task-row-3 {
  font-size: 11px;
}

.service-task-list {
  max-height: 80vh;
  overflow-y: auto;
  padding-right: 25px;
} 

.task-header {
  font-size: 30px;
  font-weight: 600;
}
.task-name {
  font-size: 20px;
  font-weight: 400;
}

.selected {
  border-left: 2px solid #003366 !important;
}
</style>