import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import axios from 'axios';
import SingleAppointment from '@/class/SingleAppointment';
import { JSONSingleAppointmentDTO } from '@/class/JSONStructures';
import store from './index';
import { convertToAppointment, convertToAppointmentDTO } from './convert';
import { Time } from '@/class/Enums';

@Module({ name: 'AppointmentStore', dynamic: true, store })
class AppointmentStore extends VuexModule {
  public appointments: SingleAppointment[] = [];

  @Action
  public async loadAppointments(params?: { date?: string; therapistId?: number; patientId?: number }): Promise<void> {
    try {
      const queryString = params ? this.buildQueryString(params) : '';
      const responseData: JSONSingleAppointmentDTO[] = (await axios.get(`http://localhost:8080/api/appointments${queryString}`)).data;
      const appointments = responseData.map(dto => convertToAppointment(dto));
      this.context.commit('setAppointments', appointments);
    } catch (err) {
      console.error(err);
    }
  }

  @Action
  public async loadAppointmentsForDate(date: string): Promise<void> {
    try {
      await this.loadAppointments({ date });
    } catch (err) {
      console.error(err);
    }
  }

  @Action
  public async addAppointment(appointment: SingleAppointment): Promise<void> {
    try {
      const appointmentDTO = convertToAppointmentDTO(appointment);
      await axios.post('http://localhost:8080/api/appointments', appointmentDTO);
      this.loadAppointments({ date: appointment.date.toISOString() }); // Aktualisiert nur die relevanten Daten
    } catch (err) {
      console.error(err);
    }
  }

  @Action
  public async updateAppointment( id: number, appointment: SingleAppointment ): Promise<void> {
    try {
      const appointmentDTO = convertToAppointmentDTO(appointment);
      await axios.put(`http://localhost:8080/api/appointments/${id}`, appointmentDTO);
      this.loadAppointments({ date: appointment.date.toISOString() });
    } catch (err) {
      console.error(err);
    }
  }

  @Action
  public async deleteAppointment(id: number): Promise<void> {
    try {
      const appointmentToDelete = this.getAppointmentById(id);
      await axios.delete(`http://localhost:8080/api/appointments/${id}`);
      this.loadAppointments({ date: appointmentToDelete?.date.toISOString() });
    } catch (err) {
      console.error(err);
    }
  }

  @Mutation
  public setAppointments(appointments: SingleAppointment[]): void {
    this.appointments = appointments;
  }

  get getAllAppointments(): SingleAppointment[] {
    return this.appointments;
  }

  get getAppointmentById(): (id: number) => SingleAppointment | undefined {
    return (id: number) => {
      return this.appointments.find(appointment => appointment.id === id);
    };
  }

  get getAppointmentsForPatient(): (patientId: number) => SingleAppointment[] {
    return (patientId: number) => {
      return this.appointments.filter(appointment => appointment.patientId === patientId) || [];
    };
  }

  get getAppointmentsForTherapist(): (therapistId: number, date: Date) => SingleAppointment[] {
    return (therapistId: number, date: Date) => {
      return this.appointments.filter(
        appointment => appointment.therapistId === therapistId && appointment.date === date
      ) || [];
    };
  }

  get getAppointmentByTherapistAndTime(): (therapistId: number, date: Date, time: Date) => SingleAppointment | undefined {
    return (therapistId: number, date: Date, time: Date) => {
      return this.appointments.find(
        appointment => appointment.therapistId === therapistId && appointment.date === date && appointment.startTime === time
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

export default AppointmentStore;
