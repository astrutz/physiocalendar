import axios from 'axios';
import {
  VuexModule, Module, Mutation, Action,
} from 'vuex-module-decorators';

import { JSONBackup } from '@/class/JSONBackup';
import SingleAppointment from '@/class/SingleAppointment';
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

  @Action
  public addSingleAppointment(appointment: SingleAppointment): void {
    if (this.getBackup) {
      const localBackup = { ...this.getBackup };
      localBackup.daylist.addAppointment(appointment);
      this.setBackup(localBackup);
      // TODO: Save changes in backend
    }
  }

  @Action
  public changeSingleAppointment(appointment: SingleAppointment): void {
    if (this.getBackup) {
      const localBackup = { ...this.getBackup };
      localBackup.daylist.changeAppointment(appointment);
      this.setBackup(localBackup);
      // TODO: Save changes in backend
    }
  }

  @Action
  public addAppointmentSeries(): void {
    if (this.backup) {
      // TODO: Add Appointment to Masterlist
    }
  }

  @Mutation
  public setBackup(newBackup: Backup): void {
    this.backup = newBackup;
  }

  get getBackup(): Backup | null {
    return this.backup;
  }
}

export default StoreBackup;
