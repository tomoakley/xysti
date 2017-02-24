// @flow weak
import React, {Component, PropTypes} from 'react'
import {isNil} from 'ramda'
import svgList from 'app/components/icons'

export default class Svg extends Component {

  static propTypes = {
    width: PropTypes.string,
    height: PropTypes.string,
    type: PropTypes.string
  }

  render() {
    const {type, ...otherProps} = this.props
    if (this.props.height && this.props.width) console.warn(`WARNING: For the SVG '${type}' to scale properly, only one of width or height should be specified.`)
    const svgProps = svgList[type] || {}
    const {
      Icon,
      VP_WIDTH,
      VP_HEIGHT
    } = svgProps
    if (isNil(Icon)) {
      console.warn(`WARNING: No icon found for SVG '${type}'`)
      return null
    }
    const width = this.props.width ? `${this.props.width || ''}px` : null
    const height = this.props.height ? `${this.props.height || ''}px` : null
    const style = {}
    if (width !== null) { style.width = width }
    if (height !== null) { style.height = height }
    return (
      <svg width={width} height={height} viewBox={`0 0 ${VP_WIDTH} ${VP_HEIGHT}`} style={style} {...otherProps}>
        {React.createElement(Icon)}
      </svg>
    )
  }
}

