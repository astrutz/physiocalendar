export enum Weekday {
  MONDAY = 'Montag',
  TUESDAY = 'Dienstag',
  WEDNESDAY = 'Mittwoch',
  THURSDAY = 'Donnerstag',
  FRIDAY = 'Freitag'
}

export enum TimeOfDay {
  MORNING = 'Morgens',
  FORENOON = 'Vormittags',
  NOON = 'Mittags',
  AFTERNOON = 'Nachmittags',
  EVENING = 'Abends'
}

export enum Time {
  '7:00',
  '7:20',
  '7:40',
  '8:00',
  '8:20',
  '8:40',
  '9:00',
  '9:20',
  '9:40',
  '10:00',
  '10:20',
  '10:40',
  '11:00',
  '11:20',
  '11:40',
  '12:00',
  '12:20',
  '12:40',
  '13:00',
  '13:20',
  '13:40',
  '14:00',
  '14:20',
  '14:40',
  '15:00',
  '15:20',
  '15:40',
  '16:00',
  '16:20',
  '16:40',
  '17:00',
  '17:20',
  '17:40',
  '18:00',
  '18:20',
  '18:40',
  '19:00',
  '19:20',
  '19:40',
  '20:00',
  '20:20',
  '20:40',
}

export function nextTime(time: Time): Time {
  switch (time.toString()) {
    case '7:00': return '7:20' as unknown as Time;
    case '7:20': return '7:40' as unknown as Time;
    case '7:40': return '8:00' as unknown as Time;
    case '8:00': return '8:20' as unknown as Time;
    case '8:20': return '8:40' as unknown as Time;
    case '8:40': return '9:00' as unknown as Time;
    case '9:00': return '9:20' as unknown as Time;
    case '9:20': return '9:40' as unknown as Time;
    case '9:40': return '10:00' as unknown as Time;
    case '10:00': return '10:20' as unknown as Time;
    case '10:20': return '10:40' as unknown as Time;
    case '10:40': return '11:00' as unknown as Time;
    case '11:00': return '11:20' as unknown as Time;
    case '11:20': return '11:40' as unknown as Time;
    case '11:40': return '12:00' as unknown as Time;
    case '12:00': return '12:20' as unknown as Time;
    case '12:20': return '12:40' as unknown as Time;
    case '12:40': return '13:00' as unknown as Time;
    case '13:00': return '13:20' as unknown as Time;
    case '13:20': return '13:40' as unknown as Time;
    case '13:40': return '14:00' as unknown as Time;
    case '14:00': return '14:20' as unknown as Time;
    case '14:20': return '14:40' as unknown as Time;
    case '14:40': return '15:00' as unknown as Time;
    case '15:00': return '15:20' as unknown as Time;
    case '15:20': return '15:40' as unknown as Time;
    case '15:40': return '16:00' as unknown as Time;
    case '16:00': return '16:20' as unknown as Time;
    case '16:20': return '16:40' as unknown as Time;
    case '16:40': return '17:00' as unknown as Time;
    case '17:00': return '17:20' as unknown as Time;
    case '17:20': return '17:40' as unknown as Time;
    case '17:40': return '18:00' as unknown as Time;
    case '18:00': return '18:20' as unknown as Time;
    case '18:20': return '18:40' as unknown as Time;
    case '18:40': return '19:00' as unknown as Time;
    case '19:00': return '19:20' as unknown as Time;
    case '19:20': return '19:40' as unknown as Time;
    case '19:40': return '20:00' as unknown as Time;
    case '20:00': return '20:20' as unknown as Time;
    case '20:20': return '20:40' as unknown as Time;
    default: return '7:00' as unknown as Time;
  }
}
