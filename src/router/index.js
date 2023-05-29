// src/router/index.js
import { createRouter, createWebHashHistory } from 'vue-router';
import DraggableChart from '../components/DraggableChart.vue';
import DataSetGenerator from '../components/DataSetGenerator.vue';
import App from '../App.vue';
const routes = [
  {
    path: '/',
    component: DataSetGenerator
  },
  {
    path: '/chartGenerator',
    component: DraggableChart
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
