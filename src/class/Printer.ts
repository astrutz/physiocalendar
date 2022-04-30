// eslint-disable-next-line import/no-cycle
import { jsPDF as PrintPDF } from 'jspdf';
import holidaysJSON from '@/data/holidays.json';
import Dateconversions from './Dateconversions';
import { Time, Weekday } from './Enums';

export default class Printer {
  patient: string;

  therapist: string;

  time: Time;

  day: Weekday | Date;

  constructor(
    patient: string,
    therapist: string,
    time: Time,
    day: Weekday | Date,
  ) {
    this.patient = patient;
    this.therapist = therapist;
    this.time = time;
    this.day = day;
  }

  printSingleAppointment(): void {
    const dateAsString = Dateconversions.convertDateToReadableString(this.day as Date);
    const weekdayReadable = Printer.getWeekday(this.day as Date);
    const str = `${weekdayReadable}${dateAsString} um ${this.time}`;
    this.print(str, false);
  }

  printAppointmentSeries(): void {
    const dateAsString = this.day as Weekday;
    let str = '';

    let weekdayOffset = 1;

    switch (dateAsString) {
      case Weekday.MONDAY: weekdayOffset = 1; break;
      case Weekday.TUESDAY: weekdayOffset = 2; break;
      case Weekday.WEDNESDAY: weekdayOffset = 3; break;
      case Weekday.THURSDAY: weekdayOffset = 4; break;
      case Weekday.FRIDAY: weekdayOffset = 5; break;
      default: break;
    }

    let i = 0;
    const currentSearchDate = new Date();
    // eslint-disable-next-line no-mixed-operators
    currentSearchDate.setDate(currentSearchDate.getDate() + ((7 - currentSearchDate.getDay()) % 7 + weekdayOffset) % 7);

    while (i < 6) {
      const holidays = holidaysJSON.days;
      const readableString = Dateconversions.convertGermanToEnglishReadableString(
        Dateconversions.convertDateToReadableString(currentSearchDate),
      );
      if (!holidays.includes(readableString)) {
        str += `${dateAsString}, ${Dateconversions.convertDateToReadableString(currentSearchDate)} um ${this.time}\n`;
        i += 1;
      }
      currentSearchDate.setDate(currentSearchDate.getDate() + 7);
    }
    this.print(str, true);
  }

  private print(pdfContent: string, isSeries: boolean): void {
    const doc = new PrintPDF({ format: 'a5' });

    doc.setDrawColor('#2a2f79');
    doc.line(5, 5, 143, 5);
    doc.line(5, 205, 5, 5);
    doc.line(143, 5, 143, 205);
    doc.line(5, 205, 143, 205);

    const nextAppointment = isSeries ? 'IHRE NÄCHSTEN BEHANDLUNGSTERMINE' : 'IHR NÄCHSTER BEHANDLUNGSTERMIN';
    doc.setTextColor('#2a2f79');
    doc.text(nextAppointment, 74, 20, { align: 'center' });

    doc.setFontSize(12);
    const praxisHeader = 'Praxis Meyer\nAm Hans-Teich 16\n51674 Wiehl\nTelefon und Fax: 02262/797919';
    doc.text(praxisHeader, 74, 40, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor('#000000');
    doc.text(`Name: ${this.patient}`, 74, 75, { align: 'center' });

    doc.setTextColor('#000000');
    doc.text(pdfContent, 74, 85, { align: 'center' });

    // eslint-disable-next-line max-len
    const disclaimer = 'Bitte beachten Sie:\nFür unsere Patienten bemühen wir uns stets unsere Terminorganisation so effizient wie möglich zu gestalten. Eine Absage sollte daher nur in dringenden Fällen, spätestens jedoch 24 Stunden vor der Behandlung, erfolgen. Nicht rechtzeitig abgesagte Termine müssen wir Ihnen leider privat in Rechnung stellen.';
    doc.setTextColor('#2a2f79');
    doc.setFontSize(10);
    doc.splitTextToSize(disclaimer, 74);
    doc.text(doc.splitTextToSize(disclaimer, 120), 74, 175, { align: 'center' });

    doc.autoPrint();
    doc.output('dataurlnewwindow');
  }

  static getWeekday(date: Date): string {
    switch (date.getDay()) {
      case 0: return 'Sonntag, ';
      case 1: return 'Montag, ';
      case 2: return 'Dienstag, ';
      case 3: return 'Mittwoch, ';
      case 4: return 'Donnerstag, ';
      case 5: return 'Freitag, ';
      case 6: return 'Samstag, ';
      default: return '';
    }
  }
}
