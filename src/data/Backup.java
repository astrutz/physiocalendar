package data;

import java.io.EOFException;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.Serializable;
import java.util.Date;

public class Backup implements Serializable {

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

  public static Backup load(String fileName) {
    Backup backup = new Backup(new Date(), null, null);
    try {
      FileInputStream fin = new FileInputStream(fileName);
      ObjectInputStream ois = new ObjectInputStream(fin);
      Object o;
      while (true) {
        try {
          o = ois.readObject();
          if (o instanceof Backup) {
            backup = (Backup) o;
          }
        } catch (EOFException | ClassNotFoundException e) {
          break;
        }
      }
      ois.close();
    } catch (IOException e) {
      e.printStackTrace();
    }
    return backup;
  }

  public void save(String fileName) {
    try {
      FileOutputStream fos = new FileOutputStream(fileName);
      ObjectOutputStream oos = new ObjectOutputStream(fos);
      oos.writeObject(this);
      oos.close();
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  public static Backup scaffoldBackup() {
    // TODO: Create Backup with meaningful data
    ListSingleDay[] singledays = new ListSingleDay[0];
    Daylist daylist = new Daylist(singledays);

    ListWeekDay[] weekdays = new ListWeekDay[0];
    Masterlist masterlist = new Masterlist(weekdays);

    Backup backup = new Backup(new Date(), masterlist, daylist);
    return backup;
  }

}
