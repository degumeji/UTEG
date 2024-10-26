import {Injectable} from '@angular/core';
import {environment} from 'src/environments/environment';
import {MatIconRegistry} from "@angular/material/icon";
import {DomSanitizer} from "@angular/platform-browser";
import {ISvgIcons} from '../models/utils';


@Injectable({providedIn: 'root'})
export class IconRegistryService {
  constructor(private matIconRegistry: MatIconRegistry,
              private domSanitizer: DomSanitizer) {
  }

  registerIcons(svgIcons: Array<ISvgIcons>) {
    svgIcons.forEach(icon => {
      this.matIconRegistry.addSvgIcon(icon.iconName,
        this.domSanitizer.bypassSecurityTrustResourceUrl(icon.iconPath)
      );
    })
  }
}
