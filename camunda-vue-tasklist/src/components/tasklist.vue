<template v-slot:button-content>

  <b-container>
    <b-row class="text-left" align-v="start">
      <b-col cols="4">
          <b-list-group  v-if="tasks && tasks.length" class="service-task-list">   
          <div class="filter-container">
                <input type="text" class="filter" placeholder="Filter Tasks"/>
                {{tasks.length}}
          </div>
            <b-list-group-item button v-for="task in tasks" :key="task" v-bind:to="`/tasklist/${task.id}`">
              <b-link v-bind:to="`/tasklist/${task.id}`">
                  <b-row>
                    <div class="col-12">
                      <h5>
                      <!-- <router-link :to="`/tasklist/${task.id}`"> -->
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
                </b-link>
            </b-list-group-item>
        </b-list-group>

      </b-col>

      <b-col cols="8" v-if="this.$route.params.taskId">
        <b-card>  
          <h1>{{taskName}}</h1>
          <h3>{{taskProcess}}</h3>

          <br>
          <div class="row">
              <div class="col-md-auto">
              <button type="button" class="btn btn-primary"><b-icon :icon="'calendar3'"></b-icon> Set Follow-up date </button>
              </div>
              <div class="col-md">
              <button type="button" class="btn btn-primary"><b-icon :icon="'bell'"></b-icon> Due Date </button>
              </div>
              <div class="col-md">
              <button type="button" class="btn btn-primary"><b-icon :icon="'grid3x3-gap-fill'"></b-icon> Add groups </button>
              </div>
              <div class="col-md">
              <button type="button" class="btn btn-primary"><b-icon :icon="'person-fill'"></b-icon> Claim </button>
              </div>
          </div>

          <br>
          <br>
          <div>
          <b-tabs content-class="mt-3">
            <b-tab title="Form" active>
              <formio src="https://forms3.aot-technologies.com/#/form/5ffa9f93e941362b0cbac81f/submission/5ffec546e941363e74bac854">
              </formio>
            </b-tab>
            <b-tab title="History"></b-tab>
            <b-tab title="Diagram"></b-tab>
            <b-tab title="Description"></b-tab>
          </b-tabs>
        </div>
        
        </b-card>
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

<script lang="ts">
import CamundaRest from '../services/camunda-rest';
import { Form } from 'vue-formio';
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class Tasklist extends Vue {
    private tasks = []
    private getProcessDefinitions = []
    private taskName: ''
    private taskProcess: ''
    private formId: ''
    private submissionId: ''
    private Url: ''

  
  

  timeDifference(givendate) {      
    const diff = Math.abs(new Date() - new Date(givendate));
    const msec = diff;
    const days = Math.floor(msec / 1000 / 60 / (60 * 24))
    const dateDiff = new Date(msec);

    const hours = dateDiff.getHours();
    const minutes = dateDiff.getMinutes();
    const seconds = dateDiff.getSeconds();

    if(days === 0 && hours === 0 && minutes === 0) {
      return seconds+ " seconds ago"
    }
    else if (days === 0 && hours === 0) {
      return minutes+ " minutes ago"
    }
    else if(days === 0) {
      return hours+ " hours ago"
    }
    else {
      return days+ " days ago"
    }
  }

  getProcessDataFromList(processList,processId,dataKey) {
    const process = processList.find(process => process.id === processId);
    return process && process[dataKey];
  }

  getUserNamefromList(userList,userId) {
    const user = userList.find(user => user.id === userId);
    return user.firstName + " " + user.lastName;
  }


        if (this.$route.params.taskId) {         
          CamundaRest.getTaskById(sessionStorage.getItem('token'), this.$route.params.taskId).then((result) => {
            this.taskName = result.data.name;
            }).catch(() => {});
          
          CamundaRest.getTaskById(sessionStorage.getItem('token'), this.$route.params.taskId)
          .then((result) => {CamundaRest.getProcessDefinitionById(result.data.processDefinitionId)
          .then((res) => {
            this.taskProcess = res.data.name;
          });
          })

          CamundaRest.getVariablesByTaskId(sessionStorage.getItem('token'), this.$route.params.taskId)
          .then((result)=> {
              this.Url = result.data["formUrl"].value;
              this.formId, this.submissionId = getFormIdSubmissionIdFromFormURL(this.Url);
          }).catch(() => {});
        }

        const getFormIdSubmissionIdFromFormURL = (formUrl) => {
          const formArr = formUrl.split("/");
          const formId = formArr[4];
          const submissionId = formArr[6];
          return {formId,submissionId};
        }
      }
  

  mounted() {
    CamundaRest.getTasks(sessionStorage.getItem('token')).then((result) => {
      this.tasks = result.data;      
    }); 

    CamundaRest.getProcessDefinitions(sessionStorage.getItem('token')).then((response) => {
        this.getProcessDefinitions = response.data;
        });
  }

  components: {
      formio: Form;
  }
}

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
</style>