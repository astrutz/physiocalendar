import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import axios from 'axios';
import Absence from '@/class/Absence';
import { JSONAbsenceDTO } from '@/class/JSONStructures';
import store from './index';
import { convertToAbsence, convertToAbsenceDTO } from './convert';

@Module({ name: 'AbsenceStore', dynamic: true, store })
class AbsenceStore extends VuexModule {
  public absences: Absence[] = [];

  @Action
  public async loadAbsences(therapistId: number): Promise<void> {
    try {
      const responseData: JSONAbsenceDTO[] = (await axios.get(`http://localhost:8080/api/therapists/${therapistId}/absences`)).data;
      const absences = responseData.map((dto) => convertToAbsence(dto));
      this.context.commit('setAbsences', absences);
    } catch (err) {
      console.error(err);
    }
  }

  @Action
  public async addAbsence(therapistId: number, absence: Absence ): Promise<void> {
    try {
      const absenceDTO = convertToAbsenceDTO(absence);
      await axios.post(`http://localhost:8080/api/therapists/${therapistId}/absences`, absenceDTO);
      this.loadAbsences(therapistId);
    } catch (err) {
      console.error(err);
    }
  }

  @Action
  public async updateAbsence(therapistId: number, absence: Absence ): Promise<void> {
    try {
      const absenceDTO = convertToAbsenceDTO(absence);
      await axios.put(`http://localhost:8080/api/therapists/${therapistId}/absences/${absence.id}`, absenceDTO);
      this.loadAbsences(therapistId);
    } catch (err) {
      console.error(err);
    }
  }

  @Action
  public async deleteAbsence(therapistId: number, absenceId: number ): Promise<void> {
    try {
      await axios.delete(`http://localhost:8080/api/therapists/${therapistId}/absences/${absenceId}`);
      this.loadAbsences(therapistId);
    } catch (err) {
      console.error(err);
    }
  }

  @Mutation
  public setAbsences(absences: Absence[]): void {
    this.absences = absences;
  }

  get getAllAbsences(): Absence[] {
    return this.absences;
  }
}

export default AbsenceStore;
