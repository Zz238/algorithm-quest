package quest;
import static org.junit.jupiter.api.Assertions.*;
import java.net.URI;
import java.net.http.*;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ProgressTest {
    @LocalServerPort int port;
    HttpResponse<String> request(String path) throws Exception {
        return HttpClient.newHttpClient().send(HttpRequest.newBuilder(URI.create("http://127.0.0.1:"+port+path)).build(), HttpResponse.BodyHandlers.ofString());
    }
    @Test void readsSeed() throws Exception {
        var response = request("/api/progress?lesson=arrays");
        assertEquals(200,response.statusCode()); assertTrue(response.body().contains("arrays"));
    }
    @Test void rejectsEmpty() throws Exception { assertEquals(400,request("/api/progress?lesson=").statusCode()); }
    @Test void rejectsMissingParameter() throws Exception { assertEquals(400,request("/api/progress").statusCode()); }
    @Test void returnsNotFound() throws Exception { assertEquals(404,request("/api/progress?lesson=unknown").statusCode()); }
    @Test void savesAndReads() throws Exception {
        var request = HttpRequest.newBuilder(URI.create("http://127.0.0.1:"+port+"/api/progress"))
            .header("Content-Type","application/json").POST(HttpRequest.BodyPublishers.ofString("{\"lesson\":\"hash\",\"completed\":true}")).build();
        assertEquals(200,HttpClient.newHttpClient().send(request,HttpResponse.BodyHandlers.ofString()).statusCode());
        var response=request("/api/progress?lesson=hash"); assertTrue(response.body().contains("true"));
    }
    @Test void serviceRejectsNull() { assertThrows(IllegalArgumentException.class,()->new LearningService().save(null)); }
}
