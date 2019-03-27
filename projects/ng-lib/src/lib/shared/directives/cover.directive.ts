import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[dnlCover]'
})
export class DnlCoverDirective implements OnInit {
  @Input('dnlCover')
  get image(): string { return this._image; }
  set image(image: string) {
    this._image = image;
    if (this.image) {
      const element = this.elementRef.nativeElement;
      this.renderer.setStyle(element, 'background-image', `url(${this.image})`);
    }
  }
  private _image: string;

  constructor(
    private renderer: Renderer2,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
    const element = this.elementRef.nativeElement;
    this.renderer.setStyle(element, 'background-repeat', 'no-repeat');
    this.renderer.setStyle(element, 'background-position', 'center center');
    this.renderer.setStyle(element, 'background-size', 'cover');
  }
}
