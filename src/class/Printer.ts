import { formatDate, formatTime, getWeekdayForDate } from '@/class/Dateconversions';
import SingleAppointment from '@/class/SingleAppointment';
import { useAppointmentStore } from '@/store/AppointmentStore';
import jsPDF from 'jspdf';
import Patient from './Patient';
import { Weekday } from './Enums';

export default class Printer {
  private patientId: number;
  private startDate: Date;
  private patient: Patient | null = null;
  private appointmentStore = useAppointmentStore();

  constructor(patientId: number, startDate?: Date) {
    this.patientId = patientId;
    this.startDate = startDate || new Date();
  }

  public async printPatientAppointments(): Promise<void> {
    await this.appointmentStore.loadAppointments();
    const appointments: SingleAppointment[] = await this.appointmentStore.getAppointmentsByPatientId(this.patientId);
    this.patient = appointments[0].patient;
    //const filteredAppointments = appointments.filter(app => app.date >= this.startDate);
    console.log(appointments);
    //appointments.sort((a, b) => a.date.getTime() - b.date.getTime());
    this.generatePDF(this.chunkAppointmentsForPrinting(appointments));
  }

  private chunkAppointmentsForPrinting(appointments: SingleAppointment[]): string[][] {
    const MAX_PER_PAGE = 24;
    let currentPage: string[] = [];
    const pages: string[][] = [];

    appointments.forEach(appointment => {
      if (currentPage.length >= MAX_PER_PAGE) {
        pages.push(currentPage);
        currentPage = [];
      }
      const dateString = formatDate(appointment.date);
      const startTimeString = formatTime(appointment.startTime);
      const weekdayString = getWeekdayForDate(appointment.startTime)

      currentPage.push(`${weekdayString}, ${dateString} um ${startTimeString}`);
    });

    if (currentPage.length > 0) {
      pages.push(currentPage);
    }

    return pages;
  }

  private generatePDF(pages: string[][]): void {
    const doc = new jsPDF({
      orientation: 'landscape',
    });
    const textOptions: { align: 'center' } = { align: 'center' };
  
    pages.forEach((page, index) => {
      if (index > 0) doc.addPage();
  
      doc.setFontSize(16);
      doc.setDrawColor('#2a2f79');
  
      // Links
      doc.line(5, 5, 143, 5);
      doc.line(5, 205, 5, 5);
      doc.line(143, 5, 143, 205);
      doc.line(5, 205, 143, 205);
  
      // Rechts
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
      doc.text(`Name: ${this.patient?.fullName}`, 74, 70, textOptions);
      doc.text(`Name: ${this.patient?.fullName}`, 222, 70, textOptions);
  
      // Appointments
      doc.setFontSize(12);
      doc.setTextColor('#000000');
      let startY = 85; // Starting Y position for appointments
      page.forEach((line, lineIndex) => {
        let columnX = lineIndex < 12 ? 74 : 222; // Switch column after 12 appointments
        doc.text(line, columnX, startY + ((lineIndex % 12) * 6), textOptions);
      });
  
      // Legal disclaimer
      const disclaimer = 'Bitte beachten Sie:\nFür unsere Patienten bemühen wir uns stets unsere Terminorganisation so effizient wie möglich zu gestalten. Eine Absage sollte daher nur in dringenden Fällen, spätestens jedoch 24 Stunden vor der Behandlung, erfolgen. Nicht rechtzeitig abgesagte Termine müssen wir Ihnen leider privat in Rechnung stellen.';
      doc.setFontSize(10);
      doc.setTextColor('#2a2f79');
      doc.text(doc.splitTextToSize(disclaimer, 120), 74, 175, textOptions);
      doc.text(doc.splitTextToSize(disclaimer, 120), 222, 175, textOptions);
  
      // Page number
      const pageText = `Seite ${index + 1} von ${pages.length}`;
      doc.setFontSize(10);
      doc.setTextColor('#000000');
      doc.text(`Seite ${index + 1} von ${pages.length*2}`, 74, 165, textOptions);
      doc.text(`Seite ${index + 2} von ${pages.length*2}`, 222, 165, textOptions);
    });
  
    doc.save(`termine_${this.patient?.firstName}_${this.patient?.lastName}.pdf`);
  }
  
  
}
