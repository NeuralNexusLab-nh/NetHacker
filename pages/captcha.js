function create (func) {
  var box = document.createElement("div");
  box.className = "captcha-box";
  box.id = "captcha";
  document.body.appendChild(box);
  
  document.getElementById("captcha").innerHTML += '<p class="captcha-p">NetHacker CAPTCHA</p>';
  random = Math.floor(Math.random() * 9999);
  document.getElementById("captcha").innerHTML += `<p style="user-select: none; color=blue" id="noCopy">${random}</p>`;
  document.getElementById("captcha").innerHTML += '<br><input style="" id="captchaInput" placeholder="input number">'
  document.getElementById("captcha").innerHTML += '<button id="captchaBtn">

  
