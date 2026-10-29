package br.com.institutodador.api;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ClinicService {
    private final String whatsappNumber;

    public ClinicService(@Value("${clinic.whatsapp-number}") String whatsappNumber) {
        this.whatsappNumber = whatsappNumber;
    }

    public ClinicResponse details() {
        return new ClinicResponse(
                "Instituto da Dor",
                "Fisioterapia",
                "(61) 99444-3807",
                whatsappNumber,
                "https://www.instagram.com/institutodorgama/",
                "Setor Sul, Quadra 3, Conjunto A, Lote 20, Sala 204",
                "Gama, Brasília - DF, CEP 72410-201",
                "https://www.google.com/maps/search/?api=1&query=Setor+Sul+Quadra+3+Conjunto+A+Lote+20+Sala+204+Gama+DF"
        );
    }
}
