import ContainerJS         from "container-js"
import Observable          from "../../utils/observable"

export default class NotificationsPageModel extends Observable {

  constructor() {
    super();
    this.viewModelFactory = ContainerJS.Inject;
  }

  postCreate() {
    this.notificationsTable =
      this.viewModelFactory.createNotificationsTableModel(100);
  }

  initialize( ) {
    this.notificationsTable.initialize();
    this.notificationsTable.load();
  }

}
