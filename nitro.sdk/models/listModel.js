const mutableSettings = {
  inbox: ['no-rename'],
  today: ['no-rename', 'no-order', 'no-headings'],
  next: ['no-rename', 'no-order', 'no-headings'],
  all: ['no-rename', 'no-order']
}

export default class List {
  constructor(props) {
    this.id = props.id
    this.name = props.name
    this.notes = props.notes || null
    this.serverId = props.serverId || null
    this.lastSync = props.lastSync || null
    this.order = props.order || []
    this.localOrder = props.localOrder || []
    this.sort = props.sort || null
    this.clientUpdate = props.clientUpdate || new Date()
    this.virtual = props.virtual || false
  }
  toObject() {
    return {
      id: this.id,
      name: this.name,
      notes: this.notes,
      mutable: mutableSettings[this.id] || [],
      serverId: this.serverId,
      lastSync: this.lastSync,
      order: this.order,
      localOrder: this.localOrder,
      sort: this.sort,
      clientUpdate: this.clientUpdate,
      virtual: this.virtual
    }
  }
}
