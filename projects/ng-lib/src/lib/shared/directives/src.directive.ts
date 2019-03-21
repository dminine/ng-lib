import { Directive, Renderer2, ElementRef, Input } from '@angular/core';
import { imageMagnificationReplacer } from '../../core';

@Directive({
  selector: '[dnlSrc]'
})
export class DnlSrcDirective {
  @Input()
  set dnlSrc(src: string) {
    const nativeElement = this.elementRef.nativeElement;
    this.renderer.setAttribute(nativeElement, 'src', src);
    this.renderer.setAttribute(
      nativeElement,
      'srcset',
      `${src} 1x, ${imageMagnificationReplacer(src, 2)} 2x`
    );
  }

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}
}

