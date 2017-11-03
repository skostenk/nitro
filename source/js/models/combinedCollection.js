import SyncQueue from '../models/syncQueue.js'
import SyncGet from '../models/syncGet.js'
import Events from './events.js'
import { ListsCollection } from './listsCollection.js'
import { TasksCollection } from './tasksCollection.js'
import authenticationStore from '../stores/auth.js'
import { log } from '../helpers/logger.js'

// helpers
export class combined extends Events {
  constructor(props) {
    super(props)
    // sets up the syncs here, just for greater control
    // also reduces dependencies
    this.listsQueue = new SyncQueue({
      identifier: 'lists',
      endpoint: 'lists',
      arrayParam: 'lists',
      model: ListsCollection,
      serverParams: ['name', 'notes']
    })
    ListsCollection.setSync(this.listsQueue)
    this.tasksQueue = new SyncQueue({
      identifier: 'tasks',
      endpoint: 'lists',
      arrayParam: 'tasks',
      parentModel: ListsCollection,
      model: TasksCollection,
      serverParams: ['name', 'notes']
    })
    TasksCollection.setSync(this.tasksQueue)

    this.syncGet = new SyncGet({
      lists: ListsCollection,
      tasks: TasksCollection
    })

    const handleProcess = function() {
      if (authenticationStore.isSignedIn()) {
        log('requested process: implement scheduler')
        this.processQueue()
      }
    }

    this.listsQueue.bind('request-process', handleProcess)
    this.tasksQueue.bind('request-process', handleProcess)

    authenticationStore.bind('token', this.downloadData)
    TasksCollection.bind('update', this.update('tasks'))
    ListsCollection.bind('update', this.update('lists'))
  }
  update(key) {
    return () => {
      this.trigger('update', key)
    }
  }
  downloadData = () => {
    this.syncGet.downloadLists().then((data) => {
      this.syncGet.updateLocal(data)
    })
  }
  addTask(task) {
    const list = ListsCollection.find(task.list)
    if (typeof list === 'undefined') {
      throw new Error('List could not be found')
    }
    const order = list.localOrder
    const id = TasksCollection.add(task)
    order.unshift(id)
    this.updateOrder(task.list, order, false)
    return this.getTask(id)
  }
  getTask(id, server) {
    const task = TasksCollection.find(id, server)
    if (typeof task === 'undefined') {
      return null
    }
    return task
  }
  getTasks() {

  }
  deleteTask(task) {
    const order = ListsCollection.find(task.list).localOrder
    order.splice(order.indexOf(task.id), 1)
    this.updateOrder(task.list, order, false)
    TasksCollection.delete(task.id)
  }
  updateOrder(id, order, sync = true) {
    const resource = ListsCollection.find(id)

    // updates the local order, then the server order
    resource.localOrder = order
    resource.order = order.map(localId => {
      return TasksCollection.find(localId).serverId
    }).filter(item => item !== null)
  
    ListsCollection.trigger('order')
    ListsCollection.saveLocal()
    if (sync) ListsCollection.sync.patch(id)
  }
  addList(props, sync) {
    const newList = ListsCollection.add(props, sync)
    return newList.toObject()
  }
  getList(listId, serverId) {
    let list = ListsCollection.find(listId, serverId)
    if (typeof list === 'undefined') {
      return null
    }
    list = list.toObject()
    list.name = ListsCollection.escape(list.name)
    return list
  }
  getLists() {
    const lists = []
    ListsCollection.all().forEach(list => {
      list = list.toObject()
      list.name = ListsCollection.escape(list.name)
      list.count = TasksCollection.findListCount(list.id)
      lists.push(list)
    })
    return lists
  }
  deleteList(list) {
    TasksCollection.deleteAllFromList(list)
    ListsCollection.delete(list)
  }  
}
export let CombinedCollection = new combined()