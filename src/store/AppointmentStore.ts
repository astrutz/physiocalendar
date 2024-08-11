import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import axios from 'axios';
import SingleAppointment from '@/class/SingleAppointment';
import { JSONSingleAppointmentDTO } from '@/class/JSONStructures';
import store from './index';
import { convertToAppointment, convertToAppointmentDTO } from './convert';

@Module({ name: 'AppointmentStore', dynamic: true, store })
class AppointmentStore extends VuexModule {
  public appointments: SingleAppointment[] = [];

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
  public async deleteAppointment(id: number): Promise<void> {
    try {
      await axios.delete(`http://localhost:8080/api/appointments/${id}`);
      this.loadAppointments();
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
}

export default AppointmentStore;
