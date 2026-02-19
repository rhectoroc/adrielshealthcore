export const generateMedicalPDF = (patient, consultation, doctor) => {
    // Crear un iframe temporal para la impresión
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receta Médica - ${patient.full_name}</title>
        <style>
          @page { size: letter; margin: 20mm; }
          body { font-family: 'Arial', sans-serif; color: #333; line-height: 1.6; }
          .header { text-align: center; border-bottom: 2px solid #2E39C9; pb: 10px; mb: 20px; }
          .clinic-name { font-size: 24px; font-weight: bold; color: #2E39C9; margin: 0; }
          .clinic-info { font-size: 10px; color: #666; margin: 2px 0; }
          
          .section { margin-top: 30px; }
          .section-title { font-size: 14px; font-weight: bold; color: #2E39C9; border-bottom: 1px solid #EEE; padding-bottom: 5px; margin-bottom: 15px; text-transform: uppercase; }
          
          .patient-box { background: #F8FAFF; padding: 15px; border-radius: 8px; border: 1px solid #ECEFF9; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .info-item { font-size: 12px; }
          .info-label { font-weight: bold; color: #555; }
          
          .content-area { min-height: 300px; padding: 10px 0; font-size: 14px; white-space: pre-wrap; }
          
          .footer { margin-top: 50px; text-align: center; }
          .signature-box { margin: 40px auto 10px; width: 250px; border-top: 1px solid #000; padding-top: 10px; text-align: center; font-size: 12px; }
          .doctor-info { font-weight: bold; margin: 0; }
          .doctor-reg { font-size: 10px; color: #666; margin: 0; }
          
          @media print {
            .no-print { display: none; }
            body { -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <p class="clinic-name">ADRIEL'S HEALTHCORE</p>
          <p class="clinic-info">Centro Médico Especializado | RIF: J-00000000-0</p>
          <p class="clinic-info">Caracas, Venezuela | Tel: (0212) 000-0000</p>
        </div>

        <div class="section">
          <div class="patient-box">
            <div class="info-item"><span class="info-label">Paciente:</span> ${patient.full_name}</div>
            <div class="info-item"><span class="info-label">Cédula:</span> ${patient.cedula}</div>
            <div class="info-item"><span class="info-label">Fecha:</span> ${new Date(consultation.created_at || Date.now()).toLocaleDateString("es-VE")}</div>
            <div class="info-item"><span class="info-label">Edad:</span> ${patient.age || "N/A"} años</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Indicaciones Médicas / Receta</div>
          <div class="content-area">
            ${consultation.prescriptions || "No se indicaron medicamentos en esta consulta."}
          </div>
        </div>

        ${consultation.sickLeave ? `
        <div class="section">
          <div class="section-title">Certificado de Reposo</div>
          <div class="content-area">
            ${consultation.sickLeave}
          </div>
        </div>
        ` : ''}

        <div class="footer">
          <div class="signature-box">
            <p class="doctor-info">Dr. ${doctor?.full_name || "Médico Especialista"}</p>
            <p class="doctor-reg">M.P.P.S: ${doctor?.mpps_number || "-------"} | Colegio: ${doctor?.colegio_number || "-------"}</p>
            <p class="doctor-reg">${doctor?.specialty || "Medicina General"}</p>
          </div>
          <p style="font-size: 8px; color: #999; margin-top: 20px;">Documento generado automáticamente por Adriel's HealthCore Digital Platform</p>
        </div>
      </body>
    </html>
  `;

    doc.open();
    doc.write(html);
    doc.close();

    // Esperar a que cargue y disparar impresión
    iframe.contentWindow.focus();
    setTimeout(() => {
        iframe.contentWindow.print();
        // Limpieza opcional tras un tiempo
        setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 500);
};
