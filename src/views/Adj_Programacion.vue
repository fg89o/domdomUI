<template>
<v-container style="max-width: 100%">
  <v-row dark style="background-color: rgb(51,51,51); margin-top: -12px; padding-bottom: 60px">
    <v-col cols="12"
    >
      <h3 dark style="color: white">PROGRAMACIÓN</h3>
    </v-col>
  </v-row>
  <v-row align="center" justify="center" >
    <v-col cols="12" md="10" lg="10"
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
      <p class="my-4 px-4 text-uppercase font-weight-light overline">Ajuste > Programación</p>
      <v-divider></v-divider>
      <h4 class="my-2 px-4">Ajuste de la programación</h4>
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
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-data-table
            :headers="headers"
            :items="items"
          >
          <template v-slot:top>
            <v-toolbar flat color="white">
              <v-toolbar-title>Programación</v-toolbar-title>
              <v-divider
                class="mx-4"
                inset
                vertical
              ></v-divider>
              <v-spacer></v-spacer>
              <v-dialog v-model="dialog" max-width="500px">
                <template v-slot:activator="{ on }">
                  <v-btn color="primary" dark class="mb-2" v-on="on">Añadir</v-btn>
                </template>
                <v-card>
                  <v-card-title>
                    <span class="headline">{{ formTitle }}</span>
                  </v-card-title>
      
                  <v-card-text>
                    <v-container>
                      <v-row>
                        <v-col cols="12" sm="6" md="4">
                          <v-text-field v-model="editedItem.name" label="Dessert name"></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="4">
                          <v-text-field v-model="editedItem.calories" label="Calories"></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="4">
                          <v-text-field v-model="editedItem.fat" label="Fat (g)"></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="4">
                          <v-text-field v-model="editedItem.carbs" label="Carbs (g)"></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="4">
                          <v-text-field v-model="editedItem.protein" label="Protein (g)"></v-text-field>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-card-text>
      
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
                    <v-btn color="blue darken-1" text @click="save">Save</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-toolbar>
          </template>
            <template v-slot:item.actions="{ item }">
              <v-icon
                small
                class="mr-2"
                @click="editItem(item)"
                color="primary"
              >
                mdi-pencil
              </v-icon>
              <v-icon
                small
                @click="deleteItem(item)"
                color="error"
              >
                mdi-delete
              </v-icon>
            </template>
            <template v-slot:item.fade="{ item }">
              <v-simple-checkbox v-model="item.fade"></v-simple-checkbox>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</v-container>
</template>
<script>
// import Chart from "chart.js";

export default {
  name: 'Adj_Programacion',
  data: () => ({
    loading: true,
    headers: [],
    items: [],
    dialog: false,
    editedIndex: -1,
    editedItem: {
      name: '',
      calories: 0,
      fat: 0,
      carbs: 0,
      protein: 0,
    },
  }),
  computed: {
    formTitle () {
      return this.editedIndex === -1 ? 'Nuevo' : 'Editar'
    },
  },

  watch: {
    dialog (val) {
      val || this.close()
    },
  },

  methods: {
    request(){
      var self = this;
      
      this.$http.get(this.$remoteServer + 'schedule').then(function(response)
      {
        console.log(response.body);

        self.items = [];
        self.headers = [];

        self.headers.push({ text: 'Nº', value: 'id' });
        self.headers.push({
            text: 'Fecha / Hora',
            align: 'start',
            sortable: false,
            value: 'fechaHora',
        }),
        self.headers.push({ text: 'Progresivo', value: 'fade', sortable: false });
        var i;
        for ( i = 0; i < response.body["channel_size"]; i++)
        {
          self.headers.push({ text: '#' + (i+1), value: 'canal'  + (i+1), sortable: false});
        }
        self.headers.push({ text: 'Acciones', value: 'actions', sortable: false });

        for( i = 0; i < response.body["schedule"].length; i++)
        {
          var obj = {
            id: (i+1),
            fechaHora: response.body["schedule"][i].hour + ":" + response.body["schedule"][i].minute,
            fade: response.body["schedule"][i].fade,
          }

          for (var j = 0; j < response.body["schedule"][i].values.length; j++)
          {
            obj["canal"+(j+1)] = response.body["schedule"][i].values[j];
          }

          self.items.push(obj);
        }

        console.log(self.items);
        self.loading = false;

      }, function(){
          self.error = true;
          self.loading = false;
      });
    },

    deleteItem (item) {
      const index = this.items.indexOf(item)
      confirm('¿Seguro que desea eliminar este elemento?') && this.items.splice(index, 1)
    },

    close () {
      this.dialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      }, 300)
    },
  }, 
  created: function(){
    this.request();
  }
}
</script>
