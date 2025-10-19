import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { register as registerSwiperElements } from 'swiper/element/bundle';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/interceptors/auth.interceptor';
import { providePrimeNG } from 'primeng/config';
import  LaraLightBlue  from '@primeng/themes/lara';

registerSwiperElements();

const mergedConfig = {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideAnimationsAsync(), // Enables PrimeNG animations
    providePrimeNG({ // Injects LaraLightBlue CSS vars at runtime
      theme: {
        preset: LaraLightBlue,
        options: {
          prefix: 'p', // For p-button, p-calendar, etc.
          darkModeSelector: '.dark', // Matches your Tailwind dark mode
          cssLayer: false // Set true if Tailwind overrides PrimeNG styles
        }
      }
    }),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};

bootstrapApplication(AppComponent, mergedConfig)
  .catch((err) => console.error(err));