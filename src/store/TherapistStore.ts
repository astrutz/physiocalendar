import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import axios from 'axios';
import Therapist from '@/class/Therapist';
import { JSONTherapistDTO } from '@/class/JSONStructures';
import store from './index';
import { convertToTherapist, convertToTherapistDTO } from './convert';

@Module({ name: 'TherapistStore', dynamic: true, store })
class TherapistStore extends VuexModule {
  public therapists: Therapist[] = [];

  @Action
  public async loadTherapists(): Promise<void> {
    try {
      const responseData: JSONTherapistDTO[] = (await axios.get('http://localhost:8080/api/therapists')).data;
      const therapists = responseData.map((dto) => convertToTherapist(dto));
      this.context.commit('setTherapists', therapists);
    } catch (err) {
      console.error(err);
    }
  }

  @Action
  public async addTherapist(therapist: Therapist): Promise<void> {
    try {
      const therapistDTO = convertToTherapistDTO(therapist);
      await axios.post('http://localhost:8080/api/therapists', therapistDTO);
      this.loadTherapists();
    } catch (err) {
      console.error(err);
    }
  }

  @Action
  public async updateTherapist({ id, therapist }: { id: number, therapist: Therapist }): Promise<void> {
    try {
      const therapistDTO = convertToTherapistDTO(therapist);
      await axios.put(`http://localhost:8080/api/therapists/${id}`, therapistDTO);
      this.loadTherapists();
    } catch (err) {
      console.error(err);
    }
  }

  @Action
  public async deleteTherapist(id: number): Promise<void> {
    try {
      await axios.delete(`http://localhost:8080/api/therapists/${id}`);
      this.loadTherapists();
    } catch (err) {
      console.error(err);
    }
  }

  @Mutation
  public setTherapists(therapists: Therapist[]): void {
    this.therapists = therapists;
  }

  get getAllTherapists(): Therapist[] {
    return this.therapists;
  }
}

export default TherapistStore;
