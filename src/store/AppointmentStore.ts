import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import axios from 'axios';
import SingleAppointment from '@/class/SingleAppointment';
import AppointmentSeries from '@/class/AppointmentSeries';
import { JSONSingleAppointmentDTO, JSONAppointmentSeriesDTO } from '@/class/JSONStructures';
import store from './index';
import { convertToAppointment, convertToAppointmentDTO, convertToAppointmentSeries, convertToAppointmentSeriesDTO, } from './convert';

@Module({ name: 'AppointmentStore', dynamic: true, store })
class AppointmentStore extends VuexModule {
  public appointments: SingleAppointment[] = [];
  public seriesAppointments: AppointmentSeries[] = [];

  @Action
  public async loadAppointments(): Promise<void> {
    try {
      const responseData: JSONSingleAppointmentDTO[] = (await axios.get('http://localhost:8080/api/appointments')).data;
      const appointments = responseData.map((dto) => convertToAppointment(dto));
      this.context.commit('setAppointments', appointments);
    } catch (err) {
      console.error(err);
    }
  }

  @Action
  public async loadSeriesAppointments(): Promise<void> {
    try {
      const responseData: JSONAppointmentSeriesDTO[] = (await axios.get('http://localhost:8080/api/seriesAppointments')).data;
      const seriesAppointments = responseData.map((dto) => convertToAppointmentSeries(dto));
      this.context.commit('setSeriesAppointments', seriesAppointments);
    } catch (err) {
      console.error(err);
    }
  }

  @Action
  public async addAppointment(appointment: SingleAppointment): Promise<void> {
    try {
      const appointmentDTO = convertToAppointmentDTO(appointment);
      await axios.post('http://localhost:8080/api/appointments', appointmentDTO);
      this.loadAppointments();
    } catch (err) {
      console.error(err);
    }
  }

  @Action
  public async addSeriesAppointment(appointment: AppointmentSeries): Promise<void> {
    try {
      const appointmentDTO = convertToAppointmentSeriesDTO(appointment);
      await axios.post('http://localhost:8080/api/seriesAppointments', appointmentDTO);
      this.loadSeriesAppointments();
    } catch (err) {
      console.error(err);
    }
  }

  @Action
  public async updateAppointment({ id, appointment }: { id: number, appointment: SingleAppointment }): Promise<void> {
    try {
      const appointmentDTO = convertToAppointmentDTO(appointment);
      await axios.put(`http://localhost:8080/api/appointments/${id}`, appointmentDTO);
      this.loadAppointments();
    } catch (err) {
      console.error(err);
    }
  }

  @Action
  public async updateSeriesAppointment({ id, appointment }: { id: number, appointment: AppointmentSeries }): Promise<void> {
    try {
      const appointmentDTO = convertToAppointmentSeriesDTO(appointment);
      await axios.put(`http://localhost:8080/api/seriesAppointments/${id}`, appointmentDTO);
      this.loadSeriesAppointments();
    } catch (err) {
      console.error(err);
    }
  }

  @Action
  public async deleteAppointment(id: number): Promise<void> {
    try {
      await axios.delete(`http://localhost:8080/api/appointments/${id}`);
      this.loadAppointments();
    } catch (err) {
      console.error(err);
    }
  }

  @Action
  public async deleteSeriesAppointment(id: number): Promise<void> {
    try {
      await axios.delete(`http://localhost:8080/api/seriesAppointments/${id}`);
      this.loadSeriesAppointments();
    } catch (err) {
      console.error(err);
    }
  }

  @Mutation
  public setAppointments(appointments: SingleAppointment[]): void {
    this.appointments = appointments;
  }

  @Mutation
  public setSeriesAppointments(appointments: AppointmentSeries[]): void {
    this.seriesAppointments = appointments;
  }

  get getAllAppointments(): SingleAppointment[] {
    return this.appointments;
  }

  get getAllSeriesAppointments(): AppointmentSeries[] {
    return this.seriesAppointments;
  }

  get getAppointmentById(): (id: number) => SingleAppointment | undefined {
    return (id: number) => {
      return this.appointments.find(appointment => appointment.id === id);
    };
  }

  get getAppointmentsForPatient(): (patientId: number) => SingleAppointment[] {
    return (patientId: number) => {
      return this.appointments.filter(appointment => appointment.patientId === patientId);
    };
  }
}

export default AppointmentStore;
