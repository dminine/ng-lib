import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DnlCoverDirective } from './directives/cover.directive';
import { DnlSrcDirective } from './directives/src.directive';
import { DnlEllipsisPipe } from './pipes/ellipsis.pipe';

@NgModule({
  declarations: [DnlCoverDirective, DnlSrcDirective, DnlEllipsisPipe],
  imports: [
    CommonModule
  ],
  exports: [DnlCoverDirective, DnlSrcDirective, DnlEllipsisPipe]
})
export class DnlSharedModule { }
