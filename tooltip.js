class Tooltip {
  constructor(selection) {
    this.selection = selection;
    this.selectionString = selection.toString().trim();
    this.arrowHorizontalRelativeDistance = 10;
    this.tooltipHorizontalPostion = this.centerArrowInsideSelection();
    this.tooltipVerticalPosition = this.placeTooltipUnderSelection();
    this.isArrowInTheLeftSide = this.tooltipHorizontalPostion.right === 'auto';
  }

  centerArrowInsideSelection() {
    let { x, _y, width, _height } = this.selection.getRangeAt(0).getBoundingClientRect();
    let windowWidth = $(window).width();
    let arrowWidth = parseInt($('.jisho-arrow').css('borderLeft')) + parseInt($('.jisho-arrow').css('borderRight'));
    let arrowChopToTooltipDistance = this.arrowHorizontalRelativeDistance + arrowWidth / 2;
    let tooltipLeftPosition = Math.max(x + width / 2 - arrowChopToTooltipDistance, 0);
    let tooltipRightPosition = Math.max(windowWidth - tooltipLeftPosition - arrowChopToTooltipDistance * 2, 0);
    let tooltipMaxWidth = parseInt($('.translate').css('maxWidth'));

    if (tooltipLeftPosition + tooltipMaxWidth < windowWidth) {
      return { 'left': tooltipLeftPosition, 'right': 'auto' }
    }
    return { 'left': 'auto', 'right': tooltipRightPosition }
  }

  placeTooltipUnderSelection() {
    let { _x, y, _width, height } = this.selection.getRangeAt(0).getBoundingClientRect();
    let arrowHeight = parseInt($('.jisho-arrow').css('borderBottom'))
    let tooltipTopPosition = $(window).scrollTop() + y + height + arrowHeight;
    return { 'top': tooltipTopPosition, 'bottom': 'auto' }
  }

  setTooltipCSS() {
    $('.translate').css(this.tooltipVerticalPosition);
    $('.translate').css(this.tooltipHorizontalPostion);
  }

  setArrowCSS() {
    let arrowPostiton = { 'left': this.arrowHorizontalRelativeDistance, right: 'auto' };
    if (!this.isArrowInTheLeftSide) {
      arrowPostiton = { 'left': 'auto', right: this.arrowHorizontalRelativeDistance }
    }
    $('.jisho-arrow').css(arrowPostiton);
  }
}

Tooltip.showLoading = () => {
  $('.translate').show();
  $('.jisho-loading').show();
  $('.translate-body').hide();
  $('.error').hide();
}
