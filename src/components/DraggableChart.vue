<template>
  <!-- Create the draggable chart component template -->
  <div>
    <div>
      <el-row>
        <el-col :span="4">
          <!-- Add the back button using Element UI -->
          <el-button type="primary" @click="onBackButtonClick">Back</el-button>
        </el-col>
      </el-row>
    </div>
    <!-- Radio group for selecting "edit" or "add" mode -->
    <div>
      <el-radio-group v-model="mode" >
        <el-radio-button label="edit">Edit</el-radio-button>
        <el-radio-button label="add">Add</el-radio-button>
      </el-radio-group>
    </div>
    <!-- Chart container -->
    <div ref="chart" style="width: 100%; height: 500px;">
    </div>
    <!-- <div v-if="selectedPointIndex !== null"> -->
    <div style="display: flex; justify-content: center; align-items: center; height: 100%;">
      <!-- Point information container -->
      <div v-if="isPointSelected" title="Point Information">
        <el-row gutter="20">
          <el-col :span="12">
            <el-input v-model="computedSelectedPointX" placeholder="Timestamp">
              <template #prepend>X:</template>
            </el-input>
          </el-col>
          <el-col :span="12">
            <el-input v-model="computedSelectedPointY" placeholder="Y coordinate" :suffix-icon="this.unit">
              <template #prepend>Y:</template>
            </el-input>
          </el-col>
        </el-row>
        <!-- Save and delete buttons for the selected point -->
        <el-row style="margin-top: 20px;">
          <el-col :span="12">
            <el-button type="primary" @click="saveUpdatedPoint" style="width: 100%;">Save</el-button>
          </el-col>
          <el-col :span="12">
            <el-button type="danger" @click="onPointDelete" style="width: 100%;">Delete</el-button>
          </el-col>
        </el-row>
      </div>
      <!-- Generate JSON button -->
      <div>
        <el-button type="primary" @click="onJsonSend" style="width: 100%;">Generate JSON</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import { useRoute } from 'vue-router';
import { heartRateTemplate, oxygenSaturationTemplate } from '../utils/template.js';
import { markRaw } from 'vue';
export default {
  name: "DraggableChart",
  data() {
    return {
      chartInstance: null,
      data: [],
      symbolSize: 12,
      mode: 'edit',
      selectedPointIndex: null,
      deleteDialogVisible: false,
      selectedPoint: null,
      selectedPointX: 0,
      selectedPointY: 0,
      isPointSelected: false,
      pointIndex: 0,
      url: null,
      unit: null,
      dataType: null,
      step: 0,
    };
  },
  computed: {
    computedSelectedPointX: {
      get() {
        if (this.selectedPointIndex !== null) {
          return this.data[this.selectedPointIndex][0];
        }
        return null;
      },
      set(newValue) {
        if (this.selectedPointIndex !== null) {
          this.data[this.selectedPointIndex][0] = newValue;
        }
      },
    },
    computedSelectedPointY: {
      get() {
        if (this.selectedPointIndex !== null) {
          return this.data[this.selectedPointIndex][1];
        }
        return null;
      },
      set(newValue) {
        if (this.selectedPointIndex !== null) {
          this.data[this.selectedPointIndex][1] = newValue;
        }
      },
    },
  },
  methods: {
    // Initialize the chart instance
    initChart() {
      this.chartInstance = echarts.init(this.chart);
      const { trend, rangeFrom, rangeTo, times, min, max, unit, recommandRange, isBlank, selectedDataType, step, numberOfPoints } = this.route.query;
      var option, data;
      console.log(numberOfPoints);
      if (isBlank === 'false') {
        const timeRange = [new Date(times[0]), new Date(times[1])];
        if (numberOfPoints == 0) {
          this.dataType = selectedDataType;
          const dateOfStep = new Date(step);
          this.step = dateOfStep.getHours() * 60 * 60 * 1000 + dateOfStep.getMinutes() * 60 * 1000 + dateOfStep.getSeconds() * 1000;
          data = this.generateStepData(timeRange, trend, rangeFrom, rangeTo);
        }
        else {
          data = this.generateNumData(timeRange, trend, rangeFrom, rangeTo, numberOfPoints);
        }
        const recommandNum = [Number(recommandRange[0]), Number(recommandRange[1])];
        this.data = data;
        this.unit = unit;
        option = {
          toolbox: {
            feature: {
              saveAsImage: {},
              dataZoom: {},
            }
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              label: {
                backgroundColor: '#6a7985'
              }
            }
          },
          xAxis: {
            type: 'time',
            min: timeRange[0],
            max: timeRange[1],
            name: 'Time',
            nameLocation: 'middle',
            nameGap: 30,
          },
          yAxis: {
            type: 'value',
            min: min,
            max: max,
            name: unit,
            nameLocation: 'middle',
            nameGap: 40,
          },
          series: [
            {
              id: 'a',
              data: this.data,
              type: 'line',
              symbol: 'circle',
              smooth: true,
              symbolSize: this.symbolSize,
            },
            {
              type: 'line',
              markLine: {
                silent: true,
                symbol: 'none',
                data: [
                  {
                    yAxis: recommandNum[0],
                    lineStyle: {
                      color: 'red'
                    }
                  },
                  {
                    yAxis: recommandNum[1],
                    lineStyle: {
                      color: 'green'
                    }
                  }
                ]
              }
            }
          ],
        };
      }
      else {
        const timeRange = [new Date(times[0]), new Date(times[1])];
        const recommandNum = [Number(recommandRange[0]), Number(recommandRange[1])];
        this.unit = unit;
        option = {
          toolbox: {
            feature: {
              saveAsImage: {}
            }
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              label: {
                backgroundColor: '#6a7985'
              }
            }
          },
          xAxis: {
            type: 'time',
            min: timeRange[0],
            max: timeRange[1],
            name: 'Time',
            nameLocation: 'middle',
            nameGap: 30,
          },
          yAxis: {
            type: 'value',
            min: min,
            max: max,
            name: unit,
            nameLocation: 'middle',
            nameGap: 40,
          },
          dataZoom: [ // Add dataZoom component
            {
              type: 'slider', // Use the slider form dataZoom
              xAxisIndex: [0], // Acting on the x-axis
              start: 0, // Percentage of left border position to total length at initialization
              end: 100, // Percentage of right border position to total length at initialization
            },
            {
              type: 'inside', // Use the slider form dataZoom
              xAxisIndex: [0], // Acting on the x-axis
              start: 0, // Percentage of left border position to total length at initialization
              end: 100, // Percentage of right border position to total length at initialization
            },
          ],
          series: [
            {
              id: 'a',
              data: [],
              type: 'line',
              symbol: 'circle',
              smooth: true,
              symbolSize: this.symbolSize,
            },
            {
              type: 'line',
              markLine: {
                silent: true,
                symbol: 'none',
                data: [
                  {
                    yAxis: recommandNum[0],
                    lineStyle: {
                      color: 'red'
                    }
                  },
                  {
                    yAxis: recommandNum[1],
                    lineStyle: {
                      color: 'green'
                    }
                  }
                ]
              }
            }
          ],
        };
      }
      this.chartInstance.setOption(option);
      this.chartInstance.getZr().on('click', this.handleClick);
      this.chartInstance.getZr().on('mousemove', this.handleMouseMove);
    },

    generateStepData(timeRange, trend, rangeFrom, rangeTo) {
      const data = [];
      const startTime = timeRange[0].getTime();
      const endTime = timeRange[1].getTime();
      const step = this.step;
      const rangeFromNum = Number(rangeFrom);
      const rangeToNum = Number(rangeTo);
      const rangeDelta = (rangeToNum - rangeFromNum) / (endTime - startTime);
      let currentValue;
      if (trend === 'up') {
        currentValue = rangeFromNum;
      } else if (trend === 'down') {
        currentValue = rangeToNum;
      } else if (trend === 'chaotic') {
        currentValue = rangeFromNum;
      } else {
        currentValue = rangeFromNum + Math.random() * (rangeToNum - rangeFromNum);
      }
      for (let timestamp = startTime; timestamp <= endTime; timestamp += step) {
        let value;
        if (trend === 'up') {
          value = currentValue + Math.random() * rangeDelta * step;
          currentValue = Math.min(value, rangeToNum);
        } else if (trend === 'down') {
          value = currentValue - Math.random() * rangeDelta * step;
          currentValue = Math.max(value, rangeFromNum);
        } else if (trend === 'chaotic') {
          value = rangeToNum - Math.random() * (rangeToNum - rangeFromNum);
          currentValue = Math.max(value, rangeFromNum);
          currentValue = Math.min(value, rangeToNum);
        } else {
          value = currentValue;
          currentValue = rangeFromNum + Math.random() * (rangeToNum - rangeFromNum);
        }
        value = parseFloat(value); // Ensure value is a number
        data.push([timestamp, parseFloat(value.toFixed(2))]);
      }
      console.log(data);
      return data;
    },

    generateNumData(timeRange, trend, rangeFrom, rangeTo, numberOfPoints) {
      const data = [];
      const startTime = timeRange[0].getTime();
      const endTime = timeRange[1].getTime();
      const timeDelta = endTime - startTime;
      const rangeFromNum = Number(rangeFrom);
      const rangeToNum = Number(rangeTo);
      const rangeDelta = (rangeToNum - rangeFromNum) / timeDelta;
      let currentValue;
      const averageTimeInterval = timeDelta / numberOfPoints;

      if (trend === 'up') {
        currentValue = rangeFromNum;
      } else if (trend === 'down') {
        currentValue = rangeToNum;
      } else if (trend === 'chaotic') {
        currentValue = rangeFromNum;
      } else {
        currentValue = rangeFromNum + Math.random() * (rangeToNum - rangeFromNum);
      }

      for (let i = 0; i < numberOfPoints; i++) {
        const randomTimeInterval = Math.random() * averageTimeInterval;
        const timestamp = startTime + i * averageTimeInterval + randomTimeInterval;

        let value;
        if (trend === 'up') {
          value = currentValue + Math.random() * rangeDelta * randomTimeInterval;
          currentValue = Math.min(value, rangeToNum);
        } else if (trend === 'down') {
          value = currentValue - Math.random() * rangeDelta * randomTimeInterval;
          currentValue = Math.max(value, rangeFromNum);
        } else if (trend === 'chaotic') {
          value = rangeToNum - Math.random() * (rangeToNum - rangeFromNum);
          currentValue = Math.max(value, rangeFromNum);
          currentValue = Math.min(value, rangeToNum);
        } else {
          value = currentValue;
          currentValue = rangeFromNum + Math.random() * (rangeToNum - rangeFromNum);
        }
        value = parseFloat(value); // Ensure value is a number
        data.push([timestamp, parseFloat(value.toFixed(2))]);
      }
      return data;
    },


    // Handle the click event on the chart, either adding a new point or selecting an existing one
    handleClick(event) {
      if (this.mode === 'add') {
        const pointInPixel = [event.offsetX, event.offsetY];
        if (this.chartInstance.containPixel('grid', pointInPixel)) {
          const pointInGrid = this.chartInstance.convertFromPixel('grid', pointInPixel);
          this.addDataPoint(pointInGrid);
        }
      }
      if (!this.inNode && this.mode === 'edit') {
        const pointInPixel = [event.offsetX, event.offsetY];
        const dataIndex = this.chartInstance.convertFromPixel("grid", pointInPixel);
        if (this.chartInstance.containPixel("grid", pointInPixel)) {
          this.selectedPoint = this.data[dataIndex];
          this.deleteDialogVisible = true;
        }
        setTimeout(() => {
          this.updateChartOptions();
        }, 0);
        window.addEventListener("resize", this.updatePosition);
      }

    },

    // Handle the mousemove event on the chart, changing the cursor style based on mode and grid
    handleMouseMove(event) {
      const pointInPixel = [event.offsetX, event.offsetY];
      this.chartInstance.getZr().setCursorStyle(this.chartInstance.containPixel('grid', pointInPixel) && (this.mode === 'edit') ? 'copy' : 'default');
    },

    // Add a new data point to the chart
    addDataPoint(point) {
      const data = this.chartInstance.getOption().series[0].data;
      data.push(point);
      this.data = data;
      this.data.sort((a, b) => a[0] - b[0]);
      this.updateChartOptions();
    },

    // Update the position of the draggable data points on the chart
    updatePosition() {
      this.chartInstance.setOption({
        graphic: echarts.util.map(this.data, item => ({
          position: this.chartInstance.convertToPixel("grid", item)
        }))
      });
    },

    // Save the updated data point after editing
    saveUpdatedPoint() {
      // Update the point in the data array
      this.data[this.selectedPointIndex] = [parseFloat(this.computedSelectedPointX), parseFloat(this.computedSelectedPointY)];

      // Update the position of the point on the chart
      this.updateChartOptions();

      // Close the point information dialog
      this.isPointSelected = false;
    },

    // Handle dragging a data point on the chart
    onPointDragging(dataIndex, event) {
      const newPosition = this.chartInstance.convertFromPixel('grid', event.target.position);

      // Get the Y-axis range
      const yAxisMin = this.chartInstance.getOption().yAxis[0].min;
      const yAxisMax = this.chartInstance.getOption().yAxis[0].max;

      // Get the neighboring points
      const leftNeighbor = dataIndex > 0 ? this.data[dataIndex - 1] : null;
      const rightNeighbor = dataIndex < this.data.length - 1 ? this.data[dataIndex + 1] : null;

      // Check if the new position is within the Y-axis range and between the neighboring points
      if (newPosition[1] >= yAxisMin && newPosition[1] <= yAxisMax &&
        (!leftNeighbor || newPosition[0] > leftNeighbor[0]) &&
        (!rightNeighbor || newPosition[0] < rightNeighbor[0])) {

        this.data[dataIndex] = newPosition;
        this.chartInstance.setOption({
          series: [
            {
              id: 'a',
              data: this.data
            }
          ]
        });
      }
    },


    // Handle clicking a data point on the chart
    onPointClick(dataIndex, event) {
      if (dataIndex >= 0 && dataIndex < this.data.length) {
        this.selectedPointIndex = dataIndex;
        this.selectedPointX = this.data[dataIndex][0];
        this.selectedPointY = this.data[dataIndex][1];
        this.dataIndex = dataIndex;
        console.log('ispoint'+this.isPointSelected)
        if (!this.mode === 'edit') {
          this.isPointSelected = false;
        }
        else {
          this.isPointSelected = true;
        }
      }
      else {
        console.warn(`Data point at index ${dataIndex} does not exist.`);
      }
    },

    // Delete the selected data point from the chart
    onPointDelete() {
      this.data.splice(this.dataIndex, 1);
      this.isPointSelected = false;
      console.log(this.data);
      this.updateChartOptions();
    },

    onBackButtonClick() {
      this.$router.go(-1);
    },

    // Update the chart options after data changes
    updateChartOptions() {
      this.chartInstance.setOption({
        series: [
          {
            id: 'a',
            data: this.data
          }
        ],
        graphic: echarts.util.map(this.data, (item, dataIndex) => ({
          type: 'circle',
          position: this.chartInstance.convertToPixel('grid', item),
          shape: {
            cx: 0,
            cy: 0,
            r: this.symbolSize / 2
          },
          draggable: this.mode === 'edit',
          ondrag: echarts.util.curry(this.onPointDragging, dataIndex),
          onclick: echarts.util.curry(this.onPointClick, dataIndex),
          z: 100
        }))
      });
    },

    // Send the JSON data of the chart points to a specified URL
    async sendJsonData(url) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.toObservations(this.data))
        });
        if (response.ok) {
          console.log('JSON data sent successfully');
        } else {
          console.error('JSON data could not be sent');
        }
      } catch (error) {
        console.error('An error occurred while sending JSON data', error);
      }
    },

    // Convert the chart data to an array of observations
    onJsonSend() {
      const json = this.data.map((dataPoint) =>
        this.dataToObservation(this.dataType, dataPoint[0], dataPoint[1])
      );
      console.log(json);
      this.$message({
      message: 'Json has been generated and sent！',
      type: 'success'
    });
      // this.$emit("json-send", json);
    },

    // Convert a data point to an observation object based on the given type
    dataToObservation(type, timestamp, value) {
      const template = type === "heartRateModel" ? heartRateTemplate : oxygenSaturationTemplate;
      const observation = JSON.parse(JSON.stringify(template));
      observation.effectiveDateTime = new Date(timestamp).toISOString();
      observation.valueQuantity.value = value;
      return observation;
    },
  },
  // When the component is mounted, initialize the chart and set up a watcher for the route query
  mounted() {
    this.chart = markRaw(this.$refs.chart);
    this.route = useRoute();
    this.initChart();
    this.$watch(
      () => this.route.query,
      () => {
        this.initChart();
      },
    );
  },
}
</script>

<style scoped>
/* Add any custom styles for the chart here */
</style>
