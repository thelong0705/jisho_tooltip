chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message  === "clicked_browser_action"){
      var text = "";
      if (window.getSelection) {
          text = window.getSelection().toString();
      } else if (document.selection && document.selection.type != "Control") {
          text = document.selection.createRange().text;
      }
      chrome.runtime.sendMessage({"message": "open_new_tab", "text": text});  
    }
  }
);