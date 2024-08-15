import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import axios from 'axios';
import AppointmentSeries from '@/class/AppointmentSeries';
import { JSONAppointmentSeriesDTO } from '@/class/JSONStructures';
import store from './index';
import { convertToAppointmentSeries, convertToAppointmentSeriesDTO } from './convert';
import { Time } from '@/class/Enums';

@Module({ name: 'AppointmentSeriesStore', dynamic: true, store })
class AppointmentSeriesStore extends VuexModule {
  public seriesAppointments: AppointmentSeries[] = [];

  @Action
  public async loadAppointmentSeriess(params?: { date?: string; therapistId?: number; patientId?: number }): Promise<void> {
    try {
      const queryString = params ? this.buildQueryString(params) : '';
      const responseData: JSONAppointmentSeriesDTO[] = (await axios.get(`http://localhost:8080/api/seriesAppointments${queryString}`)).data;
      const seriesAppointments = responseData.map(dto => convertToAppointmentSeries(dto));
      this.context.commit('setAppointmentSeriess', seriesAppointments);
    } catch (err) {
      console.error(err);
    }
  }

  @Action
  public async addAppointmentSeries(appointment: AppointmentSeries): Promise<void> {
    try {
      const appointmentDTO = convertToAppointmentSeriesDTO(appointment);
      await axios.post('http://localhost:8080/api/seriesAppointments', appointmentDTO);
      this.loadAppointmentSeriess({ date: appointment.startDate.toISOString().split('T')[0] });
    } catch (err) {
      console.error(err);
    }
  }

  @Action
  public async updateAppointmentSeries({ id, appointment }: { id: number; appointment: AppointmentSeries }): Promise<void> {
    try {
      const appointmentDTO = convertToAppointmentSeriesDTO(appointment);
      await axios.put(`http://localhost:8080/api/seriesAppointments/${id}`, appointmentDTO);
      this.loadAppointmentSeriess({ date: appointment.startDate.toISOString().split('T')[0] });
    } catch (err) {
      console.error(err);
    }
  }

  @Action
  public async deleteAppointmentSeries(id: number): Promise<void> {
    try {
      const appointmentToDelete = this.getAppointmentSeriesById(id);
      await axios.delete(`http://localhost:8080/api/seriesAppointments/${id}`);
      this.loadAppointmentSeriess({ date: appointmentToDelete?.startDate.toISOString().split('T')[0] });
    } catch (err) {
      console.error(err);
    }
  }

  @Mutation
  public setAppointmentSeriess(appointments: AppointmentSeries[]): void {
    this.seriesAppointments = appointments;
  }

  get getAllAppointmentSeriess(): AppointmentSeries[] {
    return this.seriesAppointments;
  }

  get getAppointmentSeriesById(): (id: number) => AppointmentSeries | undefined {
    return (id: number) => {
      return this.seriesAppointments.find(appointment => appointment.id === id);
    };
  }

  get getAppointmentSeriessForPatient(): (patientId: number) => AppointmentSeries[] {
    return (patientId: number) => {
      return this.seriesAppointments.filter(appointment => appointment.patientId === patientId);
    };
  }

  get getAppointmentSeriessForTherapist(): (therapistId: number, date: string) => AppointmentSeries[] {
    return (therapistId: number, date: string) => {
      return this.seriesAppointments.filter(
        appointment => appointment.therapistId === therapistId && appointment.startDate.toISOString().split('T')[0] <= date && appointment.endDate.toISOString().split('T')[0] >= date
      );
    };
  }

  private buildQueryString(params: { date?: string; therapistId?: number; patientId?: number }): string {
    const queryParts: string[] = [];

    if (params.date) {
      queryParts.push(`date=${encodeURIComponent(params.date)}`);
    }

    if (params.therapistId !== undefined) {
      queryParts.push(`therapistId=${encodeURIComponent(params.therapistId)}`);
    }

    if (params.patientId !== undefined) {
      queryParts.push(`patientId=${encodeURIComponent(params.patientId)}`);
    }

    return queryParts.length ? `?${queryParts.join('&')}` : '';
  }
}

export default AppointmentSeriesStore;
