import Absence from '@/class/Absence';
import AppointmentSeries from '@/class/AppointmentSeries';
import { Weekday } from '@/class/Enums';
import { JSONBackup } from '@/class/JSONStructures';
import SingleAppointment from '@/class/SingleAppointment';
import Therapist from '@/class/Therapist';
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
  public async saveBackup(importedBackup?: string): Promise<void> {
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

  @Action
  public addTherapist({ name, id }: { name: string, id: string }): void {
    if (this.getBackup) {
      const localBackup = { ...this.getBackup };
      localBackup.therapists.push(new Therapist(name, id, new Date(), new Date(3471292800000), []));
      this.setBackup(localBackup);
      this.saveBackup();
    }
  }

  @Action
  public removeTherapist(id: string): void {
    if (this.getBackup) {
      const localBackup = { ...this.getBackup };
      localBackup.therapists = localBackup.therapists.filter((therapist) => therapist.id !== id);
      this.setBackup(localBackup);
      this.saveBackup();
    }
  }

  @Action
  public renameTherapist({ name, id }: { name: string, id: string }): void {
    if (this.getBackup) {
      const localBackup = { ...this.getBackup };
      const foundTherapist = localBackup.therapists.find((therapist) => therapist.id === id);
      if (foundTherapist) {
        localBackup.therapists[localBackup.therapists.indexOf(foundTherapist)].name = name;
        this.setBackup(localBackup);
        this.saveBackup();
      }
    }
  }

  // --------------------------------------------

  // TODO: Set absences into therapist array and then search there for every one with day
  @Action
  public clearAbsencesForTherapistForDay(therapistID : string, day: string | Weekday) : void {
    if (this.getBackup) {
      const localBackup = { ...this.getBackup };
      const foundTherapist = localBackup.therapists.find((therapist) => therapist.id === therapistID);
      if (foundTherapist) {
        // TODO: Change his absences
        localBackup.therapists[localBackup.therapists.indexOf(foundTherapist)].name = name;
      } else {

      }
    }
  }

  @Action
  public setAbsence(absence : Absence) : void {
    if (this.getBackup) {
      const localBackup = { ...this.getBackup };
      const foundAbsence = localBackup.absences.find((abs) => abs.day === absence.day && abs.therapist);
      if (foundAbsence) {
        // TODO: Change them
      } else {
        localBackup.absences.push(absence);
      }
    }
  }

  // --------------------------------------------

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
