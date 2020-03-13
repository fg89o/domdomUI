<template>
    <v-row align="center" justify="center">
        <v-col cols="12" sm="10" lg="8">
            <v-card flat>
                <v-toolbar flat>
                    <v-toolbar-title>Configuracion de red</v-toolbar-title>
                    <v-spacer></v-spacer>
                </v-toolbar>
                <v-divider></v-divider>
                <v-card-text>
                    <v-alert
                        outlined
                        type="warning"
                        text
                        transition="scale-transition"
                    >
                    Puede que pierda el acceso al equipo al modificar alguno de los siguientes parametros. Debe reinicar el equipo para que los cambios surtán efecto.
                    </v-alert>
                    <v-alert
                        outlined
                        type="success"
                        text
                        transition="scale-transition"
                        :value="success"
                        dismissible
                        v-model="success"
                    >
                    Cambios realizados correctamente!
                    </v-alert>
                    <v-alert
                        outlined
                        type="error"
                        text
                        transition="scale-transition"
                        :value="error"
                        dismissible
                        v-model="error"
                    >
                    Error al guardar los datos. No se recibió respuesta.
                    </v-alert>
                    <v-form>
                        <v-row align="center">
                            <v-col cols="8">
                                <v-input
                                    :messages="['Intenta la conexión con un SSID existente']"
                                    dense
                                >
                                    Habilitar conexión WiFi
                                </v-input>
                            </v-col>
                            <v-col cols="4" class="text-right" >
                                <v-spacer></v-spacer>
                                <v-switch v-model="wifiEnabled" flat inset dense></v-switch>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12">
                                <v-text-field
                                    v-model="ssid"
                                    :counter="32"
                                    label="SSID"
                                    hint = "Red wifi a la que se intentará la conexión"
                                    persistent-hint
                                    required
                                ></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field
                                    v-model="pwd"
                                    label="Password"
                                    persistent-hint
                                    required
                                    :counter="64"
                                ></v-text-field>
                            </v-col>
                        </v-row>
                    </v-form>
                    <v-divider></v-divider>
                    <v-form>
                        <v-row align="center">
                            <v-col cols="8">
                                <v-input
                                    :messages="['Permite acceder al equipo utilizando el nombre .local']"
                                    dense
                                >
                                    Habilitar servicio mDNS
                                </v-input>
                            </v-col>
                            <v-col cols="4" class="text-right" >
                                <v-spacer></v-spacer>
                                <v-switch v-model="mDNSEnabled" flat inset dense></v-switch>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12">
                                <v-text-field
                                    v-model="mDNSHostname"
                                    :counter="32"
                                    label="Nombre de host"
                                    hint = "Nombre para el servicio mDNS sin el sufijo .local"
                                    persistent-hint
                                    required
                                ></v-text-field>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn large color="primary" v-on:click="save()">Guardar</v-btn>
                </v-card-actions>
            </v-card>
        </v-col>
    </v-row>
</template>

<script>
export default {
  name: 'Config_Red',
  data: () => ({
      success: false,
      error: false,
      mDNSEnabled: false,
      mDNSHostname: '',
      ssid: '',
      pwd: '',
      wifiEnabled: false
    }),
    methods: {
        getInfo()
        {
            var self = this;

            self.error = false;
            self.success = false;

            this.$http.get('red').then(function(response){
                console.log(response.body);
                self.mDNSEnabled = response.body["mdns_enabled"];
                self.mDNSHostname = response.body["mdns_hostname"];
                self.wifiEnabled = response.body["sta_enabled"];
                if (self.wifiEnabled)
                {
                    self.ssid = response.body["ssid"];
                }
            }, function(){

                self.error = true;
            });
        }
    },
    created: function(){
        this.getInfo();
    }
}
</script>
