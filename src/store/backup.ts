import axios from 'axios';
import {
  VuexModule, Module, Mutation, Action,
} from 'vuex-module-decorators';

import { JSONBackup } from '@/class/JSONBackup';
import store from './index';
import Backup from '../class/Backup';
import convertToBackup from './convert';

@Module({ name: 'StoreBackup', dynamic: true, store })
class StoreBackup extends VuexModule {
  public backup: Backup | null = null;

  @Action
  public async loadBackup(): Promise<void> {
    try {
      const responseData: JSONBackup = (await axios.get('http://localhost:4000/backup')).data as JSONBackup;
      const backup = convertToBackup(responseData);
      this.context.commit('setBackup', backup);
    } catch (err) {
      console.error(err);
      this.context.commit('setBackup', null);
    }
  }

  @Mutation
  public setBackup(newBackup: Backup): void {
    this.backup = newBackup;
  }

  get getBackup() : Backup | null {
    return this.backup;
  }
}
export default StoreBackup;
