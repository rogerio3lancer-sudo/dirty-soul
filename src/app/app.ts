import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, HostListener, signal } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient, HttpClientModule, HttpHeaders, provideHttpClient } from '@angular/common/http';
import { MailjetService } from '../services/mail.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [CarouselModule, CommonModule, HttpClientModule, FormsModule],
  providers: [MailjetService],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class App {
  responsiveOptions: any[] | undefined;

  protected readonly title = signal('Dirty Soul');
  headerPequeno: boolean = false;

  public nome = '';
  public email = '';
  public tel = '';
  public mensagem = '';

  constructor(private mailjetService: MailjetService) {}

  ngOnInit() {
    this.responsiveOptions = [
      {
        breakpoint: '1400px',
        numVisible: 2,
        numScroll: 1,
      },
      {
        breakpoint: '1199px',
        numVisible: 3,
        numScroll: 1,
      },
      {
        breakpoint: '767px',
        numVisible: 2,
        numScroll: 1,
      },
      {
        breakpoint: '575px',
        numVisible: 1,
        numScroll: 1,
      },
    ];
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(event: Event) {
    if (window.pageYOffset > 450) {
      this.headerPequeno = true;
    } else {
      this.headerPequeno = false;
    }
  }

  enviar() {
    console.log('Enviando email...');

    this.mailjetService.sendEmail(this.nome, this.email, this.tel, this.mensagem).subscribe({
      next: (response) => {
        console.log('Email enviado com sucesso!', response);
      },
      error: (err) => {
        console.error('Erro ao enviar email:', err);
      },
    });
  }
}
