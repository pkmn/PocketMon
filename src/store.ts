export class Store {
  readonly name: Readonly<{store: string; db: string}>;
  private readonly db: Promise<IDBDatabase>;

  constructor(db = 'db', store = 'store') {
    this.name = {db, store};
    this.db = new Promise((resolve, reject) => {
      const open = indexedDB.open(this.name.db, 1);
      open.onerror = () => reject(open.error);
      open.onsuccess = () => resolve(open.result);
      open.onupgradeneeded = () => {
        open.result.createObjectStore(this.name.store);
      };
    });
  }

  get<T>(key: string): Promise<T> {
    let req: IDBRequest;
    return this.withIDBStore('readonly', store => {
      req = store.get(key);
    }).then(() => req.result);
  }

  set<T>(key: string, value: T): Promise<void> {
    return this.withIDBStore('readwrite', store => {
      store.put(value, key);
    });
  }

  private withIDBStore(
    type: IDBTransactionMode,
    callback: (store: IDBObjectStore) => void
  ): Promise<void> {
    return this.db.then(
      db =>
        new Promise<void>((resolve, reject) => {
          const transaction = db.transaction(this.name.store, type);
          transaction.oncomplete = () => resolve();
          transaction.onabort = transaction.onerror = () => reject(transaction.error);
          callback(transaction.objectStore(this.name.store));
        })
    );
  }
}
