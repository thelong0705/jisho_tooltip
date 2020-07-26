class Tooltip {
  constructor(selection) {
    this.selection = selection;
    this.selectionString = selection.toString().trim();
    if (this.selectionString) {
      this.arrowHorizontalRelativeDistance = 10;
      this.tooltipHorizontalPostion = this.getTooltipHorizontalPosition();
      this.tooltipVerticalPosition = this.getTooltipVerticalPosition();
      this.isArrowInTheLeftSide = this.tooltipHorizontalPostion.right === 'auto';
    }
  }

  getSelectionBoundingRectangle() {
    let { x, y, width, height } = this.selection.getRangeAt(0).getBoundingClientRect();

    //handle highlightext span mulitple lines
    let selectionParentElement = this.selection.anchorNode.parentElement;
    let fontSize = parseInt(
      window.getComputedStyle(selectionParentElement, null)
        .getPropertyValue('font-size')
    );

    if (height > fontSize * 2) { // check span multiple line
      let range = new Range();

      range.setStart(this.selection.anchorNode, this.selection.focusOffset);
      range.setEnd(this.selection.anchorNode, this.selection.focusOffset);
      width = range.getBoundingClientRect().right - $(selectionParentElement).offset().left;
    }
    return { x, y, width, height }
  }


  getTooltipHorizontalPosition() {
    let { x, _y, width, height } = this.getSelectionBoundingRectangle();
    let windowWidth = $(window).width();
    let arrowWidth = parseInt(Tooltip.$tooltipArrow.css('borderLeft')) + parseInt(Tooltip.$tooltipArrow.css('borderRight'));
    let arrowChopToTooltipDistance = this.arrowHorizontalRelativeDistance + arrowWidth / 2;
    let tooltipLeftPosition = Math.max(x + width / 2 - arrowChopToTooltipDistance, 0);
    let tooltipRightPosition = Math.max(windowWidth - tooltipLeftPosition - arrowChopToTooltipDistance * 2, 0);
    let tooltipMaxWidth = parseInt(Tooltip.$tooltip.css('maxWidth'));

    if (tooltipLeftPosition + tooltipMaxWidth < windowWidth) {
      return {
        left: tooltipLeftPosition,
        right: 'auto'
      }
    }
    return {
      left: 'auto',
      right: tooltipRightPosition
    }
  }

  getTooltipVerticalPosition() {
    let { _x, y, _width, height } = this.selection.getRangeAt(0).getBoundingClientRect();
    let arrowHeight = parseInt(Tooltip.$tooltipArrow.css('borderBottom'))
    let tooltipTopPosition = $(window).scrollTop() + y + height + arrowHeight;
    return {
      top: tooltipTopPosition,
      bottom: 'auto'
    }
  }

  async getTranslatedJson() {
    let cors_url = "https://cors-anywhere.herokuapp.com/";
    let jisho_api = "https://jisho.org/api/v1/search/words?keyword=";
    let fetch_url = cors_url + jisho_api + this.selectionString;
    let response = await fetch(fetch_url, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    let responseJson = await response.json();
    return responseJson.data?.[0];
  }

  async setTooltipContent() {
    let translatedJson;
    try {
      translatedJson = await this.getTranslatedJson();
    } catch (error) {
      this.error = "There is something wrong! Check your internet connection";
      return;
    }

    if (!translatedJson) {
      this.wordNotFound = "Can't look up this word"
      return;
    }

    let englishHTML = '<hr>'
    for (let index = 0; index < translatedJson.senses.length; index++) {
      let englishDefinitions = translatedJson.senses[index].english_definitions.join(', ');
      englishHTML += `<p>${index + 1}. ${englishDefinitions}</p>`
    }

    this.englishHTML = englishHTML;
    this.wordHTML = translatedJson.japanese[0].word;
    this.readingHTML = translatedJson.japanese[0].reading;
  }
}

Tooltip.html = `
<div class="jisho-tooltip">
  <div class="jisho-tooltip-arrow">
    <div class="jisho-tooltip-arrow-inside"></div>
  </div>

  <div class="jisho-tooltip-loading">
    <div></div>
    <div></div>
    <div></div>
  </div>
 
  <div class="jisho-tooltip-body">
    <div class="error"></div>
    <div class="word-not-found"></div>
    <div class="japanese">
      <div class="reading"></div>
      <div class="word"></div>
    </div>
    <div class="english">
    </div>
  </div>
</div>
`

Tooltip.appendHTML = function () {
  $(document.body).append(this.html);
  Object.assign(Tooltip, {
    $tooltip: $('.jisho-tooltip'),
    $tooltipArrow: $('.jisho-tooltip .jisho-tooltip-arrow'),
    $tooltipLoading: $('.jisho-tooltip .jisho-tooltip-loading'),
    $tooltipBody: $('.jisho-tooltip .jisho-tooltip-body'),
    $tooltipBodyJapaneseReading: $('.jisho-tooltip .jisho-tooltip-body .japanese .reading'),
    $tooltipBodyJapaneseWord: $('.jisho-tooltip .jisho-tooltip-body .japanese .word'),
    $tooltipBodyEnglish: $('.jisho-tooltip .jisho-tooltip-body .english'),
    $tooltipBodyError: $('.jisho-tooltip .jisho-tooltip-body .error'),
    $tooltipBodyWordNotFound: $('.jisho-tooltip .jisho-tooltip-body .word-not-found'),
  })
  this.$tooltip.hide();
}

Tooltip.showLoading = function () {
  this.$tooltip.show();
  this.$tooltipLoading.show();
  this.$tooltipBody.hide();
}

Tooltip.hideLoading = function () {
  this.$tooltipLoading.hide();
}

Tooltip.hide = function () {
  this.$tooltip.hide();
}

Tooltip.resetTooltipBody = function () {
  this.$tooltipBodyJapaneseReading.html('');
  this.$tooltipBodyJapaneseWord.html('');
  this.$tooltipBodyEnglish.html('');
  this.$tooltipBodyError.html('');
  this.$tooltipBodyWordNotFound.html('');
}

Tooltip.setTooltipBodyHTML = function (tooltip) {
  this.$tooltipBodyError.html(tooltip.error);
  this.$tooltipBodyWordNotFound.html(tooltip.wordNotFound);
  this.$tooltipBodyEnglish.html(tooltip.englishHTML);

  if (tooltip.wordHTML) {
    this.$tooltipBodyJapaneseWord.html(tooltip.wordHTML);
    this.$tooltipBodyJapaneseReading.html(tooltip.readingHTML);
  } else {
    this.$tooltipBodyJapaneseWord.html(tooltip.readingHTML);
    this.$tooltipBodyJapaneseReading.html('');
  }
}

Tooltip.showBody = function (tooltip) {
  this.hideLoading();
  this.resetTooltipBody();
  this.setTooltipBodyHTML(tooltip)
  this.$tooltipBody.show();
}

Tooltip.setTooltipPosition = function (tooltip) {
  this.$tooltip.css(tooltip.tooltipVerticalPosition);
  this.$tooltip.css(tooltip.tooltipHorizontalPostion);
}

Tooltip.setTooltipArrowPosition = function (tooltip) {
  let arrowPostiton = {
    left: tooltip.arrowHorizontalRelativeDistance,
    right: 'auto'
  };
  if (!tooltip.isArrowInTheLeftSide) {
    arrowPostiton = {
      left: 'auto',
      right: tooltip.arrowHorizontalRelativeDistance
    }
  }
  this.$tooltipArrow.css(arrowPostiton);
}
