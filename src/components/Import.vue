<template>
  <v-card>
    <v-card-title class="text-h5"> Backup einspielen </v-card-title>

    <v-card-text>
      <div class="v-row">Bitte wählen Sie eine Backup-Datei aus.</div>
      <div class="v-row">
        <input type="file" @change="fileChanged" ref="fileUpload" /> <br />
      </div>
      <div class="v-row">
        <v-alert class="mt-4" type="warning">
          Achtung: Durch das Einspielen eines Backups werden alle gespeicherten
          Termine in der Stamm- und Terminliste überschrieben.
        </v-alert>
      </div>
    </v-card-text>

    <v-card-actions>
      <v-btn color="error" text @click="$emit('dialogClosed')">
        Abbrechen
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn
        :disabled="backupFile === 1 || backupFile === undefined"
        color="primary"
        button
        @click="uploadFile"
      >
        Bestätigen
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">

import { Component, Vue } from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import Store from '../store/backup';

@Component
export default class Import extends Vue {
  $refs!: {
    fileUpload: HTMLInputElement
  }

  store = getModule(Store);

  backupFile: File | number | undefined = 1;

  fileChanged(): void {
    if (this.$refs?.fileUpload?.files && this.$refs?.fileUpload?.files.length > 0) {
      this.backupFile = this.$refs?.fileUpload?.files[0];
    } else {
      this.backupFile = undefined;
    }
  }

  async uploadFile(): Promise<void> {
    if (typeof this.backupFile !== 'number' && this.backupFile !== undefined) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileContent = e?.target?.result as string;
        await this.store.saveBackup(fileContent);
        await this.store.loadBackup();
        this.$emit('dialogClosed');
      };
      reader.readAsBinaryString(this.backupFile);
    }
  }
}

</script>
