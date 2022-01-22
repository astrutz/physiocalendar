package data;

import java.util.Date;

public class Backup {

  private Date createdDate;
  private Masterlist masterlist;
  private Daylist daylist;

  public Backup(Date createdDate, Masterlist masterlist, Daylist daylist) {
    this.createdDate = createdDate;
    this.masterlist = masterlist;
    this.daylist = daylist;
  }

  public Date getCreatedDate() {
    return createdDate;
  }

  public void setCreatedDate(Date createdDate) {
    this.createdDate = createdDate;
  }

  public Masterlist getMasterlist() {
    return masterlist;
  }

  public void setMasterlist(Masterlist masterlist) {
    this.masterlist = masterlist;
  }

  public Daylist getDaylist() {
    return daylist;
  }

  public void setDaylist(Daylist daylist) {
    this.daylist = daylist;
  }

  public static Backup load(String filepath) {
    // TODO: Load JSON file and return data as backup
    return null;
  }

}
