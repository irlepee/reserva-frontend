import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/authService';

@Component({
  selector: 'app-verify-email',
  imports: [CommonModule],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.css',
})
export class VerifyEmailComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  isLoading: boolean = true;
  isSuccess: boolean = false;
  isError: boolean = false;
  errorMessage: string = '';
  email: string = '';

  ngOnInit() {
    this.verifyEmail();
  }

  verifyEmail() {
    const token = new URLSearchParams(window.location.search).get('token');
    console.log('Token extraído:', token);

    if (!token) {
      console.error('No se proporcionó token');
      this.handleError('Token no proporcionado. Verifica el enlace de verificación.');
      return;
    }

    console.log('Llamando a verifyEmail con token:', token);
    this.authService.verifyEmail(token)
      .then((response: any) => {
        console.log('Respuesta del servidor:', response);
        this.isSuccess = true;
        this.isLoading = false;
        this.email = response.email || '';
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          this.router.navigate(['/auth']);
        }, 3000);
      })
      .catch((error: any) => {
        console.error('Error en verifyEmail:', error);
        const message = error?.error?.message || 'Error al verificar el email. Intenta nuevamente.';
        this.handleError(message);
      });
  }

  private handleError(message: string) {
    this.isError = true;
    this.isLoading = false;
    this.errorMessage = message;
  }

  goToLogin() {
    this.router.navigate(['/auth']);
  }
}
