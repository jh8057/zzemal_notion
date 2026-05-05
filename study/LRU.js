//Node
class Node {
  constructor(key, value) {
    this.next = null;
    this.prev = null;
    this.key = key;
    this.value = value;
  }
}

class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.head = new Node(0);
    this.tail = new Node(0);
    this.head.next = this.tail;
    this.tail.prev = this.head;
    this.mapTable = new Map();
  }

  insertHead(node) {
    node.next = this.head.next;
    node.prev = this.head;

    this.head.next.prev = node;
    this.head.next = node;
  }

  remove(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  put(key, value) {
    if (this.mapTable.has(key)) {
      // 존재하면 일단 삭제
      const node = this.mapTable.get(key);
      this.remove(node);
    }

    // 삽입
    const newKey = new Node(key, value);
    this.insertHead(newKey);
    this.mapTable.set(key, newKey);

    // 삭제
    if (this.mapTable.size > this.capacity) {
      this.mapTable.delete(this.tail.prev.key);
      this.remove(this.tail.prev);
    }
  }

  get(key) {
    if (!this.mapTable.has(key)) return null;
    const node = this.mapTable.get(key);

    this.remove(node);
    this.insertHead(node);
    return node.value;
  }
}
