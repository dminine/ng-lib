import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DnlCoverDirective } from './directives/cover.directive';
import { DnlSrcDirective } from './directives/src.directive';
import { DnlEllipsisPipe } from './pipes/ellipsis.pipe';
import { BackDirective } from './directives/back.directive';

@NgModule({
  declarations: [DnlCoverDirective, DnlSrcDirective, DnlEllipsisPipe, BackDirective],
  imports: [
    CommonModule
  ],
  exports: [DnlCoverDirective, DnlSrcDirective, DnlEllipsisPipe, BackDirective]
})
export class DnlSharedModule { }
