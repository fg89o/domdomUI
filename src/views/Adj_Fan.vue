<template>

  <v-row align="center" justify="center">
    <v-col cols="12" sm="10" lg="8">
      <p class="my-4 px-4 text-uppercase font-weight-light overline">Ajuste > Ventilador</p>
      <v-divider></v-divider>
      <h4 class="my-2 px-4">Configuración actual del ventilador en base a la temperatura</h4>
      <v-divider></v-divider>
      <div v-if="loading">
        <v-skeleton-loader
          type="article"
          class="mx-auto"
      ></v-skeleton-loader>
      </div>
      <v-row>
        <v-col cols="12" sm="8" lg="6" class="d-flex justify-center">
          <canvas id="fan-chart"></canvas>
        </v-col>
        <v-col cols="12" sm="4" lg="4">
          <v-form>
            <v-col cols="12" sm="6">
              <v-text-field
                  readonly
                  v-model="potencia"
                  label="Potencia actual"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                  readonly
                  v-model="temperatura"
                  label="Temperatura"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                  readonly
                  v-model="voltaje"
                  label="Voltaje"
              ></v-text-field>
            </v-col>
          </v-form>
        </v-col>
      </v-row>
      <v-divider></v-divider>
      <h4 class="my-2 px-4">Cambiar la configuración actual.</h4>
      <v-divider></v-divider>
      <v-card-text>
        <v-form>
            <v-row align="center">
                <v-col cols="8">
                    <v-input
                        :messages="['Comprueba la temperatura periódicamente y modifica la potencia del ventilador en función de esta']"
                    >
                        Control automático
                    </v-input>
                </v-col>
                <v-col cols="4" class="d-flex justify-end" >
                    <v-switch v-model="modo_automatico" flat inset></v-switch>
                </v-col>
            </v-row>
            <v-row class="my-6">
              <v-slider
                v-model="nuevo_porcentaje"
                track-color="grey"
                always-dirty
                min="0"
                max="100"
                thumb-label="always"
                @change="save()"
                v-if="!modo_automatico"
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
            </v-row>
            <v-row v-bind:class="{ 'd-none': !modo_automatico }">
              <v-col cols="12" sm="6">
                  <v-text-field
                      v-model="nuevo_max_p"
                      label="Potencia máxima:"
                      hint = "expresada en porcentaje"
                      persistent-hint
                      required
                  ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                  <v-text-field
                      v-model="nuevo_min_p"
                      label="Potencia mínima:"
                      hint = "expresada en porcentaje"
                      persistent-hint
                      required
                  ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                  <v-text-field
                      v-model="nuevo_max_t"
                      label="Temperatura máxima:"
                      hint = "expresada en celsius"
                      persistent-hint
                      required
                  ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                  <v-text-field
                      v-model="nuevo_min_t"
                      label="Temperatura mínima:"
                      hint = "expresada en celsius"
                      persistent-hint
                      required
                  ></v-text-field>
              </v-col>
              <v-col cols="12" class="d-flex justify-end px-4">
                <v-btn large color="primary" v-on:click="save()">Guardar</v-btn>
              </v-col>
            </v-row>
        </v-form>
      </v-card-text>
    </v-col>
  </v-row>
</template>
<script>
import Chart from 'chart.js';

export default {
  name: 'Adj_Fan',
  data: () => ({
      temperatura: 0,
      potencia: 0,
      voltaje: 0,
      loading: true,
      modo_automatico: true,
      nuevo_max_t: 0,
      nuevo_min_t: 0,
      nuevo_min_p: 0,
      nuevo_max_p: 0,
      nuevo_porcentaje: 0,
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
            text: 'Potencia ventilador'
          },
          legend:{
            display: false
          },
          responsive: true,
          scales: {
            xAxes: [{
              scaleLabel: {
                display: true,
                labelString: "Grados ºC"
              }
            }],
            yAxes: [{
              ticks: {
                beginAtZero: true,
                padding: 25,
              },
              scaleLabel: {
                display: true,
                labelString: "Potencia %"
              }
            }]
          }
        }
      });
    },
    request()
    {
      var self = this;
      this.$http.get('fansettings').then(function(response)
      {

        self.modo_automatico = response.body["enabled"];
        self.temperatura = response.body["curr_temp"] + "ºC";
        self.potencia = Math.round(response.body["curr_pwm"] * 100 / 1024 ) + "%";
        self.voltaje = parseFloat(response.body["fan_voltaje"]).toFixed(2) + "V";
        self.nuevo_porcentaje = response.body["curr_pwm"] * 100 / 1024;

        self.nuevo_max_t = response.body["max_temp"];
        self.nuevo_min_t = response.body["min_temp"];
        self.nuevo_max_p = Math.round(response.body["max_pwm"] * 100 / 1024 );
        self.nuevo_min_p = Math.round(response.body["min_pwm"] * 100 / 1024 );

        var obj = {
          type: 'line',
          data: {
            labels: [],
            datasets: [
              { // one line graph
                data: [],
                lineTension: 0,  
                borderWidth: 3,
                borderColor: [
                  '#47b784',
                ],
              }
            ]
          },
        }

        var valor_minimo = response.body["min_temp"] - 10;
        var valor_maximo = response.body["max_temp"] + 10;
        for (var i = valor_minimo; i <= valor_maximo; i++)
        {
          obj.data.labels.push(i);
          var value = 0;
          if (response.body["enabled"])
          {
            if (i < response.body["min_temp"])
            {
              value = response.body["min_pwm"] * 100 / 1024 ;
            }
            else if ( i >= response.body["min_temp"] && i < response.body["max_temp"])
            {
              var rango = response.body["max_temp"] - response.body["min_temp"];
              var porcentaje = (i-response.body["min_temp"]) * 100 / rango / 100;

              var v = response.body["min_pwm"] + (response.body["max_pwm"] - response.body["min_pwm"]) * porcentaje;
              value = v * 100 / 1024 ;
            }
            else
            {
              value = response.body["max_pwm"] * 100 / 1024 ;
            }
          }
          else
          {
            value = response.body["curr_pwm"] * 100 / 1024;
          }
          obj.data.datasets[0].data.push(value);
        }

        this.createChart('fan-chart', obj);
        self.loading = false;

      }, function(){
          self.error = true;
          self.loading = false;
      });
    },
    save()
    {
      var self = this;

      var obj = {}
      if (self.modo_automatico)
      {
        obj = {
          enabled: self.modo_automatico,
          min_temp: self.nuevo_min_t,
          max_temp: self.nuevo_max_t,
          min_pwm: Math.round(1024 * self.nuevo_min_p / 100),
          max_pwm: Math.round(1024 * self.nuevo_max_p / 100)
        }
      }
      else
      {
        obj = {
          enabled: self.modo_automatico,
          curr_pwm: Math.round(1024 * self.nuevo_porcentaje / 100)
        }
      }

      this.$http.post('fansettings', obj).then(function( /* response */)
      {
        self.request();
      }, function(){
          self.error = true;
          self.loading = false;
      });

    }
  },
  created: function(){
    this.request();
  }
}
</script>
