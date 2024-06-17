import { Observable } from 'rxjs';
import firebase from 'firebase/app';
import { map } from 'rxjs/operators';
import { AngularFirestore, CollectionReference } from '@angular/fire/firestore';

import { Base } from '../../models/base';

import { UtilService } from '../util.service';
import { DocumentNotFoundError } from 'src/app/exceptions/document-not-found-error';

export class FirebaseWhere {
  value: any;
  field: string;
  operator: firebase.firestore.WhereFilterOp;

  constructor(field: string, operator: firebase.firestore.WhereFilterOp, value: any) {
    this.field = field;
    this.value = value;
    this.operator = operator;
  }
}

export interface DocumentObservable<T extends Base> {
  type: 'added' | 'removed' | 'modified';
  newIndex: number;
  oldIndex: number;
  data: T;
}

export abstract class FirebaseAbstract<T extends Base> {

  constructor(
    protected db: AngularFirestore,
    protected collectionName: string
  ) { }

  get collectionPath(): string {
    return this.collectionName;
  }

  async add(data: T): Promise<string> {
    const object = this.cloneObject(data);

    object.createdAt = this.timestamp;
    object.updatedAt = null;
    object.deletedAt = null;
    delete object.id;

    return this.collection().add(object).then(doc => doc.id);
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    const object = this.cloneObject(data);
    object.updatedAt = this.timestamp;
    object.deletedAt = null;
    delete object.id;
    delete object.createdAt;

    return this.collection().doc(id).update(object);
  }

  async save(data: T): Promise<string | void> {
    if (!data.id) return this.add(data);
    return this.update(data.id, data);
  }

  set(id: string, data: Partial<T>): Promise<void> {
    const object = this.cloneObject(data);

    object.createdAt = this.timestamp;
    object.updatedAt = null;
    object.deletedAt = null;
    delete object.id;

    return this.collection().doc(id).set(object);
  }

  async softDelete(id: string, deleted: boolean): Promise<void> {
    const data = { deletedAt: deleted ? this.timestamp : null };
    return this.collection().doc(id).update(data);
  }

  async delete(id: string, real?: boolean): Promise<void> {
    if (real) return this.collection().doc(id).delete();
    return this.softDelete(id, true);
  }

  async getById(id: string): Promise<T> {
    const doc = await this.collection().doc(id).get();
    if (!doc.exists) throw new DocumentNotFoundError(id);
    return this.toObject(doc);
  }

  getAsyncById(id: string): Observable<T> {
    return this.db
      .doc<T>(`${this.collectionPath}/${id}`)
      .snapshotChanges()
      .pipe(map(({ payload }) => (payload.exists ? this.toObject(payload) : null)));
  }

  async getAll(orderBy?: string, orderDirection?: firebase.firestore.OrderByDirection, limit?: number): Promise<T[]> {
    if (orderBy && limit) {
      const { docs } = await this.collection().orderBy(orderBy, orderDirection).limit(limit).get();
      return docs.map(doc => this.toObject(doc));
    } else if (orderBy) {
      const { docs } = await this.collection().orderBy(orderBy, orderDirection).get();
      return docs.map(doc => this.toObject(doc));
    } else if (limit) {
      const { docs } = await this.collection().limit(limit).get();
      return docs.map(doc => this.toObject(doc));
    } else {
      const { docs } = await this.collection().get();
      return docs.map(doc => this.toObject(doc));
    }
  }

  async getAllActive(orderBy?: string, orderDirection?: firebase.firestore.OrderByDirection, limit?: number): Promise<T[]> {
    let query = this.collection().where('deletedAt', '==', null);
    if (orderBy) query = query.orderBy(orderBy, orderDirection);
    if (limit) query = query.limit(limit);

    const { docs } = await query.get();
    return docs.map(doc => this.toObject(doc));
  }

  getAsyncAll(
    orderBy?: string,
    orderDirection?: firebase.firestore.OrderByDirection,
    limit?: number
  ): Observable<DocumentObservable<T>[]> {
    return this.db
      .collection<T>(this.collectionPath, ref => {
        if (orderBy && limit) return ref.orderBy(orderBy, orderDirection).limit(limit);
        else if (orderBy) return ref.orderBy(orderBy, orderDirection);
        else if (limit) return ref.limit(limit);
        else return ref;
      })
      .stateChanges()
      .pipe(
        map(data =>
          data.map(({ type, payload: { doc, newIndex, oldIndex } }) => ({
            type,
            newIndex,
            oldIndex,
            data: this.toObject(doc)
          }))
        )
      );
  }

  async getWhere(
    field: string, operator: firebase.firestore.WhereFilterOp, value: any,
    orderBy?: string, orderDirection?: firebase.firestore.OrderByDirection, limit?: number
  ): Promise<T[]> {
    let query = this.collection().where(field, operator, value);

    if (orderBy) query = query.orderBy(orderBy, orderDirection);
    if (limit) query = query.limit(limit);

    const { docs } = await query.get();
    return docs.map(doc => this.toObject(doc));
  }

  getAsyncWhere(
    field: string, operator: firebase.firestore.WhereFilterOp, value: any, limit?: number
  ): Observable<DocumentObservable<T>[]> {
    return this.db
      .collection<T>(this.collectionPath, ref => {
        let query = ref.where(field, operator, value);
        if (limit) query = query.limit(limit);
        return query;
      })
      .stateChanges()
      .pipe(
        map(data =>
          data.map(({ type, payload: { doc, newIndex, oldIndex } }) => ({
            type,
            newIndex,
            oldIndex,
            data: this.toObject(doc)
          }))
        )
      );
  }

  async getWhereMany(
    filters: FirebaseWhere[],
    orderBy?: string, orderDirection?: firebase.firestore.OrderByDirection, limit?: number
  ): Promise<T[]> {
    filters = Object.assign([], filters);
    let query = this.collection().where(filters[0].field, filters[0].operator, filters[0].value);

    filters.splice(0, 1);

    for (const filter of filters) query = query.where(filter.field, filter.operator, filter.value);

    if (orderBy) query = query.orderBy(orderBy, orderDirection);
    if (limit) query = query.limit(limit);

    const { docs } = await query.get();
    return docs.map(doc => this.toObject(doc));
  }

  getAsyncWhereMany(
    filters: FirebaseWhere[],
    orderBy?: string, orderDirection?: firebase.firestore.OrderByDirection, limit?: number
  ): Observable<DocumentObservable<T>[]> {
    return this.db
      .collection<T>(this.collectionPath, ref => {
        filters = Object.assign([], filters);
        let query = ref.where(filters[0].field, filters[0].operator, filters[0].value);

        filters.splice(0, 1);

        for (const filter of filters) query = query.where(filter.field, filter.operator, filter.value);

        if (orderBy) query = query.orderBy(orderBy, orderDirection);
        if (limit) query = query.limit(limit);

        return query;
      })
      .stateChanges()
      .pipe(
        map(data =>
          data.map(({ type, payload: { doc, newIndex, oldIndex } }) => ({
            type,
            newIndex,
            oldIndex,
            data: this.toObject(doc)
          }))
        )
      );
  }

  protected collection(): CollectionReference {
    return this.db.firestore.collection(this.collectionPath);
  }

  protected get timestamp(): firebase.firestore.FieldValue {
    return firebase.firestore.FieldValue.serverTimestamp();
  }

  protected toObject(doc: firebase.firestore.DocumentData): T {
    const data = { id: doc.id, ...doc.data() };
    return UtilService.transformTimestampToDate(data);
  }

  private cloneObject(obj: any): any {
    let copy: any;
    if (null == obj || 'object' !== typeof obj) return obj;

    if (obj instanceof firebase.firestore.FieldValue) return obj;
    if (obj instanceof Date) {
      copy = new Date();
      copy.setTime(obj.getTime());
      return copy;
    }

    if (obj instanceof Array) {
      copy = [];
      for (let i = 0, len = obj.length; i < len; i++) copy[i] = this.cloneObject(obj[i]);
      return copy;
    }

    if (obj instanceof Object) {
      copy = {};
      for (const attr in obj) if (obj.hasOwnProperty(attr)) copy[attr] = this.cloneObject(obj[attr]);

      for (const prop in copy) if (copy[prop] === undefined) delete copy[prop];

      return copy;
    }

    throw new Error('The object could not be copied! Type is not supported.');
  }
}
