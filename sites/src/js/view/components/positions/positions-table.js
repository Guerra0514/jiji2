import React                   from "react"
import MUI                     from "material-ui"
import AbstractComponent       from "../widgets/abstract-component"
import LoadingImage            from "../widgets/loading-image"
import PositionColumns         from "../../../viewmodel/positions/position-columns"
import DownloadPositionsDialog from "./download-positions-dialog"

const Table        = MUI.Table;
const FlatButton   = MUI.FlatButton;
const IconButton   = MUI.IconButton;
const FontIcon     = MUI.FontIcon;

const defaultSortOrder = {
  order:     "profit_or_loss",
  direction: "desc"
};

const keys = new Set([
  "items", "sortOrder", "hasNext", "hasPrev"
]);
const selectionKeys = new Set([
  "selectedId"
]);

export default class PositionsTable extends AbstractComponent {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    this.registerPropertyChangeListener(this.props.model, keys);
    this.registerPropertyChangeListener(this.props.selectionModel, selectionKeys);
    const state = Object.assign(
      this.collectInitialState(this.props.model, keys),
      this.collectInitialState(this.props.selectionModel, selectionKeys));
    this.setState(state);
  }

  render() {
    const headers       = this.createHeaderContent();
    const body          = this.createBodyContent();
    const loading       = this.createLoading();
    const actionContent = this.createActionContent();
    return (
      <div className="positions-table">
        <div className="actions">
          {actionContent}
        </div>
        <table>
          <thead>
            <tr>{headers}</tr>
          </thead>
          <tbody>
            {body}
          </tbody>
        </table>
        {loading}
        <DownloadPositionsDialog
          ref="downloadDialog"
          model={this.props.downloadModel} />
      </div>
    );
  }

  createActionContent() {
    const prev = () => this.props.model.prev();
    const next = () => this.props.model.next();
    return [
      <div className="left">
        <FlatButton
          label="CSV形式でダウンロード..."
          onClick={()=> this.refs.downloadDialog.show()}>
          <FontIcon className="md-navigate-before"/>
        </FlatButton>
      </div>,
      <div className="right">
        <IconButton
          key="prev"
          tooltip={"前の" + this.props.model.pageSize +  "件"}
          disabled={this.state.loading || !this.state.hasPrev}
          onClick={prev}>
          <FontIcon className="md-navigate-before"/>
        </IconButton>
        <IconButton
          key="next"
          tooltip={"次の" + this.props.model.pageSize +  "件"}
          disabled={this.state.loading || !this.state.hasNext}
          onClick={next}>
          <FontIcon className="md-navigate-next"/>
        </IconButton>
      </div>
    ];
  }

  createHeaderContent() {
    return PositionColumns.map((column) => {
      const isCurrentSortKey = this.state.sortOrder.order === column.sort;
      const onClick = (e) => this.onHeaderTapped(e, column);
      const orderMark = isCurrentSortKey
        ? (this.state.sortOrder.direction === "asc" ? "▲" : "▼")
        : "";
      return <th
        className={column.id + (isCurrentSortKey ? " sortBy" : "")}
        key={column.id}>
        <a alt={column.name} onClick={onClick}>
          {column.name + " " + orderMark}
        </a>
      </th>;
    });
  }

  createBodyContent() {
    if (!this.state.items) return null;
    return this.state.items.map((item) => {
      const onClick  = (ev) => this.onItemTapped(ev, item);
      const selected = item.id === this.state.selectedId;
      return <tr
          key={item.id}
          className={selected ? "selected" : ""}
          onClick={onClick}>
          {this.createRow(item)}
        </tr>;
    });
  }
  createRow(item) {
    return PositionColumns.map((column) => {
      let content = item[column.key];
      if (column.formatter) content = column.formatter(content, item);
      return <td className={column.id} key={column.id}>
              {content}
             </td>;
    });
  }

  createLoading() {
    if (this.state.items == null) {
      return <div className="center-information loading"><LoadingImage /></div>;
    }
    if (this.state.items.length <= 0) {
      return <div className="center-information">建玉はありません</div>;
    }
    return null;
  }

  onItemTapped(ev, position) {
    if ( this.props.onItemTapped ) {
      this.props.onItemTapped(ev, position);
    } else {
      this.context.router.transitionTo("/rmt/positions/"+position.id);
    }
    ev.preventDefault();
  }
  onHeaderTapped(e, column) {
    const isCurrentSortKey = this.state.sortOrder.order === column.sort;
    const direction = isCurrentSortKey
      ? (this.state.sortOrder.direction === "asc" ? "desc" : "asc")
      : "asc";
    this.props.model.sortBy({
      order:     column.sort,
      direction: direction
    });
  }
}
PositionsTable.propTypes = {
  model: React.PropTypes.object,
  downloadModel: React.PropTypes.object,
  onItemTapped: React.PropTypes.func
};
PositionsTable.defaultProps = {
  model: null,
  downloadModel: null,
  onItemTapped: null
};
PositionsTable.contextTypes = {
  router: React.PropTypes.func,
  windowResizeManager: React.PropTypes.object
};
