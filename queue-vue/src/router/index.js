import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/components/Home';
import TaskList from '@/components/Tasklist';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
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
