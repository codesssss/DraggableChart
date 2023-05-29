<template>
  <div id="app">
    <div id="logo-container" style="text-align: center; padding: 20px;">
      <img src="../assets/logo.png" alt="Logo" style="width: 250px; height: auto;"/>
    </div>
    <h1>Data Set Generator</h1>

    <div class="form-wrapper">
      <el-form label-width="120px">
        <el-form-item label="Select data type:">
          <el-select v-model="selectedDataType" @change="updateRange">
            <el-option label="Oxygent Saturation" value="oxygentSaturationModel"></el-option>
            <el-option label="Heart Rate" value="heartRateModel"></el-option>
            <!-- Add more options as needed -->
          </el-select>
        </el-form-item>
        <el-form-item label="Trend:">
          <el-select v-model="echartsForm.trend">
            <el-option label="Up" value="up"></el-option>
            <el-option label="Down" value="down"></el-option>
            <el-option label="Chaotic" value="chaotic"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Range:">
          From <el-input-number v-model="echartsForm.rangeFrom" :min="echartsForm.min"></el-input-number>
          To <el-input-number v-model="echartsForm.rangeTo" :max="echartsForm.max"></el-input-number>
          <span v-if="selectedDataType === 'oxygentSaturationModel'">(SaO2)</span>
          <span v-if="selectedDataType === 'heartRateModel'">(bpm)</span>
        </el-form-item>
        <el-form-item>
          <p v-if="selectedDataType === 'oxygentSaturationModel'" class="tips">
            The normal human blood oxygen value is between 90-99, <br>
            and the system has limited the data range to 50-100.
          </p>
          <p v-if="selectedDataType === 'heartRateModel'" class="tips">
            The normal resting heart rate for adults is 60-100 beats per minute.<br>
            The system limits the range to 0-300.
          </p>
        </el-form-item>
        <div class="form-content" style="width: 400px; height: 150px;">
          <el-form-item label="Generate Mode">
            <el-tabs v-model="echartsForm.activeTab" type="border-card" @tab-click="handleTabClick">
              <el-tab-pane label="Time Range & Step" name="tab1">
                <el-form-item label="Time Range:">
                  <div class="block">
                    <el-date-picker v-model="echartsForm.times" type="datetimerange" range-separator="to"
                      start-placeholder="timeFrom" end-placeholder="timeTo"></el-date-picker>
                  </div>
                </el-form-item>
                <el-form-item label="Step:">
                  <div class="block">
                    <el-time-picker v-model="echartsForm.step"></el-time-picker>
                  </div>
                </el-form-item>
              </el-tab-pane>
              <el-tab-pane label="Number of Points" name="tab2">
                <el-form-item label="Time Range:">
                  <div class="block">
                    <el-date-picker v-model="echartsForm.times" type="datetimerange" range-separator="to"
                      start-placeholder="timeFrom" end-placeholder="timeTo"></el-date-picker>
                  </div>
                </el-form-item>
                <el-form-item label="Number:">
                  <el-input-number v-model="echartsForm.numberOfPoints" style="width: 150px;"></el-input-number>
                </el-form-item>
              </el-tab-pane>
            </el-tabs>
          </el-form-item>
        </div>
        <el-form-item>
          <el-button @click="reset">Reset</el-button>
          <el-button @click="generateDataSet">Generate Data Set</el-button>
          <el-button @click="generateBlankDataSet">Generate Blank Data Set</el-button>
        </el-form-item>
        <!-- ... -->
      </el-form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';


export default {
  setup() {
    const router = useRouter();
    const selectedDataType = ref('oxygentSaturationModel');
    const echartsForm = ref({
      min: 50,
      max: 150,
      times: [],
      step: 0,
      trend: 'up',
      rangeFrom: 50,
      rangeTo: 150,
      unit: 'unknown',
      recommandRange: [0, 100],
      isBlank: false,
      numberOfPoints: 0,
      activeTab: 'tab1',
    });

    const reset = () => {
      echartsForm.value.trend = 'up';
      echartsForm.value.times = [];
      updateRange();
    };

    const updateRange = () => {
      if (selectedDataType.value === 'oxygentSaturationModel') {
        echartsForm.value.rangeFrom = 90;
        echartsForm.value.rangeTo = 99;
        echartsForm.value.recommandRange = [90, 99];
        echartsForm.value.min = 50;
        echartsForm.value.max = 100;
        echartsForm.value.unit = 'SaO2';
        echartsForm.value.isBlank = false;
        echartsForm.value.numberOfPoints = 0;
      }
      else if (selectedDataType.value === 'heartRateModel') {
        echartsForm.value.rangeFrom = 60;
        echartsForm.value.rangeTo = 100;
        echartsForm.value.recommandRange = [60, 100];
        echartsForm.value.min = 0;
        echartsForm.value.max = 300;
        echartsForm.value.unit = 'bpm';
        echartsForm.value.isBlank = false;
        echartsForm.value.numberOfPoints = 0;
      }
      else {
        // Reset to default values or set new values based on the selected data type
        echartsForm.value.rangeFrom = 0;
        echartsForm.value.rangeTo = 100;
        echartsForm.value.recommandRange = [0, 100];
        echartsForm.value.min = 0;
        echartsForm.value.max = 1000;
        echartsForm.value.isBlank = false;
        echartsForm.value.numberOfPoints = 0;
      }
    };

    const generateDataSet = () => {
      console.log(echartsForm.value.activeTab)
      if (echartsForm.value.activeTab === 'tab1') {
        if (echartsForm.value.times.length === 0 || echartsForm.value.step === 0) {
          ElMessage.error('Please set Time Range and Step before generating the data set.');
          return;
        }
      } else if (echartsForm.value.activeTab === 'tab2') {
        console.log('tab2');
        console.log(echartsForm.numberOfPoints);
        if (echartsForm.value.times.length === 0 || echartsForm.numberOfPoints === 0) {
          ElMessage.error('Please set Time Range and Number of Points before generating the data set.');
          return;
        }
      }
      // Transmit the value to the chart page
      router.push({
        path: '/chartGenerator',
        query: {
          trend: echartsForm.value.trend,
          rangeFrom: echartsForm.value.rangeFrom,
          rangeTo: echartsForm.value.rangeTo,
          times: echartsForm.value.times,
          min: echartsForm.value.min,
          max: echartsForm.value.max,
          unit: echartsForm.value.unit,
          recommandRange: echartsForm.value.recommandRange,
          isBlank: false,
          selectedDataType: selectedDataType.value,
          step: echartsForm.value.step,
          numberOfPoints: echartsForm.value.numberOfPoints,
        }
      });
    };

    const generateBlankDataSet = () => {
      if (echartsForm.value.times.length === 0) {
        ElMessage.error('Please set Time Range before generating a blank data set.');
        return;
      }
      // Transmit the value to the chart page
      router.push({
        path: '/chartGenerator',
        query: {
          trend: echartsForm.value.trend,
          rangeFrom: echartsForm.value.rangeFrom,
          rangeTo: echartsForm.value.rangeTo,
          times: echartsForm.value.times,
          min: echartsForm.value.min,
          max: echartsForm.value.max,
          unit: echartsForm.value.unit,
          recommandRange: echartsForm.value.recommandRange,
          isBlank: true,
          selectedDataType: selectedDataType.value,
          step: echartsForm.value.step,
        }
      });
    };

    const handleTabClick = (tab) => {
      echartsForm.value.activeTab = tab.props.name;
    };

    // Call updateRange initially to set the correct values
    updateRange();

    return {
      reset,
      generateDataSet,
      generateBlankDataSet,
      selectedDataType,
      echartsForm,
      updateRange,
      handleTabClick
    };
  },
};
</script>

<style scoped>
.form-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.tips {
  font-size: 14px;
  color: #999;
}

.form-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>