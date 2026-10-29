package br.com.institutodador.api;

public record ClinicResponse(
        String name,
        String specialty,
        String phone,
        String whatsappNumber,
        String instagramUrl,
        String address,
        String locality,
        String mapUrl
) {}
