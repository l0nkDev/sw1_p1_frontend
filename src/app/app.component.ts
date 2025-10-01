import {Component, ViewChild} from '@angular/core';
import {NavbarComponent} from './components/navbar/navbar.component';
import {CanvasComponent} from './components/canvas/canvas.component';

@Component({
  selector: 'app-root',
  imports: [NavbarComponent, CanvasComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'sw1_p1_frontend';
  @ViewChild('canvas') public canvas!: CanvasComponent;
}
