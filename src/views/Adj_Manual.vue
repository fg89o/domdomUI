<template>
  <v-row align="center" justify="center">
    <v-col cols="12" sm="10" lg="6">
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
      <v-form v-if="!loading" class="mx-4">
        <v-row align="center">
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
          <v-col cols="12" class="d-flex justify-end">
            <v-btn large text color="primary" v-on:click="request()">Actualizar</v-btn>
          </v-col>
          <v-col cols="12" v-for="(canal, i) in canales" :key="i">
            <v-card>
              <v-toolbar flat >
                <v-toolbar-title>
                  <span class="subheading">{{'Canal ' + (i+1)}}</span>
                </v-toolbar-title>
                <v-spacer></v-spacer>
              </v-toolbar>
              <v-card-text>
                <v-slider
                  v-model="canal.nuevo_porcentaje"
                  track-color="grey"
                  always-dirty
                  min="0"
                  max="100"
                  thumb-label="always"
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
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
    </v-form>
    </v-col>
  </v-row>
</template>
<script>
export default {
  name: 'Adj_Manual',
  data: () => ({
      canales: [{},{}],
      modo_manual: false,
      loading: true
    }),
  methods: {
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

      this.$http.post('adjCanal', obj).then(function(/* response */)
      {
        self.success = true;
        setTimeout(()=>{
          self.success = false;
        }, 5000);
      }, function(){
          self.error = true;
          self.loading = false;
      });
    },
    request()
    {
      var self = this;
      this.$http.get('adjCanal').then(function(response)
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

        self.loading = false;

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
