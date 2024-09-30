export default class User {
    id: number;

    username: string;
  
    therapistId: number;
  
    constructor(
      id: number,
      username: string,
      therapistId: number,
    ) {
      this.id = id;
      this.username = username;
      this.therapistId = therapistId;
    }
  }
  