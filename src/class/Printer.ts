// eslint-disable-next-line import/no-cycle
import { jsPDF as PrintPDF } from 'jspdf';
import holidaysJSON from '@/data/holidays.json';
import Dateconversions from './Dateconversions';
import { Time, Weekday } from './Enums';
import SingleAppointment from './SingleAppointment';
import Appointment from './Appointment';
import Cancellation from './Cancellation';
import AppointmentSeries from './AppointmentSeries';

export default class Printer {
  id: string;

  patient: string;

  therapist: string;

  startTime: Time;

  endTime: Time;

  day: Weekday | Date;

  interval: number;

  cancellations : Cancellation[];

  startDate: Date | undefined;

  MAX_APPOINTMENT_COUNT = 12;

  constructor(
    id: string,
    patient: string,
    therapist: string,
    startTime: Time,
    endTime: Time,
    day: Weekday | Date,
    interval: number,
    cancellations: Cancellation[] = [],
    startDate?: Date,
  ) {
    this.id = id;
    this.patient = patient;
    this.therapist = therapist;
    this.startTime = startTime;
    this.endTime = endTime;
    this.day = day;
    this.interval = interval;
    this.cancellations = cancellations;
    this.startDate = startDate;
  }

  printSingleAppointment(appointmentsForPatient: Appointment[]): void {
    const singleAppointments: SingleAppointment[] = appointmentsForPatient.filter(
      (appointment) => appointment instanceof SingleAppointment,
    ) as SingleAppointment[];
    console.log('Einzeltermine:');
    console.log(singleAppointments);
    // einzeltermine sortieren
    singleAppointments.sort((appointment1, appointment2) => {
      if (appointment1.date > appointment2.date) {
        return 1;
      }
      if (appointment1.date < appointment2.date) {
        return -1;
      }
      if (appointment1.startTime > appointment2.startTime) {
        return 1;
      }
      if (appointment1.startTime < appointment2.startTime) {
        return -1;
      }
      return 0;
    });
    let i = 0;
    const strs: string[] = [];
    let str = '';
    if (singleAppointments.length === 0) {
      return;
    }
    singleAppointments.forEach((appointment, j) => {
      if (i > 0 && i % this.MAX_APPOINTMENT_COUNT === 0) {
        strs.push(str);
        str = '';
      }
      const dateAsString = Dateconversions.convertDateToReadableString(appointment.date);
      const weekdayReadable = Printer.getWeekday(appointment.date);
      str += `${weekdayReadable}${dateAsString} von ${appointment.startTime} bis ${appointment.endTime}\n`;
      i += 1;
      if (j === singleAppointments.length - 1) {
        strs.push(str);
      }
    });
    // single Appointments drucken
    if (singleAppointments.length !== 0) {
      this.print(strs);
    }
  }

  printSeriesAppointment(appointmentsForPatient: Appointment[]): void {
    const seriesAppointments: AppointmentSeries[] = appointmentsForPatient.filter(
      (appointment) => appointment instanceof AppointmentSeries,
    ) as AppointmentSeries[];

    if (seriesAppointments.length === 0) {
      return;
    }
    const seriesAppointmentToPrint = seriesAppointments.find((appointment) => appointment.id === this.id);
    if (!seriesAppointmentToPrint) {
      console.log(`Kein Termin mit ID ${this.id} gefunden`);
      return;
    }
    let str = '';
    let i = 0;
    const {
      startDate,
      endTime,
      startTime,
      interval,
      cancellations,
    } = seriesAppointmentToPrint;
    let currDate = startDate;
    if (this.startDate) {
      currDate = this.startDate;
    }
    while (i < this.MAX_APPOINTMENT_COUNT) {
      const holidays = holidaysJSON.days;
      const dateString = Dateconversions.convertDateToReadableString(currDate);
      const weekdayReadable = Printer.getWeekday(currDate);
      const readableString = Dateconversions.convertGermanToEnglishReadableString(dateString);
      if (!holidays.includes(readableString)
        && !cancellations.some((c) => c.date === Dateconversions.convertDateToReadableString(currDate))) {
        str += `${weekdayReadable}${dateString} von ${startTime} bis ${endTime}\n`;
        i += 1;
      }
      currDate.setDate(currDate.getDate() + interval * 7);
    }
    this.print([str]);
  }

  printAppointmentSeries(): void {
    // console.log('Serientermine:');
    // console.log(seriesAppointments);
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
    let currentSearchDate = new Date();
    if (this.startDate && this.startDate > currentSearchDate) {
      currentSearchDate = new Date(this.startDate.getTime());
    }

    // eslint-disable-next-line no-mixed-operators
    currentSearchDate.setDate(currentSearchDate.getDate() + ((7 - currentSearchDate.getDay()) % 7 + weekdayOffset) % 7);
    debugger;
    while (i < this.MAX_APPOINTMENT_COUNT) {
      const holidays = holidaysJSON.days;
      const readableStringEng = Dateconversions.convertGermanToEnglishReadableString(
        Dateconversions.convertDateToReadableString(currentSearchDate),
      );
      const readableStringDe = Dateconversions.convertDateToReadableString(currentSearchDate);
      if (!holidays.includes(readableStringEng)
      && !this.cancellations.some((c) => c.date === Dateconversions.convertDateToReadableString(currentSearchDate))) {
        str += `${dateAsString}, ${readableStringDe} von ${this.startTime} bis ${this.endTime}\n`;
        i += 1;
      }
      currentSearchDate.setDate(currentSearchDate.getDate() + (this.interval * 7));
    }
    this.print([str]);
  }

  private print(pdfContents: string[]): void {
    const doc = new PrintPDF({ orientation: 'landscape' });

    pdfContents.forEach((pdfContent, i) => {
      const textOptions: { align: 'center' } = { align: 'center' };

      doc.setFontSize(16);
      doc.setDrawColor('#2a2f79');

      // Left outline box
      doc.line(5, 5, 143, 5);
      doc.line(5, 205, 5, 5);
      doc.line(143, 5, 143, 205);
      doc.line(5, 205, 143, 205);

      // Right outline box
      doc.line(153, 5, 291, 5);
      doc.line(153, 205, 153, 5);
      doc.line(291, 5, 291, 205);
      doc.line(153, 205, 291, 205);

      // Header for appointments
      const nextAppointment = 'IHRE NÄCHSTEN BEHANDLUNGSTERMINE';
      doc.setTextColor('#2a2f79');
      doc.text(nextAppointment, 74, 20, textOptions);
      doc.text(nextAppointment, 222, 20, textOptions);

      // Praxis information
      doc.setFontSize(12);
      const praxisHeader = 'Praxis Meyer\nAm Hans-Teich 16\n51674 Wiehl\nTelefon: 02262/797919';
      doc.text(praxisHeader, 74, 40, textOptions);
      doc.text(praxisHeader, 222, 40, textOptions);

      // Name of patient
      doc.setFontSize(14);
      doc.setTextColor('#000000');
      doc.text(`Name: ${this.patient}`, 74, 75, textOptions);
      doc.text(`Name: ${this.patient}`, 222, 75, textOptions);

      // Appointments
      doc.setTextColor('#000000');
      doc.text(pdfContent, 74, 85, textOptions);
      doc.text(pdfContent, 222, 85, textOptions);

      // Page number
      doc.setFontSize(10);
      doc.setTextColor('#000000');
      doc.text(`Seite ${i + 1} von ${pdfContents.length}`, 74, 160, textOptions);
      doc.text(`Seite ${i + 1} von ${pdfContents.length}`, 222, 160, textOptions);

      // Legal disclaimer
      // eslint-disable-next-line max-len
      const disclaimer = 'Bitte beachten Sie:\nFür unsere Patienten bemühen wir uns stets unsere Terminorganisation so effizient wie möglich zu gestalten. Eine Absage sollte daher nur in dringenden Fällen, spätestens jedoch 24 Stunden vor der Behandlung, erfolgen. Nicht rechtzeitig abgesagte Termine müssen wir Ihnen leider privat in Rechnung stellen.';
      doc.setTextColor('#2a2f79');
      doc.setFontSize(10);
      doc.text(doc.splitTextToSize(disclaimer, 120), 74, 175, textOptions);
      doc.text(doc.splitTextToSize(disclaimer, 120), 222, 175, textOptions);

      if (i < pdfContents.length - 1) {
        doc.addPage();
      }
    });

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
