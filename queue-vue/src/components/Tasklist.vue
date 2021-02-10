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
                    <h6 class="mb-1"><strong>
                      {{ getProcessDataFromList(processDefinitionList, task.processDefinitionId, 'name') }}
                      </strong></h6>
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
          <h1>{{taskName}}</h1>
          <h3>{{taskProcess}}</h3>
          {{formid}}

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
              <formio src="https://forms2.aot-technologies.com/form/601871fe3dd9a85a1fa622be">
              </formio>
            </b-tab>
            <b-tab title="History"></b-tab>
            <b-tab title="Diagram"></b-tab>
            <b-tab title="Description"></b-tab>
          </b-tabs>
        </div>
        
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
  import CamundaRest from '../services/camunda-rest';
  import { Form } from 'vue-formio';
  // import { Component, Vue } from 'vue-property-decorator';


  export default {
    data() {
      return {
        tasks: [],
        taskFormKey: '',
        taskName: '',
        taskProcess: '',
        formId: '',
        submissionId: '',
        Url: '',
        processDefinitionList: [],
        userList: []
        // perPage: 5,
        // currentPage: 1
      };
    },
    components: {
      formio: Form,
    },
    watch: {
      '$route': 'fetchData',
    },
    methods: {
      fetchData() {
        // CamundaRest.getTask().then(())
        CamundaRest.getTasks(localStorage.getItem('vue-token')).then((result) => {
          this.tasks = result.data;
        });
        if (this.$route.params.taskId) {         
          CamundaRest.getTaskById(localStorage.getItem('vue-token'), this.$route.params.taskId).then((result) => {
            this.taskFormKey = result.data.formKey;
            this.taskName = result.data.name;
            }).catch(() => {});
          
          CamundaRest.getTaskById(localStorage.getItem('vue-token'), this.$route.params.taskId)
          .then((result) => {CamundaRest.getProcessDefinitionById(localStorage.getItem('vue-token'), result.data.processDefinitionId)
          .then((res) => {
            this.taskProcess = res.data.name;
          });
          })

          CamundaRest.getVariablesByTaskId(localStorage.getItem('vue-token'), this.$route.params.taskId)
          .then((result)=> {
              this.Url = result.data["formUrl"].value;
              this.formId, this.submissionId = getFormIdSubmissionIdFromFormURL(this.url);
          }).catch(() => {});
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
    computed: {
      inDetail() {
        if(this.taskName===''){
          return 0;
        }
        else{
          return 1;
        }
      }
    },
    mounted() {
      CamundaRest.getTasks(localStorage.getItem('vue-token')).then((result) => {
        this.tasks = result.data;
      });
      this.fetchData();

      CamundaRest.getProcessDefinition(localStorage.getItem('vue-token')).then((response) => {
        this.processDefinitionList = response.data;
        });

      CamundaRest.getUserList(localStorage.getItem('vue-token')).then((response) => {
        this.userList = response.data;
      }).catch(() => {});
  }
  };

</script>

<style>
  #ul_top_hypers li {
    display: inline;
}
</style>