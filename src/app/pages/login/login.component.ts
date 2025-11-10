import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
loginForm: FormGroup;
  // Puedes usar una variable para manejar errores o estados de carga
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder) {
    // Inicialización del formulario con el FormBuilder
    this.loginForm = this.fb.group({
      email: [
        '', // Valor inicial
        [Validators.required, Validators.email] // Validadores
      ],
      password: [
        '', // Valor inicial
        [Validators.required, Validators.minLength(6)] // Validadores
      ]
    });
  }

  ngOnInit(): void {
    // Aquí puedes realizar tareas de inicialización si es necesario
  }

  /**
   * Maneja el envío del formulario.
   */
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = null;

      const { email, password } = this.loginForm.value;

      console.log('Datos de Login:', email, password);

      // --- SIMULACIÓN DE LLAMADA ASÍNCRONA (Reemplazar con tu lógica de servicio) ---
      setTimeout(() => {
        this.isLoading = false;
        // Simular un login exitoso
        if (email === 'test@example.com' && password === 'password') {
          console.log('Login exitoso. Redirigir.');
          // Aquí iría la lógica de autenticación y navegación
        } else {
          // Simular un error de credenciales
          this.errorMessage = 'Credenciales no válidas. Inténtalo de nuevo.';
          this.loginForm.reset(); // Opcional: limpiar campos
        }
      }, 1500);
      // ----------------------------------------------------------------------------

    } else {
      console.log('Formulario no válido. Revisar campos.');
      // Opcional: Marcar todos los campos como 'touched' para mostrar los errores inmediatamente
      this.loginForm.markAllAsTouched();
    }
  }

}
