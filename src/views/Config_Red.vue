<template>
    <v-row align="center" justify="center">
        <v-col cols="12" sm="10" lg="8">
            <v-card flat>
                <v-toolbar flat>
                    <v-toolbar-title>Configuración actual</v-toolbar-title>
                    <v-spacer></v-spacer>
                </v-toolbar>
                <v-divider></v-divider>
                <v-card-text>
                    <v-form>
                        <v-row>
                            <v-col cols="12">
                                <v-text-field
                                    readonly
                                    v-model="current_ssid"
                                    label="SSID actual:"
                                    required
                                    filled
                                ></v-text-field>
                            </v-col>
                            <v-col cols="4">
                                <v-text-field
                                    readonly
                                    v-model="mode"
                                    label="Modo"
                                    required
                                    filled
                                ></v-text-field>
                            </v-col>
                            <v-col cols="4">
                                <v-text-field
                                    readonly
                                    v-model="current_canal"
                                    label="Canal"
                                    required
                                    filled
                                ></v-text-field>
                            </v-col>
                            <v-col cols="4">
                                <v-text-field
                                    readonly
                                    v-model="current_potencia"
                                    label="Potencia"
                                    required
                                    filled
                                ></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field
                                    readonly
                                    v-model="current_ip"
                                    label="IP local:"
                                    required
                                    filled
                                ></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field
                                    readonly
                                    v-model="current_gateway"
                                    label="Puerta de enlace:"
                                    required
                                    filled
                                ></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field
                                    readonly
                                    v-model="current_dns"
                                    label="DNS:"
                                    required
                                    filled
                                ></v-text-field>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                </v-card-actions>
            </v-card>
            <v-card flat>
                <v-toolbar flat>
                    <v-toolbar-title>Nueva configuracion</v-toolbar-title>
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
                                    v-show="wifiEnabled"
                                ></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field
                                    v-model="pwd"
                                    :append-icon="showPwd ? 'mdi-eye' : 'mdi-eye-off'"
                                    :type="showPwd ? 'text' : 'password'"
                                    class="input-group--focused"
                                    label="Password"
                                    persistent-hint
                                    required
                                    :counter="64"
                                    @click:append="showPwd = !showPwd"
                                    v-show="wifiEnabled"
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
                                    v-show="mDNSEnabled"
                                ></v-text-field>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn large color="primary" v-on:click="saveInfo()">Guardar</v-btn>
                </v-card-actions>
            </v-card>
        </v-col>
    </v-row>
</template>

<script>
export default {
  name: 'Config_Red',
  data: () => ({
      showPwd: false,
      success: false,
      error: false,
      mDNSEnabled: false,
      mDNSHostname: '',
      ssid: '',
      pwd: '',
      wifiEnabled: false,
      current_ssid: '',
      current_canal: '',
      current_potencia: '',
      current_dns: '',
      current_gateway: '',
      current_ip: '',
      mode: ''
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
                self.mode = response.body["mode"];
                self.wifiEnabled = response.body["sta_enabled"];
                
                self.current_ssid = response.body["ssid"];
                self.current_canal = response.body["current_channel"];
                self.current_potencia = response.body["rssi"];
                self.current_ip = response.body["current_ip"];
                self.current_gateway = response.body["current_gateway"];
                self.current_dns = response.body["current_dns"];
            }, function(){

                self.error = true;
            });
        },
        saveInfo()
        {
            var self = this;

            self.error = false;
            self.success = false;

            var obj = 
            {
                mdns_enabled: self.mDNSEnabled,
                mdns_hostname: self.mDNSHostname,
                sta_enabled: self.wifiEnabled,
                ssid: self.wifiEnabled ? self.ssid : "",
                pwd: self.wifiEnabled ? self.pwd : "",
            };

            this.$http.post('red', obj
            ).then(function(/* response */){ 
                console.log("Cambios gaurdados correctamente!");
                self.getInfo();
                self.success = true;
            }, function(){
                self.getInfo();
                self.error = true;
            });
        }
    },
    created: function(){
        this.getInfo();
    }
}
</script>
