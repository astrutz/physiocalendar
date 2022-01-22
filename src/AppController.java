import java.net.URL;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.Locale;
import java.util.ResourceBundle;

import data.Weekday;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.text.Text;

// TODO: Redo this but with Daylist/Masterlist instead of simple days
public class AppController implements Initializable {

  @FXML
  private Text weekDay;
  @FXML
  private Text singleDay;

  @Override
  public void initialize(URL arg0, ResourceBundle arg1) {
    LocalDate now = LocalDate.now();
    String dayFormat = String.format("%s, %s. %s %d",
        now.getDayOfWeek().getDisplayName(TextStyle.valueOf("FULL"), Locale.getDefault()), now.getDayOfMonth(),
        now.getMonth().getDisplayName(TextStyle.valueOf("SHORT"), Locale.getDefault()), now.getYear());
    singleDay.setText(dayFormat);
    try {
      String dayOfWeek = now.getDayOfWeek().getDisplayName(TextStyle.valueOf("FULL"), Locale.getDefault());
      weekDay.setText(Weekday.valueOf(dayOfWeek).toString());
    } catch (IllegalArgumentException e) {
      weekDay.setText(Weekday.Montag.toString());
    }
  }

  public void nextWeekdayDay(ActionEvent e) {
    Weekday currentWeekDay = getCurrentWeekday();
    if (currentWeekDay == Weekday.Freitag) {
      weekDay.setText(Weekday.Montag.toString());
    } else {
      weekDay.setText(currentWeekDay.next().toString());
    }
  }

  public void previousWeekDay(ActionEvent e) {
    Weekday currentWeekDay = getCurrentWeekday();
    if (currentWeekDay == Weekday.Montag) {
      weekDay.setText(Weekday.Freitag.toString());
    } else {
      weekDay.setText(currentWeekDay.previous().toString());
    }
  }

  public void nextSingleDay() {
  }

  public void previousSingleDay() {

  }

  private Weekday getCurrentWeekday() {
    return Weekday.valueOf(weekDay.getText());
  }
}
