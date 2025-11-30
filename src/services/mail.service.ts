import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MailjetService {
  private apiUrl = environment.emailApiUrl;

  // ⚠️ Veja a nota de segurança abaixo. NUNCA exponha sua chave privada no frontend.
  private apiKeyPublic = environment.emailApiKey;
  private apiKeyPrivate = environment.emailSecretKey;

  constructor(private http: HttpClient) {}

  sendEmail(nome: string, email: string, tel: string, mensagem: string): Observable<any> {
    // 1. Defina o corpo da requisição (o JSON do seu -d)
    const body = {
      Messages: [
        {
          From: {
            Email: 'rogerio3lancer@gmail.com',
            Name: 'Banda Dirty Soul',
          },
          To: [
            {
              Email: 'rogerio3lancer@gmail.com',
              Name: 'passenger 1',
            },
          ],
          Subject: 'Contato do Site da Banda',
          TextPart: 'Email enviado do site da banda!',
          HTMLPart: `<h3>Nome: ${nome}</h3><h3>Email: ${email}</h3><h3>Telefone: ${tel}</h3><h3>Mensagem: ${mensagem}</h3>`,
        },
      ],
    };

    // 2. Crie o cabeçalho de Basic Authentication
    // O btoa() codifica "public_key:private_key" para Base64
    const basicAuth = btoa(this.apiKeyPublic + ':' + this.apiKeyPrivate);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + basicAuth,
    });

    // 3. Faça a chamada POST
    return this.http.post(this.apiUrl, body, { headers: headers });
  }
}
