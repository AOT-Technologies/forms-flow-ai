<template>
    <div>
        <b-row class="actionable">
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
        </b-row>
          
          <div>
            <b-tabs content-class="mt-3" id="service-task-details">
              <b-tab title="Form" active>
                <formio src="https://forms3.aot-technologies.com/#/form/5ffa9f93e941362b0cbac81f/submission/5ffec546e941363e74bac854">
                </formio>
              </b-tab>
              <b-tab title="History"></b-tab>
              <b-tab title="Diagram"></b-tab>
              <b-tab title="Description"></b-tab>
            </b-tabs>
          </div>
    </div>
</template>

<script>
import { Form } from 'vue-formio';
// import BpmnJS from 'bpmn-js/dist/bpmn-navigated-viewer.production.min.js';
// import BpmnJS from 'bpmn-js';
import BpmnViewer from 'bpmn-js';

export default {
    components: {
        formio: Form
    },
    methods: {
        test() {
            var viewer = new BpmnViewer({
            container: '#canvas'
            });
            viewer.importXML().then(function(result) {
                const { warnings } = result;
                console.log('! success', warnings);

                viewer.get('canvas').zoom('fit-viewport');
            }).catch(function(err){
                
                const { warnings, message } = err;
                console.log('something went wrong:', warnings, message);
            }) 
        }
    }
}
</script>

<style>
.actionable {
  color: #1a5a96;
  background-color: transparent;
  cursor: pointer;
  margin: 10px 0;
  font-size: 14px;
  font-weight: bold;
}


</style>