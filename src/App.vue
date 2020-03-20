<template>
  <div id="app">
    <v-app>
        <v-navigation-drawer v-model="drawer" enable-resize-watcher app clipped>
          <v-list-item>
              <v-list-item-content>
                  <v-list-item-title class="title">
                  Menu principal
                  </v-list-item-title>
                  <v-list-item-subtitle>
                  v1.0
                  </v-list-item-subtitle>
              </v-list-item-content>
          </v-list-item>
  
          <v-divider></v-divider>
  
          <v-list nav dense >
            <v-list-item-group v-model="menu_items_active" color="primary">
            <div
            v-for="(header) in menu_items"
            :key="header.text"
            >
              <v-subheader v-text="header.text"></v-subheader>
              
                <v-list-item link 
                v-for="(item) in header.items"
                :key="item.link"
                :to="item.link"
                >
                  <v-list-item-icon>
                        <v-icon v-text="item.icon"></v-icon>
                    </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title v-text="item.title"></v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              
              <v-divider></v-divider>
            </div>
            </v-list-item-group>
          </v-list>
        </v-navigation-drawer>
        <v-app-bar app clipped-left color="blue darken-4" dense dark >
            <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      
            <v-toolbar-title>{{appTitle}}</v-toolbar-title>

            <v-spacer></v-spacer>
    
            <v-btn icon>
            <v-icon>mdi-wrench</v-icon>
            </v-btn>
        </v-app-bar>
      
        <!-- Sizes your content based upon application components -->
        <v-content>
          <router-view></router-view>
        </v-content>
      
        <v-footer app>
            <div>{{ datenow }}</div>
            <v-spacer></v-spacer>
            <div>DomDom &copy; 2020</div>
        </v-footer>
      </v-app>
  </div>
</template>

<script>

export default {
  name: 'App',

  data: () => ({
    drawer: false,
    date: null, 
    datenow: '',
    appTitle: 'DomDom',
    menu_items: [
        {
          text: 'GENERAL',
          items: [
            { title: 'Inicio', icon: 'mdi-view-dashboard', link: '/' },
            { title: 'Manual', icon: 'mdi-tune', link: '/manual' },
            { title: 'Ventilador', icon: 'mdi-fan', link: '/fan' },
          ]
        },
        {
          text: 'CONFIGURACION',
          items: [
            { title: 'Canales', icon: 'mdi-camera-iris', link: '/canales'},
            { title: 'Fecha y hora', icon: 'mdi-clock', link: '/fechaHora' },
            { title: 'Red / Wifi', icon: 'mdi-lan', link: '/red' },
            { title: 'Reset', icon: 'mdi-restart', link: '/reset' },
          ]
        },
    ],
    menu_items_active: '',
    right: null,
  }),

  methods: {
    time() {
        if (this.date != null)
        {
            var self = this
            this.date.setSeconds(this.date.getSeconds() + 1);

            var day = this.date.getDate().toString().padStart(2,"0");
            var month = (this.date.getMonth()+1).toString().padStart(2,"0");
            var year = this.date.getFullYear().toString();
            var hour = this.date.getHours().toString().padStart(2,"0");
            var minute = this.date.getMinutes().toString().padStart(2,"0");

            this.datenow = day + "/" + month + "/" + year + " " + hour + ":" + minute;
        }
        setTimeout(self.time, 1000)
    },
    requestTime(){
      var self = this;
      this.$http.get('rtc').then(function(response){
          self.date = new Date(parseInt(response.body["unixtime"])*1000);
          self.time();
      }, function(){
          console.error("Error al recibir rtc!");
      });
    },
  },
  created: function(){
    this.requestTime();
    setInterval(this.requestTime, 60000);
  },
};
</script>
