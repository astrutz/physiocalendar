import axios from 'axios';
import { VuexModule, Module, Mutation, Action } from 'vuex-module-decorators';

import Backup from '../class/Backup';

@Module({ namespaced: true, name: 'storebackup' })
class StoreBackup extends VuexModule {
  public backup: Backup | null = null;

  @Action
  public async loadBackup(): Promise<void> {
    // TODO: GET HTTP JSON Data
    try {
      const responseData: object = (await axios.get('http://localhost:4000/backup')).data as object;
      console.log(responseData);
      this.context.commit('setBackup', null);
    } catch (err) {
      console.error(err);
      this.context.commit('setBackup', null);
    }
  }

  @Mutation
  public setBackup(newBackup: Backup): void {
    this.backup = newBackup;
  }
}
export default StoreBackup;
