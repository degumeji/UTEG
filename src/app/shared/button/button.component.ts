import {Component, OnInit, Output, EventEmitter, Input} from '@angular/core';

type EventName = 'onAddCard' | 'onExportCard'; // Add other event names as needed
type IconType = 'image' | 'text'; // Add other icon types as needed

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent implements OnInit {
  @Output() onClick = new EventEmitter<void>();
  @Input() iconType: IconType = 'text';
  @Input() icon: string | null = null;
  @Input() text: string = '';
  @Input() backgroundColor: string = '#70C9BD'; // Default color
  @Input() eventName: EventName = 'onAddCard'; // Default event name
  @Input() hrefUrl: string = ''; // For 'onExportCard' event

  constructor() {
  }

  ngOnInit(): void {
  }

  click(): void {
    this.onClick.emit();
  }
}
