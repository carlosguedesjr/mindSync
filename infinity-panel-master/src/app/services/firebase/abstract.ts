import { Observable } from 'rxjs';
import firebase from 'firebase/app';
import { map } from 'rxjs/operators';
import { AngularFirestore, CollectionReference } from '@angular/fire/firestore';

import { Base } from '../../models/base';

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

  async getAll(orderBy?: string, orderDirection?: firebase.firestore.OrderByDirection): Promise<T[]> {
    if (orderBy) {
      const { docs } = await this.collection().orderBy(orderBy, orderDirection).get();
      return docs.map(doc => this.toObject(doc));
    } else {
      const { docs } = await this.collection().get();
      return docs.map(doc => this.toObject(doc));
    }
  }

  async getAllActive(orderBy?: string, orderDirection?: firebase.firestore.OrderByDirection): Promise<T[]> {
    if (orderBy) {
      const { docs } = await this.collection().where('deletedAt', '==', null).orderBy(orderBy, orderDirection).get();
      return docs.map(doc => this.toObject(doc));
    } else {
      const { docs } = await this.collection().where('deletedAt', '==', null).get();
      return docs.map(doc => this.toObject(doc));
    }
  }

  getAsyncAll(
    orderBy?: string,
    orderDirection?: firebase.firestore.OrderByDirection
  ): Observable<DocumentObservable<T>[]> {
    return this.db
      .collection<T>(this.collectionPath, ref => (orderBy ? ref.orderBy(orderBy, orderDirection) : ref))
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
    orderBy?: string, orderDirection?: firebase.firestore.OrderByDirection
  ): Promise<T[]> {
    let query = this.collection().where(field, operator, value);

    if (orderBy) query = query.orderBy(orderBy, orderDirection);

    const { docs } = await query.get();
    return docs.map(doc => this.toObject(doc));
  }

  getAsyncWhere(
    field: string,
    operator: firebase.firestore.WhereFilterOp,
    value: any
  ): Observable<DocumentObservable<T>[]> {
    return this.db
      .collection<T>(this.collectionPath, ref => ref.where(field, operator, value))
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
    orderBy?: string,
    orderDirection?: firebase.firestore.OrderByDirection
  ): Promise<T[]> {
    filters = Object.assign([], filters);
    let query = this.collection().where(filters[0].field, filters[0].operator, filters[0].value);

    filters.splice(0, 1);

    for (const filter of filters) query = query.where(filter.field, filter.operator, filter.value);

    if (orderBy) query = query.orderBy(orderBy, orderDirection);

    const { docs } = await query.get();
    return docs.map(doc => this.toObject(doc));
  }

  getAsyncWhereMany(
    filters: FirebaseWhere[],
    orderBy?: string,
    orderDirection?: firebase.firestore.OrderByDirection
  ): Observable<DocumentObservable<T>[]> {
    return this.db
      .collection<T>(this.collectionPath, ref => {
        filters = Object.assign([], filters);
        let query = ref.where(filters[0].field, filters[0].operator, filters[0].value);

        filters.splice(0, 1);

        for (const filter of filters) query = query.where(filter.field, filter.operator, filter.value);

        if (orderBy) query = query.orderBy(orderBy, orderDirection);

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
    return this.transformTimestampToDate(data);
  }

  private transformTimestampToDate(obj: any): any {
    if (null === obj || 'object' !== typeof obj) return obj;

    if (obj instanceof firebase.firestore.Timestamp) return obj.toDate();

    if (obj instanceof Array) {
      const copy = [];
      for (let i = 0, len = obj.length; i < len; i++) copy[i] = this.transformTimestampToDate(obj[i]);
      return copy;
    }

    if (obj instanceof Object) {
      const copy: any = {};
      for (const attr in obj) if (obj.hasOwnProperty(attr)) copy[attr] = this.transformTimestampToDate(obj[attr]);
      return copy;
    }

    throw new Error('The object could not be transformed! Type is not supported.');
  }

  protected cloneObject(obj: any): any {
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
