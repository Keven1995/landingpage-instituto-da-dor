package br.com.institutodador.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = "app.cors.allowed-origins=https://clinic.example"
)
class PublicApiSecurityTest {
    @Value("${local.server.port}")
    private int port;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Test
    void publicClinicReadAllowsConfiguredOriginAndReturnsOnlyPublicClinicData() throws Exception {
        var response = send("GET", "/api/v1/clinic", "https://clinic.example");

        assertEquals(200, response.statusCode());
        assertEquals("https://clinic.example", response.headers().firstValue("Access-Control-Allow-Origin").orElse(null));
        assertTrue(response.body().contains("Instituto da Dor"));
        assertFalse(response.body().contains("stacktrace"));
    }

    @Test
    void untrustedOriginAndUnmappedMethodsAreNotAllowed() throws Exception {
        var untrusted = send("GET", "/api/v1/clinic", "https://untrusted.example");
        assertEquals(403, untrusted.statusCode());
        assertTrue(untrusted.headers().firstValue("Access-Control-Allow-Origin").isEmpty());

        var writeAttempt = send("POST", "/api/v1/clinic", null);
        assertEquals(405, writeAttempt.statusCode());
        assertFalse(writeAttempt.body().contains("stackTrace"));
        assertFalse(writeAttempt.body().contains("exception"));
    }

    @Test
    void healthRouteRemainsPublicAndUnmappedRouteDoesNotExposeExceptionDetails() throws Exception {
        var health = send("GET", "/api/v1/health", null);
        assertEquals(200, health.statusCode());
        assertEquals("{\"status\":\"UP\"}", health.body());

        var missing = send("GET", "/internal", null);
        assertEquals(404, missing.statusCode());
        assertFalse(missing.body().contains("stackTrace"));
        assertFalse(missing.body().contains("exception"));
    }

    private HttpResponse<String> send(String method, String path, String origin) throws Exception {
        var requestBuilder = HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + path));
        if (origin != null) requestBuilder.header("Origin", origin);
        requestBuilder.method(method, HttpRequest.BodyPublishers.noBody());
        return httpClient.send(requestBuilder.build(), HttpResponse.BodyHandlers.ofString());
    }
}
