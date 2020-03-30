<template>
<v-container style="max-width: 100%">
  <v-row dark style="background-color: rgb(51,51,51); margin-top: -12px; padding-bottom: 60px">
    <v-col cols="12"
    >
      <h3 dark style="color: white">DASHBOARD</h3>
    </v-col>
  </v-row>
  <v-row align="center" justify="center">
    <v-col cols="12" sm="10" lg="10"
      style="
        padding-top: 0px;
        margin-top: -50px;
        background-color: white;
        border-radius: 5px;
        border: 1px solid transparent;
        border-image: linear-gradient(to bottom, rgb(51,51,51) 0%, rgba(255,255,255,0) 50%);
        border-image-slice: 1;
      "
    >
      <v-row>
        <v-col cols="12" md="8">
          <canvas id="canales-chart"></canvas>
        </v-col>
        <v-col cols="12" md="4">

        </v-col>
      </v-row>
    </v-col>
  </v-row>
</v-container>
</template>

<script>
import Chart from 'chart.js';
export default {
  name: 'Home',
  methods: {
    createChart(chartId, chartData) {
      const ctx = document.getElementById(chartId);
      new Chart(ctx, {
        type: "horizontalBar",
        data: chartData.data,
        options: {
          title: {
            display: true,
            text: 'Estado de canales'
          },
          legend:{
            display: false
          },
          responsive: true,
          scales: {
            xAxes: [{
              ticks: {
                beginAtZero: true,
                min: 0,
                max: 100
              },
              scaleLabel: {
                display: true,
                labelString: "% Potencia"
              }
            }],
            // yAxes: [{
            //   ticks: {
            //     beginAtZero: true,
            //     padding: 25,
            //   },
            //   scaleLabel: {
            //     display: true,
            //     labelString: "Potencia %"
            //   }
            // }]
          }
        }
      });
    },
    request()
    {
      var self = this;

      this.$http.get(this.$remoteServer + 'canales').then(function(response){
        this.fillChartData( response.body["canales"] );
      }, function(){
          self.error = true;
      });
    },
    fillChartData( canales )
    {
      var obj = {
        data: {
          labels: [],
          datasets: [{
            data: [],
            backgroundColor: "#b3d4fc"
          }]
        },
      }

      for (let i = 0; i < canales.length; i++)
      {
        var rango = canales[i].max_pwm - canales[i].min_pwm;
        var valor = canales[i].current_pwm - canales[i].min_pwm;

        let nombre = "Canal #" + (i + 1);
        obj.data.labels.push(nombre);
        obj.data.datasets[0].data.push(Math.round(valor * 100 / rango));
      }

      this.createChart("canales-chart", obj)
    }
  },
  created(){
    this.request();
  }
}
</script>
