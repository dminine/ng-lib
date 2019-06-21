import { Output, EventEmitter, Input } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { BehaviorSubject } from 'rxjs';
import { DnlBaseEntity, DnlFilter, DnlFilterComparison, DnlSort } from '../akita';

export abstract class TableAllBaseComponent<E extends DnlBaseEntity> {
  @Input()
  get entities(): E[] { return this._entities; }
  set entities(entities: E[]) {
    if (entities) {
      this._entities = entities;
      this.dataSource.next(entities);
      this.checkedAll = false;
      this.checkedAny = false;
      this.checkedList = new Array(entities.length).fill(false);
    }
  }
  private _entities: E[];

  @Output() checkChange = new EventEmitter<E[]>();
  @Output() filtersChange = new EventEmitter<DnlFilter[]>();
  @Output() sortsChange = new EventEmitter<DnlSort[]>();

  dataSource = new BehaviorSubject<E[]>([]);
  checkedList: boolean[] = [];
  checkedAll = false;
  checkedAny = false;

  filters: DnlFilter[] = [];
  sorts: DnlSort[] = [];

  protected constructor(
    public displayedColumns: string[]
  ) {}

  onTotalCheckChange(checked: boolean) {
    this.checkedList.fill(checked);
    this.emitCheckChange();
  }

  onCheckChange(index: number, checked: boolean) {
    this.checkedList[index] = checked;

    if (this.checkedList.every(c => c)) {
      this.checkedAll = true;
      this.checkedAny = false;

    } else if (this.checkedList.includes(true)) {
      this.checkedAll = false;
      this.checkedAny = true;

    } else {
      this.checkedAll = false;
      this.checkedAny = false;
    }
    this.emitCheckChange();
  }

  onFilter(field: string, comparison: DnlFilterComparison, value: any) {
    const index = this.filters.findIndex(s => s.field === field);

    if (index > -1) {
      if (value) {
        this.filters[index].value = value;
      } else {
        this.filters.splice(index, 1);
      }

    } else {
      if (value) {
        this.filters.push({ field, comparison, value });
      } else {
        return;
      }
    }

    this.filtersChange.emit(this.filters);
  }

  onSort(sort: Sort) {
    const field = sort.active;
    const direction = sort.direction;

    if (direction === '') {
      this.sorts = [];
    } else {
      this.sorts[0] = { field, direction };
    }

    this.sortsChange.emit(this.sorts);
  }

  onCheckboxClicked(event: MouseEvent) {
    event.stopPropagation();
  }

  trackByFn(index: number, entity: E) {
    return entity.id;
  }

  private emitCheckChange() {
    this.checkChange.emit(
      this.entities.filter((entity, index) => this.checkedList[index])
    );
  }
}
