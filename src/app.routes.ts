import { Routes } from '@angular/router';
import { PresenterComponent } from './components/presenter/presenter.component';
import { VoterComponent } from './components/voter/voter.component';

export const APP_ROUTES: Routes = [
  {
    path: '',
    component: PresenterComponent,
    title: 'Encuesta en Vivo - Vista del Presentador',
  },
  {
    path: 'vote/:pollId',
    component: VoterComponent,
    title: 'Encuesta en Vivo - Votar',
  },
  {
    path: '**',
    redirectTo: '',
  },
];