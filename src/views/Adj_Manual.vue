<template>
  <v-row align="center" justify="center">
    <v-col cols="12" md="10" lg="10">
      <p class="my-4 px-4 text-uppercase font-weight-light overline">Ajuste > Canales</p>
      <v-divider></v-divider>
      <h4 class="my-2 px-4">Ajuste individual de cada canal</h4>
      <v-divider></v-divider>
      <div v-if="loading">
        <v-skeleton-loader
          type="article"
          class="mx-auto"
      ></v-skeleton-loader>
      </div>
      <v-row>
        <v-col cols="12" lg="6">
          <canvas id="espectro-chart"></canvas>
        </v-col>
        <v-col cols="12" lg="6">
          <v-form v-if="!loading" class="mx-4">
            <v-row align="center">
              <v-col cols="12" class="d-flex justify-end">
                <v-btn large text color="primary" v-on:click="request()">Actualizar</v-btn>
              </v-col>
              <v-col cols="8">
                  <v-input
                      :messages="['Habilitar este modo deshabilitará el modo programado.']"
                      dense
                  >
                      Habilitar ajuste manual
                  </v-input>
              </v-col>
              <v-col cols="4" class="d-flex justify-end" >
                  <v-spacer></v-spacer>
                  <v-switch v-model="modo_manual" flat inset dense @change="send()"></v-switch>
              </v-col>
            </v-row>
            <v-row v-if="modo_manual">
              <v-col cols="12" sm="6" lg="6" v-for="(canal, i) in canales" :key="i">
                <v-row>
                  <v-col cols="12" class="d-flex justify-space-between">
                    <p class="mx-0 my-0" >Canal: {{i+1}}</p><p class="mx-0 my-0">{{canal.nuevo_porcentaje}}%</p>
                  </v-col>
                  <v-col cols="12 py-0">
                    <v-slider
                      v-model="canal.nuevo_porcentaje"
                      track-color="grey"
                      always-dirty
                      min="0"
                      max="100"
                      @change="send()"
                      :disabled="!canal.enabled"
                    >
                      <template v-slot:prepend>
                        <v-icon
                          @click="decrement(i)"
                        >
                          mdi-minus
                        </v-icon>
                      </template>
              
                      <template v-slot:append>
                        <v-icon
                          @click="increment(i)"
                        >
                          mdi-plus
                        </v-icon>
                      </template>
                    </v-slider>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-form>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>
<script>
// import Polynomial from "polynomial";
import { simplify, parse } from "mathjs";
import Chart from "chart.js";

export default {
  name: 'Adj_Manual',
  data: () => ({
      canales: [{},{}],
      modo_manual: false,
      loading: true
    }),
  methods: {
    createChart(chartId, chartData) {
      const ctx = document.getElementById(chartId);
      new Chart(ctx, {
        type: chartData.type,
        data: chartData.data,
        options: {
          title: {
            display: true,
            text: 'Espectro'
          },
          legend:{
            display: false
          },
          responsive: true,
          aspectRatio: 1,
          scales: {
            xAxes: [{
              ticks: {
                callback: function(value) {
                    return parseFloat(value).toFixed(2);
                },
                maxTicksLimit: 10,
                display: false
              },
              gridLines: {
                display: false
              },
              scaleLabel: {
                display: true,
                labelString: "Longitud de onda"
              }
            }],
            yAxes: [{
              ticks: {
                beginAtZero: true,
                padding: 25,
                min: 0,
                stepSize: 1
              },
              scaleLabel: {
                display: true,
                labelString: ""
              }
            }]
          }
        }
      });
    },
    decrement( num )
    {
      this.canales[num].nuevo_porcentaje -= 5;
    },
    increment( num )
    {
      this.canales[num].nuevo_porcentaje += 5;
    },
    send()
    {
      var self = this;

      self.success = false;
      self.error = false;

      var tmpCanales = [];
      for(var i = 0; i < self.canales.length; i++)
      {
        if (self.canales[i].nuevo_porcentaje != self.canales[i].porcentaje)
        {
          var rango = self.canales[i].max_pwm - self.canales[i].min_pwm;
          var valor = self.canales[i].min_pwm + (rango * self.canales[i].nuevo_porcentaje / 100);
          self.canales[i].current_pwm = valor;

          self.canales[i].porcentaje = self.canales[i].nuevo_porcentaje;
          tmpCanales.push(self.canales[i]);
        }
      }

      var obj = {
        modo_programado: !self.modo_manual,
        canales: tmpCanales
      }

      this.$http.post('canales', obj).then(function(/* response */)
      {
        self.success = true;
        setTimeout(()=>{
          self.success = false;
        }, 5000);
      }, function(){
          self.error = true;
          self.loading = false;
      });

      this.updateChart();
    },
    request()
    {
      var self = this;
      this.$http.get('canales').then(function(response)
      {
        self.modo_manual = !response.body["modo_programado"];
        self.canales = response.body["canales"];

        for (var i = 0; i < self.canales.length; i++)
        {
          var rango = self.canales[i].max_pwm - self.canales[i].min_pwm;
          var valor = self.canales[i].current_pwm - self.canales[i].min_pwm;

          self.canales[i].porcentaje = valor * 100 / rango;

          self.canales[i].nuevo_porcentaje = self.canales[i].porcentaje;
        }

        this.updateChart();

        self.loading = false;

      }, function(){
          self.error = true;
          self.loading = false;
      });
    },
    updateChart()
    {
      var blancos = [];
      var color = [];

      for (var i = 0; i < this.canales.length; i++)
      {
        for (var j = 0; j < this.canales[i].leds.length; j++)
        {
          if (this.canales[i].leds[j].K > 0)
          {
            blancos.push({
              temperatura: this.canales[i].leds[j].K,
              potencia: this.canales[i].leds[j].W * this.canales[i].porcentaje / 100
            });
          }
          else
          {
            color.push({
              nm: this.canales[i].leds[j].nm,
              potencia: this.canales[i].leds[j].W * this.canales[i].porcentaje / 100
            });
          }
        }
      }

      if (blancos.length > 0 || color.length > 0)
      {
        
        var obj = {
          type: 'line',
          data: {
            labels: [],
            datasets: [
              { // one line graph
                data: [],
                lineTension: 0.3,  
                borderWidth: 3,
                borderColor: [
                  '#47b784',
                ],
                pointBackgroundColor: 'rgba(0,0,0,0)',
                pointBorderColor: 'rgba(0,0,0,0)',
                pointBorderWidth: 0
              }
            ]
          },
        }

        const p = this.polinomio(blancos,color,0);
        console.log(p);
        const f = parse(p);
        const simplified = simplify(f);
        for (var z = 0; z <= 10; z += 0.1)
        {
          obj.data.labels.push(z);
          var onda =simplified.evaluate({ x: z });
          obj.data.datasets[0].data.push(onda);
        }

        this.createChart('espectro-chart', obj);
      }
    },
    polinomio(blancos, color, fullespectro)
		{
      //Variables
			var w = 0;
			var i = 0;
			var k = ''; //si varia entre rangos
			var l = '';
			var n = 4.87298334620742;
			var p = ''; //(color[i].nm-400)/30; //solo aplica a color
			var m = '('; //son las que sumará al final

      //FullSpectrum
      if(fullespectro > 0)
      {
        m = m + '((' + fullespectro + '(0.408689018624721((3*e^(-(x-9.6)^2/7))+(8.2*e^(-(x-1.7)^2/0.3))+(7.7*e^(-(x-8.2)^2/2.5))+(1.1*e^(-(x-9.6)^2/0.06)+(2*e^(-(x-2)^2/0.8)))))';
        w += fullespectro;
      }
      
      //Blancos
      for(i=0; i < blancos.length; i++){
      
        if (m != '(') {
          m = m + '+';
        }

        if (blancos[i].temperatura < 3500){

          k = 8+(((2600-blancos[i].temperatura)/100 )* 0.125);
          l = 10.896322/(2.23606798+1.73205081 * k);
          m = m + '(' + blancos[i].potencia + '*(' + l + '*((5*e^(-(x-2)^2/0.2))+(' + k + '*e^(-(x-6.2)^2/3)))))';

        } else if (blancos[i].temperatura > 3500 && blancos[i].temperatura < 5000){

          k = 5+(((4000-blancos[i].temperatura)/100 )* ((100*0.7)/300));
          l = 10.896322/(2.23606798+1.73205081 * k);
          m = m + '(' + blancos[i].potencia + '*(' + l + '*((5*e^(-(x-2)^2/0.2))+(' + k + '*e^(-(x-5.7)^2/3)))))';

        } else if (blancos[i].temperatura > 5000 && blancos[i].temperatura < 6500){	

          k = 2.5+(((5500-blancos[i].temperatura)/100 )* 0.125);
          l = 10.896322/(2.23606798+1.73205081 * k);
          m = m + '(' + blancos[i].potencia + '*(' + l + '*((5*e^(-(x-2)^2/0.2))+(' + k + '*e^(-(x-5.2)^2/3)))))';

        } else {

          k = 2.1+(((6500-blancos[i].temperatura)/100 )*(100*0.9)/8500);
          l = 10.896322/(2.23606798+1.73205081 * k);
          m = m + '(' + blancos[i].potencia + '*(' + l + '*((5*e^(-(x-2)^2/0.2))+(' + k + '*e^(-(x-5.2)^2/3)))))';
        }

        w += blancos[i].potencia;
        
      }

      //Color
      for(i=0; i < color.length; i++){
        p = (color[i].nm-400)/30;
        if(m == '('){
          m = m + '(' + color[i].potencia + '*(' + n + '*(5*e^(-(x- ' + p + ')^2/0.2))))';
        } else {
          m = m + '+' + '(' + color[i].potencia + '*(' + n + '*(5*e^(-(x- ' + p + ')^2/0.2))))';
        }
        
        w += color[i].potencia;
      }
      
      return m + ')/' + w ;
		}
  }, 
  created: function(){
    this.request();
  }
}
</script>
