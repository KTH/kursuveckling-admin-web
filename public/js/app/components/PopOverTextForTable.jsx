import React, { Component } from 'react'
import { Button, Popover, PopoverHeader, PopoverBody } from 'reactstrap'
import i18n from '../../../../i18n'

const OnlyMobileVisiblePopup = ({ ariaLabel, ariaPressed, popUpHeader, id, onClick }) => {
  const mobilePopoverId = 'mobile-table-header' + popUpHeader + id
  return (
    <span
      className="mobile-header-popovers"
      key={'onlyForMobileView' + popUpHeader + id}
      role="info icon button"
      aria-labelledby={mobilePopoverId}
    >
      <label id={mobilePopoverId} className="d-none d-sm-block d-md-nonee">
        {popUpHeader}
      </label>{' '}
      <Button
        id={id}
        type="button"
        className="mobile btn-info-modal"
        onClick={onClick}
        aria-label={ariaLabel}
        aria-pressed={ariaPressed}
        role="button"
      />
    </span>
  )
}
class ControlledPopover extends Component {
  constructor(props) {
    super(props)
    this.state = { popoverOpen: false }
    this.toggle = this.toggle.bind(this)
  }

  toggle() {
    this.setState(state => ({ popoverOpen: !state.popoverOpen }))
  }

  render() {
    const { cellId, describesId, header, popoverText, popType } = this.props
    const { popoverOpen } = this.state
    const triggerId = `${popType}-popover-${cellId}`
    const dialogHeaderId = `${popType}-dialog-header-${cellId}`
    const dialogBodyId = `${popType}-dialog-header-${cellId}`
    const tableLang = i18n.isSwedish() ? 1 : 0
    const { aria_label_info_icon: ariaLabel, aria_label_close_icon: closeAria } = i18n.messages[
      tableLang
    ].tableHeaders

    return (
      <span role="dialog" aria-labelledby={dialogHeaderId} aria-describedby={dialogBodyId}>
        {(popType === 'mobile' && (
          <OnlyMobileVisiblePopup
            popUpHeader={header}
            id={triggerId}
            onClick={this.toggle}
            ariaLabel={ariaLabel}
            ariaPressed={popoverOpen}
          />
        )) || (
          <Button
            id={triggerId}
            type="button"
            className="desktop btn-info-modal"
            onClick={this.toggle}
            aria-label={ariaLabel}
            aria-pressed={popoverOpen}
            role="button"
          />
        )}
        <Popover
          isOpen={popoverOpen}
          placement={popType === 'mobile' ? 'left' : 'top'}
          target={triggerId}
          key={triggerId}
        >
          <PopoverHeader id={dialogHeaderId}>
            {header}{' '}
            <Button className="close" onClick={this.toggle} aria-label={closeAria}>
              &times;
            </Button>
          </PopoverHeader>
          <PopoverBody id={dialogBodyId}>{popoverText}</PopoverBody>
        </Popover>
      </span>
    )
  }
}

export default ControlledPopover
