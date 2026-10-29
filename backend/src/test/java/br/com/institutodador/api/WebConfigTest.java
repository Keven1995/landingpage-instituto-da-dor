package br.com.institutodador.api;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class WebConfigTest {
    @Test
    void allowsOnlyConfiguredOriginsAndGetForPublicClinicData() {
        var registry = new ExposedCorsRegistry();
        new WebConfig("https://clinic.example, https://www.clinic.example").addCorsMappings(registry);

        var configurations = registry.configurations();
        assertEquals(List.of("/api/v1/clinic"), List.copyOf(configurations.keySet()));

        CorsConfiguration clinicCors = configurations.get("/api/v1/clinic");
        assertEquals("https://clinic.example", clinicCors.checkOrigin("https://clinic.example"));
        assertNull(clinicCors.checkOrigin("https://untrusted.example"));
        assertNull(clinicCors.checkHttpMethod(HttpMethod.POST));
        assertEquals(Boolean.FALSE, clinicCors.getAllowCredentials());
    }

    @Test
    void deniesCrossOriginRequestsWhenNoFrontendOriginIsConfigured() {
        var registry = new ExposedCorsRegistry();
        new WebConfig("").addCorsMappings(registry);

        var clinicCors = registry.configurations().get("/api/v1/clinic");
        assertNotNull(clinicCors);
        assertNull(clinicCors.checkOrigin("https://clinic.example"));
    }

    @Test
    void rejectsWildcardAndNonHttpsRemoteOrigins() {
        assertThrows(IllegalArgumentException.class, () -> new WebConfig("*"));
        assertThrows(IllegalArgumentException.class, () -> new WebConfig("http://clinic.example"));
        assertThrows(IllegalArgumentException.class, () -> new WebConfig("https://clinic.example/path"));
    }

    private static class ExposedCorsRegistry extends CorsRegistry {
        private Map<String, CorsConfiguration> configurations() {
            return getCorsConfigurations();
        }
    }
}
