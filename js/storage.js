export function getLocalStorageItem(item) {
  const value = window.localStorage.getItem(item);
  try {
    return JSON.parse(value) || {};
  } catch (e) {
    console.error('Failed to parse JSON', e);
    return {};
  }
};

export function setLocalStorageItem(item, value) {
  return window.localStorage.setItem(`${item}`, JSON.stringify(value));
};

export function clearLocalStorage() {
  return window.localStorage.clear();
}

class LocalStorage {
  constructor(storage_name) {
    this.storage_name = storage_name;
  }
  get() {
    const items = getLocalStorageItem(this.storage_name);
    return items
  }
  set(items) {
    setLocalStorageItem(this.storage_name, items);
  }
  update(id, items) {
    const memos = this.get();
    memos[id] = { ...memos[id], ...items };
    this.set(memos);
  }
}

export class Config extends LocalStorage {
  constructor(...args) {
    super(...args);
  }
  darkmode() {
    this.set("dark");
  }
  lightmode() {
    this.set("light");
  }
}

export class MemoStorage extends LocalStorage {
  constructor(...args) {
    super(...args);
  }
 
  newMemo(id, top, left, width, height, project_id) {
    this.update(id, {
      text: null,
      position: { top, left },
      size: { width, height },
      projectId: project_id
    });
  }

  newValue(id, input_text) {
    this.update(id, { text: input_text });
  }

  newPosition(id, top, left) {
    this.update(id, { position: { top, left } });
  }

  newSize(id, width, height) {
    this.update(id, { size: { width, height } });
  }

  remove(id) {
    const memos = this.get();
    delete memos[id];
    this.set(memos);
  }
}





export function downloadLocalStorage() {
  const storageContent = JSON.stringify(window.localStorage);
  const blob = new Blob([storageContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'localStorage.txt';
  a.click();
  URL.revokeObjectURL(url);
}






/*

const dbPromise = idb.openDB('memos-db', 1, {
  upgrade(db) {
    db.createObjectStore('memos');
  },
});

export class MemoStorage {
  constructor() {}

  async get(id) {
    return (await dbPromise).get('memos', id);
  }

  async set(id, changes) {
    const memo = await this.get(id) || {};
    const updatedMemo = { ...memo, ...changes };
    (await dbPromise).put('memos', updatedMemo, id);
  }

  async newMemo(id, top, left, width, height, project_id) {
    await this.set(id, {
      text: null,
      position: { top, left },
      size: { width, height },
      projectId: project_id,
    });
  }

  async newValue(id, input_text) {
    await this.set(id, { text: input_text });
  }

  async newPosition(id, top, left) {
    await this.set(id, { position: { top, left } });
  }

  async newSize(id, width, height) {
    await this.set(id, { size: { width, height } });
  }

  async remove(id) {
    (await dbPromise).delete('memos', id);
  }
}

 



/*export function newValue(id, input_text) {
  const memos = getLocalStorageItem(ENDPOINT);
  memos[id] = { ...memos[id], text: input_text };
  setLocalStorageItem(ENDPOINT, memos);
}

export function newPosition(id, top, left) {
  const memos = getLocalStorageItem(ENDPOINT);
  memos[id] = { ...memos[id], position: { top, left } };
  setLocalStorageItem(ENDPOINT, memos);
}

export function newSize(id, width, height) {
  const memos = getLocalStorageItem(ENDPOINT);
  memos[id] = { ...memos[id], size: { width, height } };
  setLocalStorageItem(ENDPOINT, memos);
}

export function delete_memo(id) { // original
  // const id = e.target.parentNode.dataset.id;
  const memos = getLocalStorageItem(ENDPOINT);
  delete memos[id];
  setLocalStorageItem(ENDPOINT, memos);
}

// new_value(id -> bool) new_position( (id,left,top) -> pos{x,y}) new_size( (id,width,height) -> {})

/*
class Memo {
    constructor(height, width) {
        this.height = height;
        this.width = width;
    }
} */



// クラス化しても良さそう

// 1プロジェクトにつき1ボード？
// >> [ /command  ]
// >> board new "boardname" でプロジェクト追加
// >> board export

// class Project
// class Board

// 基本的に　project_id ごとに取得する。
// そのなかで各memoはparent_idをもつ。

// textarea -> contentEditableにする。