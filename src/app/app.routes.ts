import { Routes } from '@angular/router';
import { CanvasComponent } from './components/ej2canvas/canvas.component';

export const routes: Routes = [
  { path: '', component: CanvasComponent },
  { path: 'session/:id', component: CanvasComponent },
];
