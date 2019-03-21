import { Input, ViewChildren, AfterViewInit, QueryList } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SubscriptionBaseComponent } from '../core';
import { FormGroupBaseComponent } from './form-group-base.component';

export abstract class FormContainerBaseComponent<T = any>
  extends SubscriptionBaseComponent
  implements AfterViewInit {
  @Input()
  get doc(): T { return this._doc; }
  set doc(doc: T) {
    this._doc = doc;
    if (this.formGroups) {
      this.distribute();
    }
  }
  protected _doc: T;

  @ViewChildren(FormGroupBaseComponent) formGroups: QueryList<FormGroupBaseComponent<any>>;

  fakeFormGroup = new FormGroup({});
  invalid = true;

  protected valid = [];

  protected constructor() {
    super();
  }

  ngAfterViewInit() {
    this.initValidChange();
    this.initDistribute();
  }

  protected makeDoc(): T {
    const doc: T = {} as T;
    this.formGroups.forEach(formGroup => {
      Object.assign(doc, formGroup.formGroup.value);
    });
    return doc;
  }

  private distribute() {
    this.formGroups.forEach(formGroup => {
      for (const i of Object.keys(formGroup.formGroup.controls)) {
        if (this.doc[i]) {
          formGroup.formGroup.controls[i].setValue(this.doc[i]);
        }
      }
    });
  }

  private initValidChange() {
    this.formGroups.forEach((formGroup, index) => {
      this.subscription.add(
        formGroup.statusChange.asObservable().subscribe(status => {
          this.valid[index] = status === 'VALID';
          this.invalid = this.valid.indexOf(false) > -1;
        })
      );
    });
  }

  private initDistribute() {
    if (this.doc) {
      Promise.resolve(null).then(() => {
        this.distribute();
      });
    }
  }
}
