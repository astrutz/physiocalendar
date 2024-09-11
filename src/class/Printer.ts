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
    const MAX_PER_PAGE = 12;
    let currentPage: string[] = [];
    const pages: string[][] = [];

    appointments.forEach(appointment => {
      if (currentPage.length >= MAX_PER_PAGE) {
        pages.push(currentPage);
        currentPage = [];
      }
      const dateString = formatDate(appointment.date);
      const startTimeString = formatTime(appointment.startTime);
      const weekdayString = 'Mo'//TODO: appointment.;

      currentPage.push(`${weekdayString}, ${dateString} von ${startTimeString}`);
    });

    if (currentPage.length > 0) {
      pages.push(currentPage);
    }

    return pages;
  }

  private generatePDF(pages: string[][]): void {
    const doc = new jsPDF({ orientation: 'landscape' });
  
    pages.forEach((page, pageIndex) => {
      if (pageIndex > 0) doc.addPage();
      const HEADER_Y = 20;
      const CONTENT_START_Y = 40;
      const LINE_HEIGHT = 10;
  
      // Kopfzeile mit Informationen
      doc.setFontSize(16);
      doc.setTextColor('#2a2f79');
      const header = 'Ihre nächsten Behandlungstermine';
      doc.text(header, 105, HEADER_Y, { align: 'center' }); // Zentrierter Kopftext auf der Seite
  
      // Patienteninformationen
      doc.setFontSize(12);
      const praxisInfo = 'Praxis Meyer\nAm Hans-Teich 16\n51674 Wiehl\nTelefon: 02262/797919';
      doc.text(praxisInfo, 105, HEADER_Y + 15, { align: 'center' }); // Weitere zentrierte Textzeilen unter dem Header
  
      if (this.patient) {
        doc.setFontSize(14);
        doc.setTextColor('#000000');
        const patientName = `Name: ${this.patient.fullName}`;
        doc.text(patientName, 105, HEADER_Y + 35, { align: 'center' }); // Patientenname unter Praxisinformationen
      }
  
      // Termine auf der aktuellen Seite
      let currentY = CONTENT_START_Y;
      page.forEach(line => {
        doc.setFontSize(12);
        doc.setTextColor('#000000');
        doc.text(line, 10, currentY); // Positionierung des Termins auf der Seite
        currentY += LINE_HEIGHT;
      });
  
      // Fußzeile mit rechtlichen Hinweisen
      const disclaimer = 'Bitte beachten Sie: Für unsere Patienten bemühen wir uns stets unsere Terminorganisation so effizient wie möglich zu gestalten. Eine Absage sollte daher nur in dringenden Fällen, spätestens jedoch 24 Stunden vor der Behandlung, erfolgen. Nicht rechtzeitig abgesagte Termine müssen wir Ihnen leider privat in Rechnung stellen.';
      doc.setFontSize(10);
      doc.setTextColor('#2a2f79');
      doc.text(doc.splitTextToSize(disclaimer, 180), 10, currentY + 10); // Anzeigen des Disclaimer am Ende jeder Seite
    });
  
    doc.save(`appointments-${this.patient?.lastName}.pdf`);
  }
}
