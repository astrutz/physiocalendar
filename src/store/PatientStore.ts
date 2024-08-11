import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import axios from 'axios';
import Patient from '@/class/Patient';
import { JSONPatientDTO } from '@/class/JSONStructures';
import store from './index';
import { convertToPatient, convertToPatientDTO } from './convert';

@Module({ name: 'PatientStore', dynamic: true, store })
class PatientStore extends VuexModule {
  public patients: Patient[] = [];

  @Action
  public async loadPatients(): Promise<void> {
    try {
      const responseData: JSONPatientDTO[] = (await axios.get('http://localhost:8080/api/patients')).data;
      const patients = responseData.map((dto) => convertToPatient(dto));
      this.context.commit('setPatients', patients);
    } catch (err) {
      console.error(err);
    }
  }

  @Action
  public findPatientsByName(searchQuery: string): Patient[] {
    const queryLower = searchQuery.toLowerCase();
    return this.patients.filter(
      (patient) =>
        patient.firstName.toLowerCase().includes(queryLower) ||
        patient.lastName.toLowerCase().includes(queryLower)
    );
  }

  @Action
  public async addPatient(patient: Patient): Promise<void> {
    try {
      const patientDTO = convertToPatientDTO(patient);
      await axios.post('http://localhost:8080/api/patients', patientDTO);
      this.loadPatients();
    } catch (err) {
      console.error(err);
    }
  }

  @Action
  public async updatePatient({ id, patient }: { id: number, patient: Patient }): Promise<void> {
    try {
      const patientDTO = convertToPatientDTO(patient);
      await axios.put(`http://localhost:8080/api/patients/${id}`, patientDTO);
      this.loadPatients();
    } catch (err) {
      console.error(err);
    }
  }

  @Action
  public async deletePatient(id: number): Promise<void> {
    try {
      await axios.delete(`http://localhost:8080/api/patients/${id}`);
      this.loadPatients();
    } catch (err) {
      console.error(err);
    }
  }

  @Mutation
  public setPatients(patients: Patient[]): void {
    this.patients = patients;
  }

  get getAllPatients(): Patient[] {
    return this.patients;
  }
}

export default PatientStore;
