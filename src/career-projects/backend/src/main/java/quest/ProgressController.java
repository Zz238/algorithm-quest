package quest;
import java.util.Map;
import java.util.NoSuchElementException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import quest.LearningService.Progress;

@RestController
public class ProgressController {
    private final LearningService service;
    public ProgressController(LearningService service) { this.service = service; }
    @GetMapping("/api/progress")
    public Progress read(@RequestParam String lesson) { return service.read(lesson); }
    @PostMapping("/api/progress")
    public Progress save(@RequestBody Progress value) { return service.save(value); }
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String,String>> badInput(IllegalArgumentException error) {
        return ResponseEntity.badRequest().body(Map.of("error", error.getMessage()));
    }
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String,String>> missing(NoSuchElementException error) {
        return ResponseEntity.status(404).body(Map.of("error", error.getMessage()));
    }
}
