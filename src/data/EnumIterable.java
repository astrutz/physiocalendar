package data;

public interface EnumIterable<E extends Enum<E>> {
  int ordinal();

  default E next() {
      E[] ies = this.getAllValues();
      return this.ordinal() != ies.length - 1 ? ies[this.ordinal() + 1] : null;
  }

  default E previous() {
      return this.ordinal() != 0 ? this.getAllValues()[this.ordinal() - 1] : null;
  }

  private E[] getAllValues() {
    EnumIterable[] ies = this.getClass().getEnumConstants();
      return (E[]) ies;
  }
}
