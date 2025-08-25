function create (func) {
  var content = document.createElement("div");
  content.className = "captcha-div";

  var text = document.createElement("p");
  text.className = "captcha-p";
  text.textContent("input the number to verify");

  var input = document.createElement("input");
  input.className = "captcha-input";
  input.type = "number";
  input.placeholder = "number here";

  
