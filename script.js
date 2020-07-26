$(document).ready(function () {
  Tooltip.appendHTML();
});

document.onkeydown = function (event) {
  if (event.keyCode == 68) { // d button's keycode 
    showTooltip();
  }
}

document.onmousedown = function () {
  Tooltip.hide();
}

async function showTooltip() {
  let selection = document.getSelection();
  let tooltip = new Tooltip(selection);
  if (!tooltip.selectionString) return;
  Tooltip.setTooltipPosition(tooltip);
  Tooltip.setTooltipArrowPosition(tooltip);
  Tooltip.showLoading();
  await tooltip.setTooltipContent();
  Tooltip.showBody(tooltip)
}
