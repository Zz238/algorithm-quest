package quest;
import java.util.NoSuchElementException;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class LearningService {
    public record Progress(String lesson, boolean completed) {}
    private final ConcurrentHashMap<String, Progress> records = new ConcurrentHashMap<>();
    public LearningService() { records.put("arrays", new Progress("arrays", false)); }
    private void validate(String lesson) {
        if (lesson == null || !lesson.matches("[a-z][a-z0-9-]{0,39}")) throw new IllegalArgumentException("lesson must be a lowercase course identifier");
    }
    public Progress read(String lesson) {
        validate(lesson);
        Progress value = records.get(lesson);
        if (value == null) throw new NoSuchElementException("lesson not found");
        return value;
    }
    public Progress save(Progress value) {
        if (value == null) throw new IllegalArgumentException("request body is required");
        validate(value.lesson());
        records.put(value.lesson(), value);
        return value;
    }
}
