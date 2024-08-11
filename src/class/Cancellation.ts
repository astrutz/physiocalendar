export default class Cancellation {
  
  id: number;
  
  date: Date;

  constructor(
    id: number,
    date: Date,

  ) {
    this.id = id;
    this.date = date;
  }
}
