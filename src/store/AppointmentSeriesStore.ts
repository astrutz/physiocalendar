import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import axios from 'axios';
import AppointmentSeries from '@/class/AppointmentSeries';
import { JSONAppointmentSeriesDTO } from '@/class/JSONStructures';
import store from './index';
import { convertToAppointmentSeries, convertToAppointmentSeriesDTO } from './convert';

@Module({ name: 'AppointmentSeriesStore', dynamic: true, store })
class AppointmentSeriesStore extends VuexModule {
  public appointmentSeries: AppointmentSeries[] = [];

  @Action
  public async loadAppointmentSeries(): Promise<void> {
    try {
      const responseData: JSONAppointmentSeriesDTO[] = (await axios.get('http://localhost:8080/api/appointmentseries')).data;
      const appointmentSeries = responseData.map((dto) => convertToAppointmentSeries(dto));
      this.context.commit('setAppointmentSeries', appointmentSeries);
    } catch (err) {
      console.error(err);
    }
  }

  @Action
  public async addAppointmentSeries(appointmentSeries: AppointmentSeries): Promise<void> {
    try {
      const appointmentSeriesDTO = convertToAppointmentSeriesDTO(appointmentSeries);
      await axios.post('http://localhost:8080/api/appointmentseries', appointmentSeriesDTO);
      this.loadAppointmentSeries();
    } catch (err) {
      console.error(err);
    }
  }

  @Action
  public async updateAppointmentSeries({ id, appointmentSeries }: { id: number, appointmentSeries: AppointmentSeries }): Promise<void> {
    try {
      const appointmentSeriesDTO = convertToAppointmentSeriesDTO(appointmentSeries);
      await axios.put(`http://localhost:8080/api/appointmentseries/${id}`, appointmentSeriesDTO);
      this.loadAppointmentSeries();
    } catch (err) {
      console.error(err);
    }
  }

  @Action
  public async deleteAppointmentSeries(id: number): Promise<void> {
    try {
      await axios.delete(`http://localhost:8080/api/appointmentseries/${id}`);
      this.loadAppointmentSeries();
    } catch (err) {
      console.error(err);
    }
  }

  @Mutation
  public setAppointmentSeries(appointmentSeries: AppointmentSeries[]): void {
    this.appointmentSeries = appointmentSeries;
  }

  get getAllAppointmentSeries(): AppointmentSeries[] {
    return this.appointmentSeries;
  }
}

export default AppointmentSeriesStore;
