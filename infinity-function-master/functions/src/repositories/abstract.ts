import { firestore } from 'firebase-admin';

import { Base } from '../models/base';
import { DocumentNotFoundError } from '../exceptions/document-not-found-error';

export class FirebaseWhere {
  value: any;
  field: string;
  operator: FirebaseFirestore.WhereFilterOp;

  constructor(field: string, operator: FirebaseFirestore.WhereFilterOp, value: any) {
    this.field = field;
    this.value = value;
    this.operator = operator;
  }
}

export abstract class FirebaseAbstract<T extends Base> {
  protected db: firestore.Firestore;

  constructor(
    protected collectionName: string,
    protected seeTimestamp: boolean = true,
    protected hasTimestamp: boolean = true
  ) {
    if (!this.seeTimestamp && this.hasTimestamp) {
      throw new Error(
        "'hasTimestamp' is not possible without 'seeTimestamp' as true"
      );
    }

    this.db = new firestore.Firestore();
  }

  public add(data: T) {
    const doc = this.cloneObject(data);

    if (this.seeTimestamp) {
      doc.createdAt = this.timestamp;
      doc.updatedAt = null;
      doc.deletedAt = null;
    }

    delete doc.id;

    return this.collection().add(doc);
  }

  public update(id: string, data: Partial<T>) {
    const doc = this.cloneObject(data);

    if (this.seeTimestamp) {
      doc.updatedAt = this.timestamp;
      delete doc.createdAt;
    }

    delete doc.id;

    return this.collection().doc(id).update(doc);
  }

  public save(item: T) {
    if (!item.id) return this.add(item);
    return this.update(item.id, item);
  }

  public set(data: T, options: FirebaseFirestore.SetOptions = {}) {
    const doc = this.cloneObject(data);

    if (this.seeTimestamp) {
      doc.createdAt = this.timestamp;
      doc.updatedAt = null;
      doc.deletedAt = null;
    }

    delete doc.id;

    return this.collection().doc(data.id).set(doc, options);
  }

  public delete(id: string) {
    return this.collection().doc(id).delete();
  }

  public async getById(id: string): Promise<T> {
    const doc = await this.collection().doc(id).get();

    if (!doc.exists) {
      throw new DocumentNotFoundError();
    }

    return this.toObject(doc);
  }

  public async getAll(orderBy?: string, orderDirection?: FirebaseFirestore.OrderByDirection): Promise<T[]> {
    if (orderBy) {
      const { docs } = await this.collection().orderBy(orderBy, orderDirection).get();
      return docs.map(doc => this.toObject(doc));
    } else {
      const { docs } = await this.collection().get();
      return docs.map(doc => this.toObject(doc));
    }
  }

  async getAllActive(orderBy?: string, orderDirection?: FirebaseFirestore.OrderByDirection): Promise<T[]> {
    if (orderBy) {
      const { docs } = await this.collection().where('deletedAt', '==', null).orderBy(orderBy, orderDirection).get();
      return docs.map(doc => this.toObject(doc));
    } else {
      const { docs } = await this.collection().where('deletedAt', '==', null).get();
      return docs.map(doc => this.toObject(doc));
    }
  }

  public async getWhere(
    field: string, operator: FirebaseFirestore.WhereFilterOp, value: any,
    orderBy?: string, orderDirection?: FirebaseFirestore.OrderByDirection
  ): Promise<T[]> {
    let query = this.collection().where(field, operator, value);
    
    if(orderBy) query = query.orderBy(orderBy, orderDirection);
    
    const { docs } = await query.get();
    return docs.map(doc => this.toObject(doc));
  }

  public async getWhereMany(
    filters: FirebaseWhere[],
    orderBy?: string,
    orderDirection?: FirebaseFirestore.OrderByDirection
  ): Promise<T[]> {
    let query = this.collection().where(filters[0].field, filters[0].operator, filters[0].value);

    filters.splice(0, 1);

    for (const filter of filters) {
      query = query.where(filter.field, filter.operator, filter.value);
    }

    if(orderBy) query = query.orderBy(orderBy, orderDirection);

    const { docs } = await query.get();
    return docs.map(doc => this.toObject(doc));
  }

  public async getLastRegisters(limit: number): Promise<T[]> {
    const query = this.collection().limit(limit);
    const { docs } = await query.orderBy('createdAt', 'desc').get();
    return docs.map(doc => this.toObject(doc));
  }

  public async countAll(): Promise<number> {
    return await this.collection().get().then((snap) => {
      return snap.size;
    })
  }

  protected collection() {
    return this.db.collection(this.collectionName);
  }

  protected get timestamp() {
    return firestore.FieldValue.serverTimestamp();
  }

  protected toObject(document: firestore.DocumentData): T {
    let data = { id: document.id, ...document.data() };

    if (this.hasTimestamp) {
      data = this.transformTimestampToDate(data);
    }

    return data;
  }

  private transformTimestampToDate(obj: any): any {
    if (null === obj || 'object' !== typeof obj) {
      return obj;
    }

    if (obj instanceof firestore.Timestamp) {
      return obj.toDate();
    }

    if (obj instanceof Array) {
      const copy = [];
      for (let i = 0, len = obj.length; i < len; i++) {
        copy[i] = this.transformTimestampToDate(obj[i]);
      }
      return copy;
    }

    if (obj instanceof Object) {
      const copy: any = {};
      for (const attr in obj) {
        if (obj.hasOwnProperty(attr)) {
          copy[attr] = this.transformTimestampToDate(obj[attr]);
        }
      }

      return copy;
    }

    throw new Error(
      'The object could not be transformed! Type is not supported.'
    );
  }

  protected cloneObject(obj: any): any {
    if (null === obj || 'object' !== typeof obj) {
      return obj;
    }

    if (obj instanceof firestore.FieldValue) {
      return obj;
    }

    let copy: any;

    if (obj instanceof Date) {
      copy = new Date();
      copy.setTime(obj.getTime());
      return copy;
    }

    if (obj instanceof Array) {
      copy = [];
      for (let i = 0, len = obj.length; i < len; i++) {
        copy[i] = this.cloneObject(obj[i]);
      }
      return copy;
    }

    if (obj instanceof Object) {
      copy = {};
      for (const attr in obj) {
        if (obj.hasOwnProperty(attr)) {
          copy[attr] = this.cloneObject(obj[attr]);
        }
      }

      for (const prop in copy) {
        if (copy[prop] === undefined) {
          delete copy[prop];
        }
      }

      return copy;
    }

    throw new Error('The object could not be copied! Type is not supported.');
  }
}