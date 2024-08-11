import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import axios from 'axios';
import AbsenceException from '@/class/AbsenceException';
import { JSONAbsenceExceptionDTO } from '@/class/JSONStructures';
import store from './index';
import { convertToAbsenceException, convertToAbsenceExceptionDTO } from './convert';

@Module({ name: 'AbsenceExceptionStore', dynamic: true, store })
class AbsenceExceptionStore extends VuexModule {
  public absenceExceptions: AbsenceException[] = [];

  @Action
  public async loadAbsenceExceptions(therapistId: number): Promise<void> {
    try {
      const responseData: JSONAbsenceExceptionDTO[] = (await axios.get(`http://localhost:8080/api/therapists/${therapistId}/absenceexceptions`)).data;
      const absenceExceptions = responseData.map((dto) => convertToAbsenceException(dto));
      this.context.commit('setAbsenceExceptions', absenceExceptions);
    } catch (err) {
      console.error(err);
    }
  }

  @Action
  public async addAbsenceException({ therapistId, absenceException }: { therapistId: number, absenceException: AbsenceException }): Promise<void> {
    try {
      const absenceExceptionDTO = convertToAbsenceExceptionDTO(absenceException);
      await axios.post(`http://localhost:8080/api/therapists/${therapistId}/absenceexceptions`, absenceExceptionDTO);
      this.loadAbsenceExceptions(therapistId);
    } catch (err) {
      console.error(err);
    }
  }

  @Action
  public async updateAbsenceException({ therapistId, absenceException }: { therapistId: number, absenceException: AbsenceException }): Promise<void> {
    try {
      const absenceExceptionDTO = convertToAbsenceExceptionDTO(absenceException);
      await axios.put(`http://localhost:8080/api/therapists/${therapistId}/absenceexceptions/${absenceException.id}`, absenceExceptionDTO);
      this.loadAbsenceExceptions(therapistId);
    } catch (err) {
      console.error(err);
    }
  }

  @Action
  public async deleteAbsenceException({ therapistId, absenceExceptionId }: { therapistId: number, absenceExceptionId: number }): Promise<void> {
    try {
      await axios.delete(`http://localhost:8080/api/therapists/${therapistId}/absenceexceptions/${absenceExceptionId}`);
      this.loadAbsenceExceptions(therapistId);
    } catch (err) {
      console.error(err);
    }
  }

  @Mutation
  public setAbsenceExceptions(absenceExceptions: AbsenceException[]): void {
    this.absenceExceptions = absenceExceptions;
  }

  get getAllAbsenceExceptions(): AbsenceException[] {
    return this.absenceExceptions;
  }
}

export default AbsenceExceptionStore;
