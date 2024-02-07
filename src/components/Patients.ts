import { Component, Vue } from 'vue-property-decorator';
import Patient from '@/class/Patient';
import Appointment from '@/class/Appointment';
import { Time } from '@/class/Enums';


@Component({
components: {
PatientDetail,
},
})


export default class Patients extends Vue {
// Tabellenheader
headers = [
{ text: 'Vorname', value: 'firstName' },
{ text: 'Nachname', value: 'name' },
{ text: 'ID', value: 'id' },
{ text: 'Aktiv seit', value: 'activeSince' },
{ text: 'Aktiv bis', value: 'activeUntil' },
{ text: 'BWO', value: 'isBWO' },
];

detailDialog = false;

selectedPatient: Patient | null = null;

selectedPatientAppointments: Appointment[] = [];

// Deklaration der gefilterten Patienten
filteredPatients: Patient[] = [];

search = '';

// Testpatienten
patients: Patient[] = [
new Patient('Max', 'Mustermann', '1', new Date('2023-01-01'), new Date('2023-12-31'), true),
new Patient('Erika', 'Musterfrau', '2', new Date('2023-02-01'), new Date('2023-12-31'), false),
// Füge weitere Patienten hier hinzu...
];

// Methode zum Öffnen der Detailansicht
showDetail(patient: Patient): void {
this.selectedPatient = patient;
// Annahme: Funktion zum Abrufen von Terminen für einen Patienten
this.getAppointmentsForPatient(patient);
this.detailDialog = true;
}

getAppointmentsForPatient(patient: Patient): void {
const exampleAppointments: Appointment[] = [
new Appointment(
'Dr. Müller',
'therapist123',
patient.firstName,
Time['10:00'],
Time['10:30'],
'Routineuntersuchung'
),
new Appointment(
'Dr. Müller',
'therapist123',
patient.firstName,
Time['10:00'],
Time['10:30'],
'Routineuntersuchung'
),
new Appointment(
'Dr. Müller',
'therapist123',
patient.firstName,
Time['10:00'],
Time['10:30'],
'Routineuntersuchung'
),
new Appointment(
'Dr. Müller',
'therapist123',
patient.firstName,
Time['10:00'],
Time['10:30'],
'Routineuntersuchung'
),
];
this.selectedPatientAppointments = exampleAppointments;
}

filterPatients(): void {
const searchTerm = this.search.toLowerCase();
this.filteredPatients = this.patients.filter((patient) => {
return patient.firstName.toLowerCase().includes(searchTerm) || patient.name.toLowerCase().includes(searchTerm);
});
}

// Methode zum Schließen der Detailansicht
closeDetailDialog(): void {
this.detailDialog = false;
this.selectedPatient = null;
this.selectedPatientAppointments = [];
}

// Methode zum Speichern der Änderungen des Patienten
savePatientChanges(): void {
// Hier die Logik zum Speichern der Patientenänderungen implementieren
this.closeDetailDialog();
}

// eslint-disable-next-line class-methods-use-this
formatDate(date: Date | undefined): string {
if (!date) return ''; // Sicherstellen, dass ein gültiges Date-Objekt vorhanden ist
const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
return new Date(date).toLocaleDateString('de-DE' as string, options); // Typumwandlung zu string
}
}
