<template v-slot:button-content>

  <b-container>
    <b-row class="text-left" align-v="start">
      <b-col cols="4">
          <b-list-group  v-if="tasks && tasks.length" class="service-task-list">   
          <div class="filter-container">
                <input type="text" class="filter" placeholder="Filter Tasks"/>
                {{tasks.length}}
          </div>
            <b-list-group-item button v-for="(task, idx) in tasks" v-bind:key="task" 
                v-on:click="toggle(idx)"
                :class="{'selected': idx == activeIndex}">
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
                    {{ getProcessDataFromList(getProcessDefinitions, task.processDefinitionId, 'name') }}         
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
        <b-row class="ml-0 task-header"> {{taskName}}</b-row>
        <b-row class="ml-0 task-name">{{taskProcess}}</b-row>
        <b-row class="ml-0 task-name">PID #{{task.processInstanceId}}</b-row>
        
        <div>
        <b-row class="actionable">
            <div class="col-md-auto">
            <b-button variant="outline-primary"><b-icon :icon="'calendar3'"></b-icon> Set Follow-up date 
            </b-button>
            </div>
            <div class="col-md">
            <b-button variant="outline-primary"><b-icon :icon="'bell'"></b-icon> Due Date </b-button>
            </div>
            <div class="col-md">
            <b-button variant="outline-primary"><b-icon :icon="'grid3x3-gap-fill'"></b-icon> Add groups </b-button>
            </div>
            <div class="col-md">
            <!-- <button type="button" class="btn btn-primary"><b-icon :icon="'person-fill'"></b-icon> Claim </button> -->
            <b-col>
              {{task.assignee}}
                 <b-button variant="outline-primary" v-if="task.assignee" @click="onUnClaim">
                   <!-- <b-spinner label="Loading..."></b-spinner> -->
                   {{task.assignee}}
                   <b-icon :icon="'person-x-fill'"></b-icon>
                 </b-button>
                 <b-button variant="outline-primary" v-else @click="onClaim">
                   <b-icon :icon="'person-fill'"></b-icon>
                   Claim
                 </b-button>
              </b-col>
            </div>
        </b-row>

        <div>
            <b-tabs content-class="mt-3" id="service-task-details">
              <b-tab title="Form" active>
                <formio :src=Url
                :submission=submissionId
                :form=formId>
                </formio>
              </b-tab>
              <b-tab title="History"></b-tab>
              <b-tab title="Diagram"></b-tab>
              <b-tab title="Description"></b-tab>
            </b-tabs>
          </div>
        </div>     
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
import { Component, Vue, Watch } from 'vue-property-decorator'
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';

@Component({
  components: {
    formio: Form
  }
})
export default class Tasklist extends Vue {
    @Watch('$route')
    fetchData

    private tasks = []
    private getProcessDefinitions = []
    private taskName = null
    private taskProcess = null
    private formId = null
    private submissionId = null
    private Url = null
    private activeIndex = null
    private username = sessionStorage.getItem("username")

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

  toggle(index){
      this.activeIndex = index
    }

  onClaim() {
    CamundaRest.claim(sessionStorage.getItem("vue-token") ,this.task.id, {userId: this.username}).then((result)=> 
    console.log(result.data)
    )
    .catch((error) => {
        console.log("Error", error);
    })
  }

  onUnClaim(){ 
    CamundaRest.unclaim(sessionStorage.getItem("vue-token") ,this.task.id).then((result)=>
      console.log(result.data)
    )
    .catch((error) =>{
      console.log("Error", error)
    })
  }


  fetchData() {
        CamundaRest.getTasks(sessionStorage.getItem('vue-token')).then((result) => {
          this.tasks = result.data;
        });
        if (this.$route.params.taskId) {         
          CamundaRest.getTaskById(sessionStorage.getItem('vue-token'), this.$route.params.taskId).then((result) => {
            this.taskName = result.data.name;
            });
          
          CamundaRest.getTaskById(sessionStorage.getItem('vue-token'), this.$route.params.taskId)
          .then((result) => {CamundaRest.getProcessDefinitionById(sessionStorage.getItem('vue-token'), result.data.processDefinitionId)
          .then((res) => {
            this.taskProcess = res.data.name;
          });
          })


          CamundaRest.getVariablesByTaskId(sessionStorage.getItem('vue-token'), this.$route.params.taskId)
          .then((result)=> {
              this.Url = result.data["formUrl"].value;
              const formArr = this.Url.split("/");
              this.formId = formArr[4];
              this.submissionId = formArr[6];
          });
        }
      }

  mounted() {
    CamundaRest.getTasks(sessionStorage.getItem('vue-token')).then((result) => {
      this.tasks = result.data;      
    }); 

    this.fetchData();
    
    CamundaRest.getProcessDefinitions(sessionStorage.getItem('vue-token')).then((response) => {
        this.getProcessDefinitions = response.data;
    }); 
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
  border-right: 2px solid #D0D0D0;
} 

#service-task-details {
  max-height: 80vh;
  overflow-y: auto;
  overflow-x: hidden;
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