// =============================================================
//  KONFIGURACIJA ZA EmailJS
//  -------------------------------------------------------------
//  EmailJS salje prave mejlove direktno iz front-enda. Za rad su
//  potrebna 3 podatka sa tvog EmailJS naloga: SERVICE ID, TEMPLATE ID
//  i PUBLIC KEY. (PRIVATE KEY se NE koristi u browseru i NE sme da
//  stoji ovde - drzi ga u tajnosti.)
//
//  Service ID i Public key su vec uneti. Jos treba TEMPLATE ID:
//    1. EmailJS -> Email Templates -> Create New Template
//    2. Otvori "Edit Content" -> Code editor (</>) i nalepi sadrzaj
//       fajla email-template.html iz korena projekta.
//    3. U podesavanjima template-a stavi:
//         Subject  = {{naslov}}
//         To Email = {{to_email}}
//    4. Sacuvaj i kopiraj TEMPLATE ID (izgleda kao "template_xxxxxxx").
//    5. Zameni vrednost templateId ispod tim ID-jem.
// =============================================================
export const EMAILJS_CONFIG = {
  serviceId: 'service_emnbfq7',
  templateId: 'template_uivb8ox',
  publicKey: 'Exs08gCBVmPBRb82m',

  // Vraca true samo ako su sva tri polja popunjena (templateId jos nije).
  // Dok nije, aplikacija nece pokusavati da salje mejl (samo upozori u konzoli).
  popunjeno(): boolean {
    return (
      !this.serviceId.startsWith('OVDE') &&
      !this.templateId.startsWith('OVDE') &&
      !this.publicKey.startsWith('OVDE')
    );
  },
};
