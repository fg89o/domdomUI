<template>
  <v-row align="center" justify="center">
    <v-col cols="12" sm="10" lg="6">
      <p class="my-4 px-4 text-uppercase font-weight-light overline">Ajuste > Ventilador</p>
      <v-divider></v-divider>
      <h4 class="my-2 px-4">Configuración del ventilador en base a la temperatura</h4>
      <v-divider></v-divider>
      <div v-if="loading">
        <v-skeleton-loader
          type="article"
          class="mx-auto"
      ></v-skeleton-loader>
      </div>
    </v-col>
  </v-row>
</template>
<script>
export default {
  name: 'Adj_Fan',
  data: () => ({
      loading: true
    }),
  methods: {
    request()
    {
      var self = this;
      this.$http.get('adjFan').then(function(response)
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
