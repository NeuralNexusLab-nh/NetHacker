(function () {
  const container = document.createElement("div");
  container.style.backgroundColor = "black";
  container.style.color = "green";
  container.style.padding = "10px";
  container.style.fontFamily = "monospace";

  const text = document.createElement("p");
  text.textContent = "NetHacker: The Best Red Team Engineer.";

  const link = document.createElement("a");
  link.href = "https://nethacker.cloud";
  link.textContent = "https://nethacker.cloud";
  link.style.color = "green";
  link.target = "_blank";

  container.appendChild(text);
  container.appendChild(link);
  document.body.appendChild(container);
})();
