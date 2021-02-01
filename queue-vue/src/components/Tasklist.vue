<template v-slot:button-content>

  <b-container>
    <b-row class="text-left" align-v="start">
      <b-col cols="4">
            <b-card>
            Created <b-icon :icon="'chevron-down'"></b-icon>
            </b-card>
            <b-list-group v-if="tasks && tasks.length">
              <div>
                <form>
                  <input placeholder="Filter Tasks">
                  <span>{{tasks.length}}</span>
                </form>
              </div>
              <b-list-group-item v-for="task in tasks" :key="task">
                    <h4><router-link :to="`/tasklist/${task.id}`">{{task.name}}</router-link><br></h4>
                    <div class="d-flex w-100 justify-content-between">
                    <!-- <h6 class="mb-1"><strong>My Process</strong></h6> -->
                    <!-- Ask with abhi about promises and how to obtain value from there -->
                    <h6 class="mb-1"><strong>{{pid(task.processDefinitionId)}}</strong></h6>
                    <!-- {{ routertask }} -->
                    <p class="mb-1"><strong> {{task.assignee}} </strong></p>
                    </div>
                    <div class="d-flex w-100 justify-content-between">
                    Created on: {{ timeDifference(task.created) }}
                    <p class="mb-1"> {{ task.priority }} </p>
                    </div>
              </b-list-group-item>
            </b-list-group>


            <!-- <div class="overflow-auto">
              <b-pagination
                v-model="currentPage"
                :total-rows="rows"
                :per-page="perpage">
              </b-pagination>
          </div>
          <p class="mt-3">Current Page: {{ currentPage }}</p> -->
      </b-col>

      <b-col cols="8">
        <b-card>  
        </b-card>
          <h1> Detailed view</h1>
          <!-- {{ task }}
          <b-list-group-item>
              {{this.$route.params.taskId}}
          </b-list-group-item> -->
          {{taskName}}
          <b/>
          {{taskProcess}}
          <div class="h2 mb-0">
              <button type="button" class="btn btn-primary"><b-icon :icon="'calendar3'"></b-icon> Set Follow-up date </button>
              <button type="button" class="btn btn-primary"><b-icon :icon="'bell'"></b-icon> Due Date </button>
              <button type="button" class="btn btn-primary"><b-icon :icon="'grid3x3-gap-fill'"></b-icon> Add groups </button>
              <button type="button" class="btn btn-primary"><b-icon :icon="'person-fill'"></b-icon> Claim </button>
          </div>

          {{ this.$route.params.taskId}}
          <generic-form v-if="this.$route.params.taskId" :taskId="this.$route.params.taskId" :formKey="taskFormKey"></generic-form>
            <div v-if="!this.$route.params.taskId">
              <p>Please choose task.</p>
            </div>
      </b-col>
    </b-row>
  </b-container>
 
</template>

<script>
  import CamundaRest from '../services/camunda-rest';
  import GenericForm from './GenericForm';
  import axios from 'axios';

  export default {
    data() {
      return {
        tasks: [],
        taskFormKey: '',
        taskName: '',
        taskProcess: '',
        processdefinitions: [],
        // perPage: 5,
        // currentPage: 1
      };
    },
    components: {
      'generic-form': GenericForm
    },
    watch: {
      '$route': 'fetchData',
      tasks() {
        this.setPages()
      }
    },
    methods: {
      fetchData() {
        CamundaRest.getTasks().then((result) => {
          this.tasks = result.data;
        });
        if (this.$route.params.taskId) {
          CamundaRest.getTask(this.$route.params.taskId).then((result) => {
            this.taskFormKey = result.data.formKey;
            this.taskName = result.data.name;
            }).catch(() => {});
          CamundaRest.getTask(this.$route.params.taskId)
          .then((result) => {CamundaRest.getProcessDefinitionById(result.data.processDefinitionId)
          .then((res) => {
            this.taskProcess = res.data.name;
          });
          })
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
      pid(processDefinitionId){
        axios.get(`${CamundaRest.ENGINE_REST_ENDPOINT}process-definition/${processDefinitionId}`)
                .then((res) => {
                  // this.routertask =  res.data.name;
                  return res.data.name
                })
                .catch(() => {});
    }
    },
    mounted() {
      CamundaRest.getTasks().then((result) => {
        this.tasks = result.data;
      });
      this.fetchData();
      // this.pid();
    },
    created() {
        CamundaRest.getProcessDefinitions().then((response)=>{
          this.processdefinitions = response.data;
        }).catch(() => {});
    }
  };

</script>

<style>
  #ul_top_hypers li {
    display: inline;
}
</style>