package br.com.institutodador.api;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.net.URI;
import java.util.Arrays;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    private final String[] allowedOrigins;

    public WebConfig(@Value("${app.cors.allowed-origins:}") String configuredOrigins) {
        this.allowedOrigins = Arrays.stream(configuredOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .map(WebConfig::validateOrigin)
                .toArray(String[]::new);
    }

    private static String validateOrigin(String origin) {
        URI uri = URI.create(origin);
        String scheme = uri.getScheme();
        String host = uri.getHost();
        boolean secureOrigin = "https".equalsIgnoreCase(scheme);
        boolean loopbackDevelopmentOrigin = "http".equalsIgnoreCase(scheme)
                && ("localhost".equalsIgnoreCase(host) || "127.0.0.1".equals(host));

        if ("*".equals(origin)
                || (!secureOrigin && !loopbackDevelopmentOrigin)
                || host == null
                || uri.getUserInfo() != null
                || (uri.getRawPath() != null && !uri.getRawPath().isEmpty())
                || uri.getQuery() != null
                || uri.getFragment() != null) {
            throw new IllegalArgumentException(
                    "CORS entries must be exact HTTPS origins; HTTP is allowed only for loopback development.");
        }
        return origin;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/v1/clinic")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET")
                .allowCredentials(false)
                .maxAge(3600);
    }
}
