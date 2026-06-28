import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';
import { RedirectService } from '../../services/redirect.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly redirect = inject(RedirectService);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly hidePassword = signal(true);

  loginForm: FormGroup = this.fb.group({
    usuario: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit(): void {
    // Si ya hay sesión activa, no tiene sentido mostrar el login.
    if (this.auth.isAuthenticated()) {
      this.redirectAfterLogin();
    }
  }

  togglePassword(): void {
    this.hidePassword.update((hidden) => !hidden);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.auth.login(this.loginForm.getRawValue()).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.redirectAfterLogin();
      },
      error: (err) => {
        this.isLoading.set(false);
        // El backend devuelve 404 (usuario inexistente) o 401 (contraseña incorrecta).
        this.errorMessage.set(
          err?.status === 401 || err?.status === 404
            ? 'Usuario o contraseña incorrectos. Inténtalo de nuevo.'
            : 'No se pudo iniciar sesión. Verifica tu conexión.',
        );
        this.loginForm.get('password')?.reset();
      },
    });
  }

  private redirectAfterLogin(): void {
    const target = this.redirect.consume() || '/scale';
    this.router.navigateByUrl(target);
  }
}
