package br.com.institutodador.api;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ClinicServiceTest {
    @Test
    void shouldReturnConfirmedClinicContactInformation() {
        var service = new ClinicService("5561994443807");
        var clinic = service.details();

        assertEquals("Instituto da Dor", clinic.name());
        assertEquals("5561994443807", clinic.whatsappNumber());
        assertTrue(clinic.instagramUrl().contains("institutodorgama"));
        assertTrue(clinic.locality().contains("Gama"));
    }
}
