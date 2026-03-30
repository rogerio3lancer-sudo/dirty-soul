import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  signal,
  AfterViewInit,
  OnInit,
  Inject,
  PLATFORM_ID,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CarouselModule } from 'primeng/carousel';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MailjetService } from '../services/mail.service';
import { FormsModule } from '@angular/forms';

interface ShowAgenda {
  local: string;
  cidade: string;
  data: string;
  destaque: boolean;
}

@Component({
  selector: 'app-root',
  imports: [CarouselModule, CommonModule, HttpClientModule, FormsModule],
  providers: [MailjetService],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class App implements OnInit, AfterViewInit {
  responsiveOptions: any[] | undefined;
  protected readonly title = signal('Dirty Soul');

  headerPequeno = false;
  menuAberto = false;
  parallaxOffset = 0;

  // Contact form
  public nome = '';
  public email = '';
  public tel = '';
  public mensagem = '';

  // Agenda from JSON
  public agenda: ShowAgenda[] = [];

  private isBrowser: boolean;

  constructor(
    private mailjetService: MailjetService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    this.responsiveOptions = [
      { breakpoint: '1400px', numVisible: 4, numScroll: 1 },
      { breakpoint: '1199px', numVisible: 3, numScroll: 1 },
      { breakpoint: '767px', numVisible: 2, numScroll: 1 },
      { breakpoint: '575px', numVisible: 1, numScroll: 1 },
    ];

    // Load agenda from JSON — only on browser to avoid SSR fetch issues
    if (this.isBrowser) {
      this.http.get<ShowAgenda[]>('assets/data/agenda.json').subscribe({
        next: (data) => {
          this.agenda = data;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Erro ao carregar agenda:', err),
      });
    }
  }

  ngAfterViewInit() {
    if (!this.isBrowser) return;

    // Force scroll to top to prevent PrimeNG carousel from pulling focus/scroll
    window.scrollTo(0, 0);

    // Prevent carousel buttons from stealing focus on init
    setTimeout(() => {
      document.querySelectorAll('.p-carousel-prev, .p-carousel-next').forEach((btn) => {
        (btn as HTMLElement).setAttribute('tabindex', '-1');
      });
    }, 0);

    // Scroll reveal using IntersectionObserver
    setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
      );

      document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    }, 100);
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    if (!this.isBrowser) return;

    const scrollY = window.scrollY || window.pageYOffset;

    // Nav shrink
    this.headerPequeno = scrollY > 100;

    // Close mobile menu on scroll
    if (this.menuAberto && scrollY > 200) {
      this.menuAberto = false;
    }

    // Parallax effect on hero
    this.parallaxOffset = scrollY * 0.35;
  }

  enviar() {
    if (!this.nome || !this.email || !this.mensagem) {
      return;
    }

    console.log('Enviando email...');
    this.mailjetService.sendEmail(this.nome, this.email, this.tel, this.mensagem).subscribe({
      next: (response) => {
        console.log('Email enviado com sucesso!', response);
        // Reset form
        this.nome = '';
        this.email = '';
        this.tel = '';
        this.mensagem = '';
      },
      error: (err) => {
        console.error('Erro ao enviar email:', err);
      },
    });
  }
}
