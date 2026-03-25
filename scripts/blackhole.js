const sterren = document.querySelectorAll("div");

sterren.forEach((ster) => {
  ster.style.setProperty("--dur", Math.random());
  ster.style.setProperty("--del", Math.random());
  ster.style.setProperty("--r", Math.random());
  ster.style.setProperty("--trans", Math.random());
  ster.style.setProperty("--length", Math.random());
});
