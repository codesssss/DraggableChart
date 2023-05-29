import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/theme-chalk/index.css';
import App from './App.vue';
import * as echarts from "echarts";
import * as VueChartJs from 'vue-chartjs';
import router from './router';

const app = createApp(App);
app.use(VueChartJs);
app.use(router);
//mount echarts to vue
app.config.globalProperties.$echarts = echarts 
app.use(ElementPlus);
app.mount('#app');
