<template v-slot:button-content>

  <b-container>
    <b-row class="text-left" align-v="start">
      <b-col cols="4">
            Created
            <b-list-group v-if="tasks && tasks.length">
              <b-list-group-item v-for="task in tasks" :key="task">
                  <p><strong>
                    <router-link :to="`/tasklist/${task.id}`">{{task.name}}</router-link><br>
                    <p>My Process</p>
                    <p>Created on: {{ timeDifference(task.created) }}</p>
                  </strong></p>
              </b-list-group-item>
            </b-list-group>


            <div class="overflow-auto">
              <b-pagination
                v-model="currentPage"
                :total-rows="rows"
                :per-page="perpage">
              </b-pagination>
          </div>
          <p class="mt-3">Current Page: {{ currentPage }}</p>
      </b-col>

      <b-col cols="8">
          <h1> Detailed view</h1>
          <div class="h2 mb-0">
              <button type="button" class="btn btn-primary"><b-icon :icon="'calendar'"></b-icon> Set Follow-up date </button>
              <button type="button" class="btn btn-primary"><b-icon :icon="'bell'"></b-icon> Due Date </button>
              <button type="button" class="btn btn-primary"><b-icon :icon="'grid3x3-gap-fill'"></b-icon> Add groups </button>
              <button type="button" class="btn btn-primary"><b-icon :icon="'person-fill'"></b-icon> Claim </button>
          </div>

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

  export default {
    data() {
      return {
        tasks: [],
        taskFormKey: '',
        processdefinitions: [],
        perPage: 5,
        currentPage: 1
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
          CamundaRest.getTaskFormKey(this.$route.params.taskId).then((result) => {
            this.taskFormKey = result.data.key;
          });
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
          return seconds+ " Seconds"
        }
        else if (days===0&&hours===0) {
          return minutes+ " Minutes"
        }
        
        else if(days ===0){
          return hours+ " Hours"
        }
        else {
          return days+ " Days"
        }
      }
    },
    mounted() {
      CamundaRest.getTasks().then((result) => {
        this.tasks = result.data;
      });
      this.fetchData();
    },
    created() {
        CamundaRest.getProcessDefinitions().then((response)=>{
          this.processdefinitions = response.data;
        }).catch(() => {});
        this.getPosts();
    }
  };

</script>

<style>
  #ul_top_hypers li {
    display: inline;
}
</style>