package quest.runtime;

import java.io.*;
import java.net.URI;
import java.lang.reflect.*;
import java.util.*;
import javax.tools.*;

/** Browser-only teaching runner. Source and bytecode remain in memory. */
public final class Runner {
    public static native void phase(String value);
    private static void status(String value) {
        try { phase(value); } catch (UnsatisfiedLinkError ignored) { /* Local verification. */ }
    }
    static final class TextSource extends SimpleJavaFileObject {
        final String text;
        TextSource(String text) { super(URI.create("string:///Main.java"), Kind.SOURCE); this.text = text; }
        public CharSequence getCharContent(boolean ignore) { return text; }
    }
    static final class ByteCode extends SimpleJavaFileObject {
        final ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        ByteCode(String name, Kind kind) { super(URI.create("memory:///" + name.replace('.', '/') + kind.extension), kind); }
        public OutputStream openOutputStream() { return bytes; }
    }
    static final class LimitedOutput extends OutputStream {
        final ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        public void write(int value) throws IOException {
            if (bytes.size() >= 16384) throw new IOException("Output limit: 16384 bytes");
            bytes.write(value);
        }
        String text() throws UnsupportedEncodingException { return bytes.toString("UTF-8"); }
    }
    public static String run(String source, String input) {
        final long start = System.currentTimeMillis();
        PrintStream oldOut = System.out, oldErr = System.err;
        InputStream oldIn = System.in;
        LimitedOutput out = new LimitedOutput(), err = new LimitedOutput();
        String state = "compile-error", error = "", diagnostics = "[]";
        StandardJavaFileManager standard = null;
        try {
            status("compiling");
            JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
            if (compiler == null) throw new IllegalStateException("JDK compiler is unavailable in this runtime");
            DiagnosticCollector<JavaFileObject> messages = new DiagnosticCollector<>();
            standard = compiler.getStandardFileManager(messages, Locale.ENGLISH, java.nio.charset.StandardCharsets.UTF_8);
            final Map<String, ByteCode> classes = new HashMap<>();
            JavaFileManager manager = new ForwardingJavaFileManager<StandardJavaFileManager>(standard) {
                public JavaFileObject getJavaFileForOutput(Location location, String name, JavaFileObject.Kind kind, FileObject sibling) {
                    ByteCode file = new ByteCode(name, kind); classes.put(name, file); return file;
                }
            };
            boolean ok = compiler.getTask(null, manager, messages,
                Arrays.asList("-proc:none", "-encoding", "UTF-8"), null,
                Collections.singletonList(new TextSource(source))).call();
            StringBuilder ds = new StringBuilder("[");
            for (Diagnostic<? extends JavaFileObject> d : messages.getDiagnostics()) {
                if (ds.length() > 1) ds.append(',');
                ds.append("{\"line\":").append(d.getLineNumber()).append(",\"column\":").append(d.getColumnNumber())
                    .append(",\"kind\":").append(quote(d.getKind().name()))
                    .append(",\"message\":").append(quote(d.getMessage(Locale.ENGLISH)) ).append('}');
            }
            diagnostics = ds.append(']').toString();
            if (ok) {
                status("running");
                ClassLoader loader = new ClassLoader(Runner.class.getClassLoader()) {
                    protected Class<?> findClass(String name) throws ClassNotFoundException {
                        ByteCode file = classes.get(name);
                        if (file == null) throw new ClassNotFoundException(name);
                        byte[] bytes = file.bytes.toByteArray();
                        return defineClass(name, bytes, 0, bytes.length);
                    }
                };
                System.setOut(new PrintStream(out, true, "UTF-8"));
                System.setErr(new PrintStream(err, true, "UTF-8"));
                System.setIn(new ByteArrayInputStream(input.getBytes("UTF-8")));
                Class<?> main = loader.loadClass("Main");
                main.getMethod("main", String[].class).invoke(null, (Object) new String[0]);
                if (System.out.checkError() || System.err.checkError()) throw new IOException("Output exceeded 16384 bytes");
                state = "finished";
            }
        } catch (Throwable e) {
            state = "runtime-error";
            Throwable cause = e instanceof InvocationTargetException ? ((InvocationTargetException)e).getCause() : e;
            error = cause.getClass().getSimpleName() + ": " + String.valueOf(cause.getMessage());
            for (StackTraceElement frame : cause.getStackTrace()) {
                if ("Main.java".equals(frame.getFileName())) { error += " (Main.java:" + frame.getLineNumber() + ")"; break; }
            }
        } finally {
            System.setOut(oldOut); System.setErr(oldErr); System.setIn(oldIn);
            if (standard != null) try { standard.close(); } catch (IOException ignored) { }
        }
        try {
            return "{\"state\":" + quote(state) + ",\"stdout\":" + quote(out.text()) + ",\"stderr\":" + quote(err.text())
                + ",\"error\":" + quote(error) + ",\"diagnostics\":" + diagnostics
                + ",\"elapsed\":" + (System.currentTimeMillis() - start) + "}";
        } catch (UnsupportedEncodingException e) { throw new IllegalStateException(e); }
    }
    public static String quote(String value) {
        StringBuilder s = new StringBuilder("\"");
        for (int i = 0; i < value.length(); i++) {
            char c = value.charAt(i);
            switch (c) {
                case '\\': s.append("\\\\"); break;
                case '"': s.append("\\\""); break;
                case '\n': s.append("\\n"); break;
                case '\r': s.append("\\r"); break;
                case '\t': s.append("\\t"); break;
                default: if (c < 32) s.append(String.format("\\u%04x", (int)c)); else s.append(c);
            }
        }
        return s.append('"').toString();
    }
    public static void main(String[] args) throws Exception {
        String source = new String(java.nio.file.Files.readAllBytes(java.nio.file.Paths.get(args[0])), "UTF-8");
        System.out.println(run(source, args.length > 1 ? args[1] : ""));
    }
}
