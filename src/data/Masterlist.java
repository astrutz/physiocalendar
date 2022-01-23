package data;

import java.io.Serializable;

public class Masterlist implements Serializable {

  private ListWeekDay[] elements;

  public Masterlist(ListWeekDay[] elements) {
    this.elements = elements;
  }

  public ListWeekDay[] getElements() {
    return elements;
  }

  public void setElements(ListWeekDay[] elements) {
    this.elements = elements;
  }

}
