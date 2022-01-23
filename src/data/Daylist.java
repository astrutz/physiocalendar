package data;

import java.io.Serializable;

public class Daylist implements Serializable {

  private ListSingleDay[] elements;

  public Daylist(ListSingleDay[] elements) {
    this.elements = elements;
  }

  public ListSingleDay[] getElements() {
    return elements;
  }

  public void setElements(ListSingleDay[] elements) {
    this.elements = elements;
  }

}
