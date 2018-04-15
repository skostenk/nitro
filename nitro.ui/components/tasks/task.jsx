import React from 'react'
import PropTypes from 'prop-types'
import { View, Text, StyleSheet } from 'react-native'
import { Draggable } from 'react-beautiful-dnd'
import { withRouter } from 'react-router-dom'

import { vars } from '../../styles.js'
import { Link } from '../link.jsx'

class TaskComponent extends React.Component {
  constructor(props) {
    super(props)
    this.viewRef = React.createRef()
  }
  componentDidMount() {
    this.triggerPosition()
  }
  componentWillReceiveProps(newProps) {
    if (newProps.selected !== this.props.selected) {
      this.triggerPosition(newProps)
    }
  }
  triggerPosition = (newProps = this.props) => {
    if (newProps.selected) {
      this.viewRef.current.measure((x, y, width, height, pageX, pageY) => {
        newProps.selectedCallback(y, pageY)
      })
    }
  }
  triggerClick = () => {
    const url = `/${this.props.listId}/${this.props.data.id}`
    this.props.history.push(url)
  }
  render() {
    const item = this.props.data
    const innerStyles = {}
    if (this.props.selectedHeight > 0) {
      innerStyles.height = this.props.selectedHeight
    }
    return (
      <Draggable draggableId={item.id} index={this.props.index}>
        {(provided, snapshot) => (
          <View onClick={this.triggerClick} ref={this.viewRef}>
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              style={getItemStyle(
                snapshot.isDragging,
                provided.draggableProps.style
              )}
            >
              <View style={innerStyles}>
                <Text style={styles.text}>{this.props.data.name}</Text>
              </View>
            </div>
            {provided.placeholder}
          </View>
        )}
      </Draggable>
    )
  }
}
TaskComponent.propTypes = {
  index: PropTypes.number,
  listId: PropTypes.string,
  data: PropTypes.object
}
const styles = StyleSheet.create({
  text: {
    fontSize: vars.taskFontSize,
    lineHeight: vars.taskHeight,
    color: vars.taskTextColor
  }
})
const getItemStyle = (isDragging, draggableStyle) => {
  return {
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',
    paddingLeft: vars.padding / 2,
    paddingRight: vars.padding / 2,
    borderRadius: isDragging ? 3 : 0,

    // change background colour if dragging
    background: isDragging ? vars.dragColor : '',

    // styles we need to apply on draggables
    ...draggableStyle
  }
}

export const Task = withRouter(TaskComponent)
