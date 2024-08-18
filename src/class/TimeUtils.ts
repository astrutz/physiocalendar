export class TimeUtils {
    private static times: Date[] = [];
  
    static initializeTimes(): void {
      if (this.times.length === 0) {
        const baseDate = new Date();
        baseDate.setHours(7, 0, 0, 0); // Startzeit 7:00 Uhr
        for (let i = 0; i < 84; i++) { // 7:00 bis 20:50 in 10-Minuten-Schritten
          const time = new Date(baseDate.getTime() + i * 10 * 60 * 1000); // 10 Minuten hinzufügen
          this.times.push(time);
        }
      }
    }
  
    static getTimes(): Date[] {
      return this.times;
    }
  
    static formatTime(date: Date): string {
      return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    }
  
    static compareTimes(date1: Date, date2: Date): boolean {
      return date1.getHours() === date2.getHours() && date1.getMinutes() === date2.getMinutes();
    }

    static formatTimeRange(startTime: Date, endTime: Date): string {
      return `${this.formatTime(startTime)} - ${this.formatTime(endTime)}`;
  }
  }
  