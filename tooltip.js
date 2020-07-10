$(document.body).append('<div class="translate"></div>');

document.onmouseup = function () {
  let selection = document.getSelection();
  let selectionString = selection.toString().trim();
  if (selectionString) {
    let { x, y, width, height } = selection.getRangeAt(0).getBoundingClientRect()
    console.log(x, y, width, height)
    $('.translate').css('top', y + height);
    $('.translate').css('left', x);
    $('.translate').css('width', width);
    $('.translate').css('height', height);
    $('.translate').css('z-index', 999);
    $('.translate').show();
    $('.translate').html(`${selectionString}`)
  }
};

document.onmousedown = function () {
  $('.translate').hide();
}
