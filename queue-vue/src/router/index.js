import Vue from 'vue';
import Router from 'vue-router';
import TaskList from '@/components/Tasklist';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/tasklist',
      name: 'Tasklist',
      component: TaskList
    },
    {
      path: '/tasklist/:taskId',
      name: 'Tasklist for specific Task',
      component: TaskList
    }
  ]
});
