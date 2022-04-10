import AppointmentSeries from '@/class/AppointmentSeries';
import { JSONBackup } from '@/class/JSONStructures';
import SingleAppointment from '@/class/SingleAppointment';
import axios from 'axios';
import {
  Action, Module, Mutation, VuexModule,
} from 'vuex-module-decorators';
import Backup from '../class/Backup';
import convertToBackup from './convertToBackup';
import convertToJSON from './convertToJSON';
import store from './index';

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
  public async saveBackup(importedBackup? : string): Promise<void> {
    if (this.backup) {
      try {
        const backupJSON = importedBackup ? JSON.parse(importedBackup) : convertToJSON(this.backup);
        await axios.put('http://localhost:4000/backup', backupJSON);
      } catch (err) {
        console.error(err);
      }
    }
  }

  @Action
  public addSingleAppointment(appointment: SingleAppointment): void {
    if (this.getBackup) {
      const localBackup = { ...this.getBackup };
      localBackup.daylist.addAppointment(appointment);
      this.setBackup(localBackup);
      this.saveBackup();
    }
  }

  @Action
  public changeSingleAppointment(appointment: SingleAppointment): void {
    if (this.getBackup) {
      const localBackup = { ...this.getBackup };
      localBackup.daylist.changeAppointment(appointment);
      this.setBackup(localBackup);
      this.saveBackup();
    }
  }

  @Action
  public deleteSingleAppointment(appointment: SingleAppointment): void {
    if (this.getBackup) {
      const localBackup = { ...this.getBackup };
      localBackup.daylist.deleteAppointment(appointment);
      this.setBackup(localBackup);
      this.saveBackup();
    }
  }

  @Action
  public addAppointmentSeries(appointment: AppointmentSeries): void {
    if (this.getBackup) {
      const localBackup = { ...this.getBackup };
      localBackup.masterlist.addAppointment(appointment);
      this.setBackup(localBackup);
      this.saveBackup();
    }
  }

  @Action
  public changeAppointmentSeries(appointment: AppointmentSeries): void {
    if (this.getBackup) {
      const localBackup = { ...this.getBackup };
      localBackup.masterlist.changeAppointment(appointment);
      this.setBackup(localBackup);
      this.saveBackup();
    }
  }

  @Action
  public deleteAppointmentSeries(appointment: AppointmentSeries): void {
    if (this.getBackup) {
      const localBackup = { ...this.getBackup };
      localBackup.masterlist.deleteAppointment(appointment);
      this.setBackup(localBackup);
      this.saveBackup();
    }
  }

  @Mutation
  public setBackup(newBackup?: Backup): void {
    if (newBackup) {
      this.backup = newBackup;
    } else {
      this.loadBackup();
    }
  }

  get getBackup(): Backup | null {
    return this.backup;
  }
}

export default StoreBackup;
