<template>
  <div>
    <sui-grid>
      <sui-grid-row :columns="2">
        <sui-grid-column :width="5">
          <sui-segment >
            <sui-list divided relaxed v-if="tasks && tasks.length">
              <sui-list-item v-for="task in tasks" :key="task">
                <sui-list-content>
                  <p><strong>
                    <router-link :to="`/tasklist/${task.id}`">{{task.name}}</router-link><br>
                    <p>My Process</p>
                    {{task.name}}
                    <p>Created on: {{ timeDifference(task.created) }}</p>
                  </strong></p>
                </sui-list-content>
              </sui-list-item>
            </sui-list>
          </sui-segment>
        </sui-grid-column>
        <sui-grid-column :width="11">
          <sui-segment raised>
            <h2> Approve Data</h2>
            <h2> MyData</h2>
            <sui-list v-if="processdefinitions && processdefinitions.length">
                    <sui-list-item :key="processdefinition.id" v-for="processdefinition of processdefinitions">
                      <p>{{ processdefinition.name }}</p>
                    </sui-list-item>
                     </sui-list>
            <sui-menu :widths="4">
            <sui-list-item>
              <sui-list-icon name="calendar alternate" />
              <sui-list-content> Set follow-up date</sui-list-content>
            </sui-list-item>
            <sui-list-item>
              <sui-list-icon name="bell" />
              <sui-list-content> Due date</sui-list-content>
            </sui-list-item>
            <sui-list-item icon="th" content="Add groups"></sui-list-item>
            <sui-list-item icon="user" content="Claim"></sui-list-item>
            </sui-menu>

            <sui-menu>
            <sui-menu-item>Form</sui-menu-item>
            <sui-menu-item>History</sui-menu-item>
            <sui-menu-item active>Diagrams</sui-menu-item>
            <sui-menu-item>Description</sui-menu-item>
            </sui-menu>

            <generic-form v-if="this.$route.params.taskId" :taskId="this.$route.params.taskId" :formKey="taskFormKey"></generic-form>
            <div v-if="!this.$route.params.taskId">
              <p>Please choose task.</p>
            </div>
          </sui-segment>
        </sui-grid-column>
      </sui-grid-row>
    </sui-grid>
  </div>
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
        page: 1,
        perPage: 15,
        pages: [],
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