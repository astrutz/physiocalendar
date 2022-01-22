import java.io.IOException;

import data.Backup;
import data.Daylist;
import data.Masterlist;
import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import javafx.stage.Stage;

public class App extends Application {
    Masterlist masterlist;
    Daylist daylist;

    public static void main(String[] args) throws IOException {
        launch(args);
    }

    @Override
    public void start(Stage stage) throws IOException {
        Backup backup = Backup.load("");
        daylist = backup.getDaylist();
        masterlist = backup.getMasterlist();

        // TODO: Use Masterlist and Daylist in Controller class

        Parent rootNode = FXMLLoader.load(getClass().getResource("App.fxml"));

        Scene scene = new Scene(rootNode, 1600, 900);
        Image icon = new Image("icon.png");

        stage.getIcons().add(icon);
        stage.setTitle("Physiocalendar");
        stage.setMaximized(true);
        stage.setScene(scene);
        stage.setMinWidth(1600);
        stage.setMinHeight(900);
        stage.show();
    }

}
